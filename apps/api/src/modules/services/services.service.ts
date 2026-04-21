import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { ListServicesDto } from './dto/list-services.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListServicesDto) {
    const businessId = params.business_id?.trim();
    const vertical = params.vertical?.trim();
    const search = params.search?.trim();

    const services = await this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(businessId ? { businessId } : {}),
        ...(vertical ? { vertical: { slug: vertical } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        businessId: true,
        name: true,
        description: true,
        currency: true,
        priceType: true,
        priceCents: true,
        priceMaxCents: true,
        durationActiveMin: true,
        durationProcessingMin: true,
        durationFinishMin: true,
        patchTestRequired: true,
        consultationRequired: true,
        vertical: {
          select: {
            slug: true,
            name: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      ok: true,
      data: {
        services: services.map((service) => ({
          id: service.id,
          business_id: service.businessId,
          name: service.name,
          description: service.description,
          currency: service.currency,
          price_type: service.priceType,
          price_cents: service.priceCents,
          price_max_cents: service.priceMaxCents,
          duration_active_min: service.durationActiveMin,
          duration_processing_min: service.durationProcessingMin,
          duration_finish_min: service.durationFinishMin,
          patch_test_required: service.patchTestRequired,
          consultation_required: service.consultationRequired,
          vertical: service.vertical,
          business: service.business,
        })),
      },
      meta: {
        total: services.length,
      },
    };
  }

  async getById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        locationId: true,
        name: true,
        description: true,
        currency: true,
        priceType: true,
        priceCents: true,
        priceMaxCents: true,
        durationActiveMin: true,
        durationProcessingMin: true,
        durationFinishMin: true,
        patchTestRequired: true,
        consultationRequired: true,
        bookingNoticeHours: true,
        rebookingIntervalDays: true,
        photoUrls: true,
        vertical: {
          select: {
            slug: true,
            name: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
          },
        },
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

    if (!service || !service.business) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          request_id: randomUUID(),
        },
      });
    }

    return {
      ok: true,
      data: {
        service: {
          id: service.id,
          business_id: service.businessId,
          location_id: service.locationId,
          name: service.name,
          description: service.description,
          currency: service.currency,
          price_type: service.priceType,
          price_cents: service.priceCents,
          price_max_cents: service.priceMaxCents,
          duration_active_min: service.durationActiveMin,
          duration_processing_min: service.durationProcessingMin,
          duration_finish_min: service.durationFinishMin,
          patch_test_required: service.patchTestRequired,
          consultation_required: service.consultationRequired,
          booking_notice_hours: service.bookingNoticeHours,
          rebooking_interval_days: service.rebookingIntervalDays,
          photo_urls: service.photoUrls,
          vertical: service.vertical,
          business: service.business,
          staff: service.serviceStaff
            .map((entry) => entry.staff)
            .filter((staff) => staff.isActive),
        },
      },
    };
  }

  async createService(ownerId: string, dto: CreateServiceDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
      select: { ownerId: true, locations: { select: { id: true }, orderBy: { isPrimary: 'desc' }, take: 1 } },
    });

    if (!business) {
      throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    }
    if (business.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SERVICE_ACCESS_DENIED', message: 'You do not own this business', request_id: randomUUID() } });
    }

    const service = await this.prisma.service.create({
      data: {
        businessId: dto.businessId,
        locationId: business.locations[0]?.id ?? null,
        name: dto.name,
        description: dto.description,
        durationActiveMin: dto.durationActiveMin,
        durationProcessingMin: dto.durationProcessingMin ?? 0,
        durationFinishMin: dto.durationFinishMin ?? 0,
        priceCents: dto.priceCents,
        currency: dto.currency,
        priceType: dto.priceCents ? 'fixed' : 'consultation',
        ...(dto.verticalId ? { verticalId: dto.verticalId } : {}),
        photoUrls: dto.photoUrls ?? [],
        isActive: true,
      },
      select: { id: true, businessId: true, name: true, priceCents: true, currency: true, durationActiveMin: true, isActive: true },
    });

    return { ok: true, data: { service } };
  }

  async updateService(id: string, ownerId: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      select: { business: { select: { ownerId: true } } },
    });

    if (!existing) {
      throw new NotFoundException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });
    }
    if (existing.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SERVICE_ACCESS_DENIED', message: 'You do not own this service', request_id: randomUUID() } });
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.durationActiveMin !== undefined ? { durationActiveMin: dto.durationActiveMin } : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.photoUrls !== undefined ? { photoUrls: dto.photoUrls } : {}),
      },
      select: { id: true, businessId: true, name: true, priceCents: true, currency: true, durationActiveMin: true, isActive: true },
    });

    return { ok: true, data: { service } };
  }

  async deleteService(id: string, ownerId: string) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      select: { business: { select: { ownerId: true } } },
    });

    if (!existing) {
      throw new NotFoundException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });
    }
    if (existing.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SERVICE_ACCESS_DENIED', message: 'You do not own this service', request_id: randomUUID() } });
    }

    await this.prisma.service.update({ where: { id }, data: { isActive: false } });
    return { ok: true, data: { deleted: true, id } };
  }

  async assignStaff(serviceId: string, ownerId: string, staffIds: string[]) {
    const existing = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { business: { select: { ownerId: true } } },
    });

    if (!existing) {
      throw new NotFoundException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });
    }
    if (existing.business?.ownerId !== ownerId) {
      throw new ForbiddenException({ ok: false, error: { code: 'SERVICE_ACCESS_DENIED', message: 'You do not own this service', request_id: randomUUID() } });
    }

    // Upsert all provided staff assignments
    await this.prisma.serviceStaff.deleteMany({ where: { serviceId } });
    if (staffIds.length) {
      await this.prisma.serviceStaff.createMany({
        data: staffIds.map((staffId) => ({ serviceId, staffId })),
        skipDuplicates: true,
      });
    }

    return { ok: true, data: { assigned: staffIds.length } };
  }
}
