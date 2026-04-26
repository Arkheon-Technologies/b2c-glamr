import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async createBooking(payload: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: payload.service_id },
      select: {
        id: true,
        businessId: true,
        locationId: true,
        isActive: true,
        durationActiveMin: true,
        durationProcessingMin: true,
        durationFinishMin: true,
        serviceStaff: {
          select: {
            staffId: true,
            staff: {
              select: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!service || !service.isActive) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'BOOKING_SERVICE_NOT_FOUND',
          message: 'Service not found',
          request_id: randomUUID(),
        },
      });
    }

    const activeStaffIds = service.serviceStaff
      .filter((entry) => entry.staff.isActive)
      .map((entry) => entry.staffId);

    if (!activeStaffIds.length) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'BOOKING_STAFF_UNAVAILABLE',
          message: 'No active staff available for this service',
          request_id: randomUUID(),
        },
      });
    }

    const staffId = payload.staff_id ?? activeStaffIds[0];
    if (!activeStaffIds.includes(staffId)) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'BOOKING_STAFF_INVALID',
          message: 'Selected staff is not assigned to this service',
          request_id: randomUUID(),
        },
      });
    }

    const startAt = new Date(payload.start_at);
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'BOOKING_START_AT_INVALID',
          message: 'Invalid booking start_at datetime',
          request_id: randomUUID(),
        },
      });
    }

    const totalDurationMin =
      service.durationActiveMin +
      service.durationProcessingMin +
      service.durationFinishMin;

    if (totalDurationMin <= 0) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'BOOKING_DURATION_INVALID',
          message: 'Service duration is invalid',
          request_id: randomUUID(),
        },
      });
    }

    const endAt = new Date(startAt.getTime() + totalDurationMin * 60_000);

    const overlappingBooking = await this.prisma.appointment.findFirst({
      where: {
        staffId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        status: {
          notIn: ['cancelled_by_customer', 'cancelled_by_business', 'no_show'],
        },
      },
      select: {
        id: true,
      },
    });

    if (overlappingBooking) {
      throw new ConflictException({
        ok: false,
        error: {
          code: 'BOOKING_SLOT_UNAVAILABLE',
          message: 'Selected time slot is no longer available',
          request_id: randomUUID(),
        },
      });
    }

    const phases = this.buildPhases({
      appointmentStart: startAt,
      activeDurationMin: service.durationActiveMin,
      processingDurationMin: service.durationProcessingMin,
      finishDurationMin: service.durationFinishMin,
      staffId,
      appointmentEnd: endAt,
    });

    const appointment = await this.prisma.appointment.create({
      data: {
        businessId: service.businessId,
        locationId: service.locationId,
        serviceId: service.id,
        staffId,
        customerId: payload.customer_id,
        startAt,
        endAt,
        hasProcessingTime: service.durationProcessingMin > 0,
        status: 'confirmed',
        bookingSource: 'marketplace',
        guestName: payload.guest_name,
        guestEmail: payload.guest_email,
        guestPhone: payload.guest_phone,
        notes: payload.notes,
        idempotencyKey: payload.idempotency_key,
        phases: {
          create: phases,
        },
      },
      select: {
        id: true,
        businessId: true,
        serviceId: true,
        staffId: true,
        customerId: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    // Fire-and-forget confirmation email
    void this.sendConfirmationEmail(appointment.id, appointment.customerId, payload.guest_email ?? null, payload.guest_name ?? null);

    return {
      ok: true,
      data: {
        booking: {
          id: appointment.id,
          business_id: appointment.businessId,
          service_id: appointment.serviceId,
          staff_id: appointment.staffId,
          customer_id: appointment.customerId,
          start_at: appointment.startAt.toISOString(),
          end_at: appointment.endAt.toISOString(),
          status: appointment.status,
        },
      },
    };
  }

  private async sendConfirmationEmail(
    appointmentId: string,
    customerId: string | null | undefined,
    guestEmail: string | null,
    guestName: string | null,
  ) {
    try {
      const appt = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          startAt: true,
          endAt: true,
          service: { select: { name: true } },
          staff: { select: { displayName: true } },
          business: { select: { name: true } },
          customer: { select: { email: true, fullName: true } },
        },
      });

      if (!appt) return;

      const toEmail = appt.customer?.email ?? guestEmail;
      if (!toEmail) return;

      await this.email.sendBookingConfirmation({
        toEmail,
        toName: appt.customer?.fullName ?? guestName,
        bookingId: appointmentId,
        serviceName: appt.service?.name ?? 'Service',
        businessName: appt.business?.name ?? 'Studio',
        staffName: appt.staff?.displayName,
        startAt: appt.startAt,
        endAt: appt.endAt,
      });
    } catch {
      // Silently swallow — email is non-critical
    }
  }

  private async sendCancellationEmail(appointmentId: string) {
    try {
      const appt = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          startAt: true,
          endAt: true,
          guestEmail: true,
          guestName: true,
          service: { select: { name: true } },
          staff: { select: { displayName: true } },
          business: { select: { name: true } },
          customer: { select: { email: true, fullName: true } },
        },
      });

      if (!appt) return;

      const toEmail = appt.customer?.email ?? appt.guestEmail;
      if (!toEmail) return;

      await this.email.sendBookingCancellation({
        toEmail,
        toName: appt.customer?.fullName ?? appt.guestName,
        bookingId: appointmentId,
        serviceName: appt.service?.name ?? 'Service',
        businessName: appt.business?.name ?? 'Studio',
        staffName: appt.staff?.displayName,
        startAt: appt.startAt,
        endAt: appt.endAt,
      });
    } catch {
      // Silently swallow — email is non-critical
    }
  }

  async cancelBooking(id: string, reason?: CancelBookingDto['reason']) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        notes: true,
        startAt: true,
        endAt: true,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
          request_id: randomUUID(),
        },
      });
    }

    if (['cancelled_by_customer', 'cancelled_by_business'].includes(existing.status)) {
      return {
        ok: true,
        data: {
          booking: {
            id: existing.id,
            status: existing.status,
            start_at: existing.startAt.toISOString(),
            end_at: existing.endAt.toISOString(),
          },
        },
      };
    }

    const cancellationNote = reason?.trim();
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled_by_customer',
        notes: cancellationNote
          ? [existing.notes, `[cancel_reason] ${cancellationNote}`]
              .filter(Boolean)
              .join('\n')
          : existing.notes,
      },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
      },
    });

    // Fire-and-forget cancellation email
    void this.sendCancellationEmail(updated.id);

    return {
      ok: true,
      data: {
        booking: {
          id: updated.id,
          status: updated.status,
          start_at: updated.startAt.toISOString(),
          end_at: updated.endAt.toISOString(),
        },
      },
    };
  }

  async getMyBookings(userId: string, status?: 'upcoming' | 'past' | 'all') {
    const now = new Date();
    const whereStatus =
      status === 'upcoming'
        ? { startAt: { gte: now }, status: { notIn: ['cancelled_by_customer', 'cancelled_by_business', 'no_show'] as string[] } }
        : status === 'past'
        ? { OR: [{ startAt: { lt: now } }, { status: { in: ['cancelled_by_customer', 'cancelled_by_business', 'no_show', 'completed'] as string[] } }] }
        : {};

    const appointments = await this.prisma.appointment.findMany({
      where: {
        customerId: userId,
        ...whereStatus,
      },
      orderBy: { startAt: 'desc' },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        guestName: true,
        service: { select: { id: true, name: true, priceCents: true, currency: true } },
        staff: { select: { id: true, displayName: true } },
        business: { select: { id: true, name: true, slug: true } },
        location: { select: { city: true, addressLine1: true } },
      },
    });

    return {
      ok: true,
      data: {
        bookings: appointments.map((a) => ({
          id: a.id,
          start_at: a.startAt.toISOString(),
          end_at: a.endAt.toISOString(),
          status: a.status,
          service: a.service ? { id: a.service.id, name: a.service.name, price_cents: a.service.priceCents, currency: a.service.currency } : null,
          staff: a.staff ? { id: a.staff.id, display_name: a.staff.displayName } : null,
          business: a.business ? { id: a.business.id, name: a.business.name, slug: a.business.slug } : null,
          location: a.location ? { city: a.location.city, address: a.location.addressLine1 } : null,
        })),
      },
      meta: { total: appointments.length },
    };
  }

  async getBookingById(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        notes: true,
        customerId: true,
        guestName: true,
        guestEmail: true,
        service: { select: { id: true, name: true, priceCents: true, currency: true, durationActiveMin: true, durationProcessingMin: true, durationFinishMin: true } },
        staff: { select: { id: true, displayName: true } },
        business: { select: { id: true, name: true, slug: true } },
        location: { select: { city: true, addressLine1: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException({
        ok: false,
        error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() },
      });
    }

    if (appointment.customerId !== userId) {
      throw new ForbiddenException({
        ok: false,
        error: { code: 'BOOKING_ACCESS_DENIED', message: 'You do not have access to this booking', request_id: randomUUID() },
      });
    }

    return {
      ok: true,
      data: {
        booking: {
          id: appointment.id,
          start_at: appointment.startAt.toISOString(),
          end_at: appointment.endAt.toISOString(),
          status: appointment.status,
          notes: appointment.notes,
          service: appointment.service
            ? { id: appointment.service.id, name: appointment.service.name, price_cents: appointment.service.priceCents, currency: appointment.service.currency, duration_active_min: appointment.service.durationActiveMin, duration_processing_min: appointment.service.durationProcessingMin, duration_finish_min: appointment.service.durationFinishMin }
            : null,
          staff: appointment.staff ? { id: appointment.staff.id, display_name: appointment.staff.displayName } : null,
          business: appointment.business ? { id: appointment.business.id, name: appointment.business.name, slug: appointment.business.slug } : null,
          location: appointment.location ? { city: appointment.location.city, address: appointment.location.addressLine1 } : null,
        },
      },
    };
  }

  async cancelBookingAsCustomer(id: string, userId: string, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true, status: true, customerId: true, notes: true, startAt: true, endAt: true },
    });

    if (!appointment) {
      throw new NotFoundException({
        ok: false,
        error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() },
      });
    }

    if (appointment.customerId !== userId) {
      throw new ForbiddenException({
        ok: false,
        error: { code: 'BOOKING_ACCESS_DENIED', message: 'You do not have access to this booking', request_id: randomUUID() },
      });
    }

    return this.cancelBooking(id, reason);
  }

  async rescheduleBookingAsCustomer(id: string, userId: string, newStartAtStr: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true, customerId: true, serviceId: true, staffId: true, status: true },
    });

    if (!appointment) throw new NotFoundException({ ok: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() } });
    if (appointment.customerId !== userId) throw new ForbiddenException({ ok: false, error: { code: 'BOOKING_ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const service = await this.prisma.service.findUnique({
      where: { id: appointment.serviceId }
    });

    if (!service) throw new BadRequestException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });

    const startAt = new Date(newStartAtStr);
    const totalDurationMin = service.durationActiveMin + service.durationProcessingMin + service.durationFinishMin;
    const endAt = new Date(startAt.getTime() + totalDurationMin * 60_000);

    const phases = this.buildPhases({
      appointmentStart: startAt,
      appointmentEnd: endAt,
      activeDurationMin: service.durationActiveMin,
      processingDurationMin: service.durationProcessingMin,
      finishDurationMin: service.durationFinishMin,
      staffId: appointment.staffId
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      // Delete old phases
      await tx.appointmentPhase.deleteMany({ where: { appointmentId: id } });
      
      // Update appointment
      return tx.appointment.update({
        where: { id },
        data: {
          startAt,
          endAt,
          phases: {
            create: phases
          }
        },
        select: {
          id: true,
          status: true,
          startAt: true,
          endAt: true
        }
      });
    });

    return {
      ok: true,
      data: {
        booking: {
          id: updated.id,
          status: updated.status,
          start_at: updated.startAt.toISOString(),
          end_at: updated.endAt.toISOString(),
        }
      }
    };
  }

  async getReceipt(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        business: true
      }
    });

    if (!appointment) throw new NotFoundException({ ok: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() } });
    if (appointment.customerId !== userId) throw new ForbiddenException({ ok: false, error: { code: 'BOOKING_ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    return {
      ok: true,
      data: {
        receipt: {
          booking_id: id,
          business_name: appointment.business?.name ?? 'Business',
          service_name: appointment.service?.name ?? 'Service',
          total_cents: appointment.service?.priceCents ?? 0,
          currency: appointment.service?.currency ?? 'RON',
          tax_cents: appointment.service?.priceCents ? Math.floor(appointment.service.priceCents * 0.19) : 0,
          issued_at: new Date().toISOString()
        }
      }
    };
  }

  async updateStatusAsBusiness(id: string, ownerId: string, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        business: { select: { ownerId: true } }
      }
    });

    if (!appointment) throw new NotFoundException({ ok: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() } });
    if (appointment.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'BOOKING_ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
      }
    });

    return {
      ok: true,
      data: {
        booking: {
          id: updated.id,
          status: updated.status,
        }
      }
    };
  }

  private buildPhases(params: {
    appointmentStart: Date;
    appointmentEnd: Date;
    activeDurationMin: number;
    processingDurationMin: number;
    finishDurationMin: number;
    staffId: string;
  }) {
    const phases: Array<{
      phase: 'active' | 'processing' | 'finish';
      startAt: Date;
      endAt: Date;
      staffId: string;
      technicianRequired: boolean;
    }> = [];

    let cursor = params.appointmentStart.getTime();

    if (params.activeDurationMin > 0) {
      const end = cursor + params.activeDurationMin * 60_000;
      phases.push({
        phase: 'active',
        startAt: new Date(cursor),
        endAt: new Date(end),
        staffId: params.staffId,
        technicianRequired: true,
      });
      cursor = end;
    }

    if (params.processingDurationMin > 0) {
      const end = cursor + params.processingDurationMin * 60_000;
      phases.push({
        phase: 'processing',
        startAt: new Date(cursor),
        endAt: new Date(end),
        staffId: params.staffId,
        technicianRequired: false,
      });
      cursor = end;
    }

    if (params.finishDurationMin > 0) {
      const end = cursor + params.finishDurationMin * 60_000;
      phases.push({
        phase: 'finish',
        startAt: new Date(cursor),
        endAt: new Date(end),
        staffId: params.staffId,
        technicianRequired: true,
      });
      cursor = end;
    }

    if (!phases.length) {
      phases.push({
        phase: 'active',
        startAt: params.appointmentStart,
        endAt: params.appointmentEnd,
        staffId: params.staffId,
        technicianRequired: true,
      });
    }

    return phases;
  }

  // ─── Business reschedule (studio drag-drop) ───────────────────

  async rescheduleAsBusiness(
    id: string,
    ownerId: string,
    newStartAtStr: string,
    notifyClient = false,
    reason?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { business: { select: { ownerId: true } }, service: true },
    });

    if (!appointment) {
      throw new NotFoundException({ ok: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', request_id: randomUUID() } });
    }
    if (appointment.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'BOOKING_ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });
    }

    const service = appointment.service;
    if (!service) {
      throw new BadRequestException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });
    }

    const startAt = new Date(newStartAtStr);
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException({ ok: false, error: { code: 'INVALID_DATE', message: 'Invalid start_at datetime', request_id: randomUUID() } });
    }

    const totalDurationMin = service.durationActiveMin + service.durationProcessingMin + service.durationFinishMin;
    const endAt = new Date(startAt.getTime() + Math.max(totalDurationMin, 15) * 60_000);

    // Conflict check — exclude this appointment itself
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        id: { not: id },
        staffId: appointment.staffId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        status: { notIn: ['cancelled_by_customer', 'cancelled_by_business', 'no_show'] },
      },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException({
        ok: false,
        error: { code: 'BOOKING_SLOT_UNAVAILABLE', message: 'Selected time slot is not available', request_id: randomUUID() },
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.appointmentPhase.deleteMany({ where: { appointmentId: id } });
      const phases = this.buildPhases({
        appointmentStart: startAt,
        appointmentEnd: endAt,
        activeDurationMin: service.durationActiveMin,
        processingDurationMin: service.durationProcessingMin,
        finishDurationMin: service.durationFinishMin,
        staffId: appointment.staffId,
      });
      return tx.appointment.update({
        where: { id },
        data: {
          startAt,
          endAt,
          notes: reason
            ? [appointment.notes, `[reschedule_reason] ${reason}`].filter(Boolean).join('\n')
            : appointment.notes,
          phases: { create: phases },
        },
        select: { id: true, status: true, startAt: true, endAt: true },
      });
    });

    // Fire-and-forget notification when requested
    if (notifyClient) {
      void this.sendConfirmationEmail(updated.id, appointment.customerId ?? undefined, appointment.guestEmail ?? null, appointment.guestName ?? null);
    }

    return {
      ok: true,
      data: {
        booking: {
          id: updated.id,
          status: updated.status,
          start_at: updated.startAt.toISOString(),
          end_at: updated.endAt.toISOString(),
        },
      },
    };
  }

  // ─── Counter-proposal ──────────────────────────────────────────

  async sendCounter(appointmentId: string, staffUserId: string, startAtIso: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, businessId: true, endAt: true, startAt: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const proposedStart = new Date(startAtIso);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const counter = await this.prisma.bookingCounter.create({
      data: {
        appointmentId,
        proposedStartAt: proposedStart,
        token,
        expiresAt,
        status: 'pending',
      },
    });

    return { ok: true, data: { counter_id: counter.id, token, expires_at: expiresAt } };
  }

  async acceptCounter(token: string, customerId: string) {
    const counter = await this.prisma.bookingCounter.findUnique({ where: { token } });
    if (!counter || counter.status !== 'pending' || counter.expiresAt < new Date()) {
      throw new BadRequestException('Counter-proposal token is invalid or expired');
    }

    await this.prisma.$transaction([
      this.prisma.bookingCounter.update({ where: { token }, data: { status: 'accepted' } }),
      this.prisma.appointment.update({
        where: { id: counter.appointmentId },
        data: { startAt: counter.proposedStartAt, status: 'confirmed' },
      }),
    ]);

    return { ok: true, data: { accepted: true, appointment_id: counter.appointmentId } };
  }

  async declineCounter(token: string, customerId: string) {
    const counter = await this.prisma.bookingCounter.findUnique({ where: { token } });
    if (!counter) throw new NotFoundException('Counter not found');

    await this.prisma.$transaction([
      this.prisma.bookingCounter.update({ where: { token }, data: { status: 'declined' } }),
      this.prisma.appointment.update({
        where: { id: counter.appointmentId },
        data: { status: 'cancelled_by_customer' },
      }),
    ]);

    return { ok: true, data: { declined: true } };
  }
}
