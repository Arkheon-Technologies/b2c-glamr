import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import type { AvailableSlot } from '@glamr/shared-types';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(query: AvailabilityQueryDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: query.service_id },
      select: {
        id: true,
        name: true,
        currency: true,
        priceCents: true,
        priceMaxCents: true,
        durationActiveMin: true,
        durationProcessingMin: true,
        durationFinishMin: true,
        serviceStaff: {
          select: {
            staff: {
              select: {
                id: true,
                displayName: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          request_id: randomUUID(),
        },
      });
    }

    const staffPool = service.serviceStaff
      .map((entry) => entry.staff)
      .filter((staff) => staff.isActive)
      .filter((staff) => !query.staff_id || staff.id === query.staff_id);

    if (!staffPool.length) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'SCHEDULING_STAFF_UNAVAILABLE',
          message: 'No active staff found for this service',
          request_id: randomUUID(),
        },
      });
    }

    const slotDate = this.resolveSlotDate(query.date);
    const dayWindow = this.buildDayWindow(slotDate);
    const totalDurationMin =
      service.durationActiveMin +
      service.durationProcessingMin +
      service.durationFinishMin;

    if (totalDurationMin <= 0) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'SCHEDULING_SERVICE_DURATION_INVALID',
          message: 'Service duration is invalid',
          request_id: randomUUID(),
        },
      });
    }

    const busyAppointments = await this.prisma.appointment.findMany({
      where: {
        staffId: { in: staffPool.map((staff) => staff.id) },
        startAt: { lt: dayWindow.end },
        endAt: { gt: dayWindow.start },
        status: {
          notIn: ['cancelled_by_customer', 'cancelled_by_business', 'no_show'],
        },
      },
      select: {
        staffId: true,
        startAt: true,
        endAt: true,
      },
      orderBy: { startAt: 'asc' },
    });

    const busyByStaff = new Map<string, Array<{ startAt: Date; endAt: Date }>>();
    for (const appointment of busyAppointments) {
      const list = busyByStaff.get(appointment.staffId) ?? [];
      list.push({ startAt: appointment.startAt, endAt: appointment.endAt });
      busyByStaff.set(appointment.staffId, list);
    }

    const slotIntervalMin = query.slot_interval_min ?? 30;
    const limit = query.limit ?? 20;
    const slots: AvailableSlot[] = [];

    for (const staff of staffPool) {
      const staffBusy = busyByStaff.get(staff.id) ?? [];
      const latestSlotStart = dayWindow.end.getTime() - totalDurationMin * 60_000;

      for (
        let cursor = dayWindow.start.getTime();
        cursor <= latestSlotStart;
        cursor += slotIntervalMin * 60_000
      ) {
        if (slots.length >= limit) {
          break;
        }

        const startAt = new Date(cursor);
        const endAt = new Date(cursor + totalDurationMin * 60_000);

        const conflicts = staffBusy.some(
          (appointment) => startAt < appointment.endAt && endAt > appointment.startAt,
        );

        if (conflicts) {
          continue;
        }

        let phaseStartCursor = startAt.getTime();
        const phases: AvailableSlot['phases'] = [];

        if (service.durationActiveMin > 0) {
          const phaseEnd = phaseStartCursor + service.durationActiveMin * 60_000;
          phases.push({
            phase: 'active',
            startAt: new Date(phaseStartCursor).toISOString(),
            endAt: new Date(phaseEnd).toISOString(),
            technicianRequired: true,
          });
          phaseStartCursor = phaseEnd;
        }

        if (service.durationProcessingMin > 0) {
          const phaseEnd = phaseStartCursor + service.durationProcessingMin * 60_000;
          phases.push({
            phase: 'processing',
            startAt: new Date(phaseStartCursor).toISOString(),
            endAt: new Date(phaseEnd).toISOString(),
            technicianRequired: false,
          });
          phaseStartCursor = phaseEnd;
        }

        if (service.durationFinishMin > 0) {
          const phaseEnd = phaseStartCursor + service.durationFinishMin * 60_000;
          phases.push({
            phase: 'finish',
            startAt: new Date(phaseStartCursor).toISOString(),
            endAt: new Date(phaseEnd).toISOString(),
            technicianRequired: true,
          });
        }

        slots.push({
          staffId: staff.id,
          staffName: staff.displayName,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          phases,
          priceCents: service.priceCents ?? service.priceMaxCents ?? 0,
          currency: service.currency,
          available: true,
        });
      }

      if (slots.length >= limit) {
        break;
      }
    }

    return {
      ok: true,
      data: {
        service_id: service.id,
        service_name: service.name,
        date: slotDate.toISOString().slice(0, 10),
        slots,
      },
      meta: {
        total: slots.length,
      },
    };
  }

  async setSchedule(ownerId: string, dto: SetScheduleDto) {
    // Verify the staff member belongs to a business owned by this user
    const staffMember = await this.prisma.staffMember.findUnique({
      where: { id: dto.staffId },
      select: { business: { select: { ownerId: true, id: true } } },
    });

    if (!staffMember) {
      throw new NotFoundException({ ok: false, error: { code: 'STAFF_NOT_FOUND', message: 'Staff member not found', request_id: randomUUID() } });
    }
    if (staffMember.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SCHEDULE_ACCESS_DENIED', message: 'You do not own this business', request_id: randomUUID() } });
    }

    // Delete existing working-hours entry for this day (isBreak=false means working hours)
    await this.prisma.schedule.deleteMany({
      where: {
        schedulableType: 'staff',
        schedulableId: dto.staffId,
        dayOfWeek: dto.dayOfWeek,
        isBreak: false,
      },
    });

    const isOpen = dto.isOpen ?? true;

    if (isOpen) {
      // Create new working-hours entry
      await this.prisma.schedule.create({
        data: {
          schedulableType: 'staff',
          schedulableId: dto.staffId,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.openTime,
          endTime: dto.closeTime,
          isBreak: false,
        },
      });
    }

    return {
      ok: true,
      data: {
        schedule: {
          staffId: dto.staffId,
          businessId: staffMember.business!.id,
          dayOfWeek: dto.dayOfWeek,
          openTime: dto.openTime,
          closeTime: dto.closeTime,
          isOpen,
        },
      },
    };
  }

  async getStaffSchedule(staffId: string, ownerId: string) {
    const staffMember = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
      select: { business: { select: { ownerId: true, id: true } } },
    });

    if (!staffMember) {
      throw new NotFoundException({ ok: false, error: { code: 'STAFF_NOT_FOUND', message: 'Staff member not found', request_id: randomUUID() } });
    }
    if (staffMember.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SCHEDULE_ACCESS_DENIED', message: 'You do not own this business', request_id: randomUUID() } });
    }

    // Fetch working-hours entries (isBreak=false) for this staff member
    const existingSchedules = await this.prisma.schedule.findMany({
      where: {
        schedulableType: 'staff',
        schedulableId: staffId,
        isBreak: false,
      },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });

    const scheduleMap = new Map(existingSchedules.map((s) => [s.dayOfWeek, s]));

    // Return all 7 days, filling defaults for missing ones
    const fullWeek = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const existing = scheduleMap.get(dayOfWeek);
      return {
        staffId,
        businessId: staffMember.business!.id,
        dayOfWeek,
        openTime: existing?.startTime ?? '09:00',
        closeTime: existing?.endTime ?? '18:00',
        isOpen: !!existing || false, // has an entry = is open
      };
    });

    return { ok: true, data: { schedule: fullWeek } };
  }

  private resolveSlotDate(dateValue?: string) {
    if (!dateValue) {
      return new Date();
    }

    const parsed = new Date(`${dateValue}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'SCHEDULING_DATE_INVALID',
          message: 'Invalid date format. Use YYYY-MM-DD.',
          request_id: randomUUID(),
        },
      });
    }

    return parsed;
  }

  private buildDayWindow(date: Date) {
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 9, 0, 0, 0),
    );
    const end = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 17, 0, 0, 0),
    );

    return { start, end };
  }
}
