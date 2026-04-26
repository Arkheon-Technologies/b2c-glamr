import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID, createHmac } from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwner(businessId: string, ownerId: string) {
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!biz) throw new NotFoundException({ ok: false, error: { code: 'BIZ_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (biz.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });
  }

  async listWebhooks(businessId: string, ownerId: string) {
    await this.assertOwner(businessId, ownerId);
    const webhooks = await this.prisma.webhook.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, events: true, active: true, createdAt: true },
    });
    return { ok: true, data: { webhooks } };
  }

  async createWebhook(
    businessId: string,
    ownerId: string,
    url: string,
    events: string[],
  ) {
    await this.assertOwner(businessId, ownerId);
    const secret = `wh_${randomUUID().replace(/-/g, '')}`;
    const webhook = await this.prisma.webhook.create({
      data: { businessId, url, secret, events },
      select: { id: true, url: true, events: true, active: true, secret: true, createdAt: true },
    });
    return { ok: true, data: { webhook } };
  }

  async updateWebhook(
    webhookId: string,
    ownerId: string,
    payload: { url?: string; events?: string[]; active?: boolean },
  ) {
    const existing = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook not found', request_id: randomUUID() } });
    if (existing.business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });

    const webhook = await this.prisma.webhook.update({
      where: { id: webhookId },
      data: {
        ...(payload.url ? { url: payload.url } : {}),
        ...(payload.events ? { events: payload.events } : {}),
        ...(payload.active !== undefined ? { active: payload.active } : {}),
      },
      select: { id: true, url: true, events: true, active: true, createdAt: true },
    });
    return { ok: true, data: { webhook } };
  }

  async deleteWebhook(webhookId: string, ownerId: string) {
    const existing = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook not found', request_id: randomUUID() } });
    if (existing.business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });
    await this.prisma.webhook.delete({ where: { id: webhookId } });
    return { ok: true, data: { deleted: true } };
  }

  async listDeliveries(webhookId: string, ownerId: string) {
    const existing = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook not found', request_id: randomUUID() } });
    if (existing.business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });

    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, event: true, statusCode: true, attempt: true, deliveredAt: true, createdAt: true },
    });
    return { ok: true, data: { deliveries } };
  }

  /**
   * Dispatch a webhook event to all active endpoints for a business.
   * Called internally by other modules (booking created, etc.)
   */
  async dispatch(businessId: string, event: string, payload: object) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { businessId, active: true, events: { has: event } },
    });

    for (const wh of webhooks) {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const sig = createHmac('sha256', wh.secret).update(body).digest('hex');
      let statusCode: number | null = null;

      try {
        const res = await fetch(wh.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Glamr-Signature': `sha256=${sig}`,
            'X-Glamr-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });
        statusCode = res.status;
      } catch {
        statusCode = null;
      }

      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: wh.id,
          event,
          payload: payload as object,
          statusCode,
          deliveredAt: statusCode && statusCode < 300 ? new Date() : null,
        },
      });
    }
  }
}
