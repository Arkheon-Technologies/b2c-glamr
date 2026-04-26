import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all threads for a business, enriched with customer name + last message */
  async listThreads(businessId: string, ownerId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });
    if (!business) throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const threads = await this.prisma.messageThread.findMany({
      where: { businessId },
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Batch-fetch customer names
    const customerIds = [...new Set(threads.map((t) => t.customerId))];
    const customers = customerIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: customerIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [];
    const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

    // Batch-fetch linked appointment names
    const apptIds = threads.map((t) => t.appointmentId).filter(Boolean) as string[];
    const appointments = apptIds.length
      ? await this.prisma.appointment.findMany({
          where: { id: { in: apptIds } },
          select: { id: true, startAt: true, service: { select: { name: true } } },
        })
      : [];
    const apptMap = Object.fromEntries(appointments.map((a) => [a.id, a]));

    return {
      ok: true,
      data: {
        threads: threads.map((t) => {
          const customer = customerMap[t.customerId];
          const lastMsg = t.messages[0] ?? null;
          const appt = t.appointmentId ? apptMap[t.appointmentId] : null;
          const unread = lastMsg?.senderKind === 'customer' && !lastMsg?.readAt;
          return {
            id: t.id,
            customer_id: t.customerId,
            customer_name: customer?.fullName ?? customer?.email ?? 'Client',
            customer_email: customer?.email ?? null,
            business_id: t.businessId,
            appointment_id: t.appointmentId ?? null,
            appointment_label: appt
              ? `${appt.service?.name ?? 'Booking'} — ${new Date(appt.startAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`
              : null,
            last_message: lastMsg
              ? { body: lastMsg.body, sender_kind: lastMsg.senderKind, created_at: lastMsg.createdAt }
              : null,
            unread,
            last_message_at: t.lastMessageAt,
            created_at: t.createdAt,
          };
        }),
      },
      meta: { total: threads.length },
    };
  }

  /** Get all messages in a thread */
  async getThread(threadId: string, ownerId: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!thread) throw new NotFoundException({ ok: false, error: { code: 'THREAD_NOT_FOUND', message: 'Thread not found', request_id: randomUUID() } });

    // Verify caller owns the business
    const business = await this.prisma.business.findUnique({
      where: { id: thread.businessId },
      select: { ownerId: true },
    });
    if (business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    // Mark unread customer messages as read
    await this.prisma.message.updateMany({
      where: { threadId, senderKind: 'customer', readAt: null },
      data: { readAt: new Date() },
    });

    const customer = await this.prisma.user.findUnique({
      where: { id: thread.customerId },
      select: { id: true, fullName: true, email: true },
    });

    return {
      ok: true,
      data: {
        thread: {
          id: thread.id,
          customer_id: thread.customerId,
          customer_name: customer?.fullName ?? customer?.email ?? 'Client',
          business_id: thread.businessId,
          appointment_id: thread.appointmentId,
          messages: thread.messages.map((m) => ({
            id: m.id,
            body: m.body,
            sender_kind: m.senderKind,
            sender_user_id: m.senderUserId,
            read_at: m.readAt,
            created_at: m.createdAt,
          })),
        },
      },
    };
  }

  /** Send a message as staff */
  async sendMessage(threadId: string, ownerId: string, body: string) {
    const thread = await this.prisma.messageThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException({ ok: false, error: { code: 'THREAD_NOT_FOUND', message: 'Thread not found', request_id: randomUUID() } });

    const business = await this.prisma.business.findUnique({
      where: { id: thread.businessId },
      select: { ownerId: true },
    });
    if (business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const now = new Date();
    const message = await this.prisma.message.create({
      data: {
        threadId,
        senderKind: 'staff',
        senderUserId: ownerId,
        body,
      },
    });

    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: now },
    });

    return {
      ok: true,
      data: {
        message: {
          id: message.id,
          body: message.body,
          sender_kind: message.senderKind,
          created_at: message.createdAt,
        },
      },
    };
  }

  /** Create a new thread for a business ↔ customer, optionally linked to an appointment */
  async createThread(businessId: string, ownerId: string, customerId: string, appointmentId?: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!business) throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    // Return existing thread if one already exists for this customer+business pair
    const existing = await this.prisma.messageThread.findFirst({
      where: { businessId, customerId },
      orderBy: { lastMessageAt: 'desc' },
    });
    if (existing) return { ok: true, data: { thread: { id: existing.id } } };

    const thread = await this.prisma.messageThread.create({
      data: { businessId, customerId, appointmentId: appointmentId ?? null },
    });
    return { ok: true, data: { thread: { id: thread.id } } };
  }
}
