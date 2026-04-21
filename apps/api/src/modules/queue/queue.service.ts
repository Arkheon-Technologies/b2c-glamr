import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ListQueueDto } from './dto/list-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly activeStatuses: Array<UpdateQueueStatusDto['status']> = [
    'waiting',
    'notified',
    'serving',
  ];

  async listQueue(query: ListQueueDto) {
    const take = query.limit ?? 100;

    const entries = await this.prisma.walkInQueue.findMany({
      where: {
        businessId: query.business_id,
        ...(query.location_id ? { locationId: query.location_id } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: [
        { position: 'asc' },
        { joinedAt: 'asc' },
      ],
      take,
      select: {
        id: true,
        businessId: true,
        locationId: true,
        customerName: true,
        phone: true,
        customerId: true,
        serviceId: true,
        staffPreference: true,
        position: true,
        estimatedWaitMin: true,
        joinedAt: true,
        notifiedAt: true,
        servedAt: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ok: true,
      data: {
        entries: entries.map((entry) => ({
          id: entry.id,
          business_id: entry.businessId,
          location_id: entry.locationId,
          customer_name: entry.customerName,
          phone: entry.phone,
          customer_id: entry.customerId,
          service_id: entry.serviceId,
          service_name: entry.service?.name ?? null,
          staff_preference: entry.staffPreference,
          position: entry.position,
          estimated_wait_min: entry.estimatedWaitMin,
          joined_at: entry.joinedAt.toISOString(),
          notified_at: entry.notifiedAt?.toISOString() ?? null,
          served_at: entry.servedAt?.toISOString() ?? null,
          status: entry.status,
        })),
      },
      meta: {
        total: entries.length,
      },
    };
  }

  async joinQueue(payload: JoinQueueDto) {
    const locationId = await this.resolveLocationId(payload.business_id, payload.location_id);

    if (payload.service_id) {
      const service = await this.prisma.service.findFirst({
        where: {
          id: payload.service_id,
          businessId: payload.business_id,
          isActive: true,
          OR: [{ locationId: null }, { locationId }],
        },
        select: { id: true },
      });

      if (!service) {
        throw new BadRequestException({
          ok: false,
          error: {
            code: 'QUEUE_SERVICE_INVALID',
            message: 'Selected service is not available for this location',
            request_id: randomUUID(),
          },
        });
      }
    }

    const activeCount = await this.prisma.walkInQueue.count({
      where: {
        businessId: payload.business_id,
        locationId,
        status: { in: this.activeStatuses },
      },
    });

    const position = activeCount + 1;

    const entry = await this.prisma.walkInQueue.create({
      data: {
        businessId: payload.business_id,
        locationId,
        customerName: payload.customer_name.trim(),
        phone: payload.phone?.trim(),
        customerId: payload.customer_id,
        serviceId: payload.service_id,
        staffPreference: payload.staff_preference,
        position,
        estimatedWaitMin: Math.max(position - 1, 0) * 15,
        status: 'waiting',
      },
      select: {
        id: true,
        businessId: true,
        locationId: true,
        customerName: true,
        position: true,
        estimatedWaitMin: true,
        status: true,
        joinedAt: true,
      },
    });

    return {
      ok: true,
      data: {
        entry: {
          id: entry.id,
          business_id: entry.businessId,
          location_id: entry.locationId,
          customer_name: entry.customerName,
          position: entry.position,
          estimated_wait_min: entry.estimatedWaitMin,
          status: entry.status,
          joined_at: entry.joinedAt.toISOString(),
        },
      },
    };
  }

  async updateStatus(entryId: string, status: UpdateQueueStatusDto['status']) {
    const existing = await this.prisma.walkInQueue.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        businessId: true,
        locationId: true,
        customerName: true,
        position: true,
        estimatedWaitMin: true,
        status: true,
        notifiedAt: true,
        servedAt: true,
        joinedAt: true,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'QUEUE_ENTRY_NOT_FOUND',
          message: 'Queue entry not found',
          request_id: randomUUID(),
        },
      });
    }

    const updated = await this.prisma.walkInQueue.update({
      where: { id: entryId },
      data: {
        status,
        notifiedAt:
          status === 'notified'
            ? (existing.notifiedAt ?? new Date())
            : existing.notifiedAt,
        servedAt: status === 'served' ? new Date() : existing.servedAt,
      },
      select: {
        id: true,
        businessId: true,
        locationId: true,
        customerName: true,
        position: true,
        estimatedWaitMin: true,
        status: true,
        notifiedAt: true,
        servedAt: true,
        joinedAt: true,
      },
    });

    await this.reindexActiveQueue(updated.businessId, updated.locationId);

    return {
      ok: true,
      data: {
        entry: {
          id: updated.id,
          business_id: updated.businessId,
          location_id: updated.locationId,
          customer_name: updated.customerName,
          position: updated.position,
          estimated_wait_min: updated.estimatedWaitMin,
          status: updated.status,
          joined_at: updated.joinedAt.toISOString(),
          notified_at: updated.notifiedAt?.toISOString() ?? null,
          served_at: updated.servedAt?.toISOString() ?? null,
        },
      },
    };
  }

  private async resolveLocationId(businessId: string, providedLocationId?: string) {
    if (providedLocationId) {
      const location = await this.prisma.businessLocation.findFirst({
        where: {
          id: providedLocationId,
          businessId,
        },
        select: { id: true },
      });

      if (!location) {
        throw new NotFoundException({
          ok: false,
          error: {
            code: 'QUEUE_LOCATION_NOT_FOUND',
            message: 'Location not found for this business',
            request_id: randomUUID(),
          },
        });
      }

      return location.id;
    }

    const primaryLocation = await this.prisma.businessLocation.findFirst({
      where: { businessId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: { id: true },
    });

    if (!primaryLocation) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'QUEUE_LOCATION_REQUIRED',
          message: 'Business has no active location to join queue',
          request_id: randomUUID(),
        },
      });
    }

    return primaryLocation.id;
  }

  private async reindexActiveQueue(businessId: string, locationId: string) {
    const activeEntries = await this.prisma.walkInQueue.findMany({
      where: {
        businessId,
        locationId,
        status: { in: this.activeStatuses },
      },
      orderBy: [{ joinedAt: 'asc' }],
      select: {
        id: true,
      },
    });

    if (!activeEntries.length) {
      return;
    }

    await this.prisma.$transaction(
      activeEntries.map((entry, index) =>
        this.prisma.walkInQueue.update({
          where: { id: entry.id },
          data: {
            position: index + 1,
            estimatedWaitMin: index * 15,
          },
        }),
      ),
    );
  }
}
