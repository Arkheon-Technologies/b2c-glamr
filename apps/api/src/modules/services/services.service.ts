import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { ListServicesDto } from './dto/list-services.dto';

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
}
