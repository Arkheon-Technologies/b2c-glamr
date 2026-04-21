import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

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
}
