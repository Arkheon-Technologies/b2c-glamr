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

  // ─── Add-ons ──────────────────────────────────────────────────

  async listAddons(serviceId: string) {
    const addons = await this.prisma.serviceAddon.findMany({
      where: { serviceId },
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });
    return { ok: true, data: { addons } };
  }

  async createAddon(
    serviceId: string,
    ownerId: string,
    dto: { name: string; priceCents: number; durationMin?: number; description?: string },
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!service) throw new NotFoundException({ ok: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found', request_id: randomUUID() } });
    if (service.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const addon = await this.prisma.serviceAddon.create({
      data: { serviceId, name: dto.name, priceCents: dto.priceCents, durationMin: dto.durationMin ?? 0, description: dto.description },
    });
    return { ok: true, data: { addon } };
  }

  async updateAddon(
    addonId: string,
    ownerId: string,
    dto: { name?: string; priceCents?: number; durationMin?: number; isActive?: boolean; description?: string },
  ) {
    const existing = await this.prisma.serviceAddon.findUnique({
      where: { id: addonId },
      select: { service: { select: { business: { select: { ownerId: true } } } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'ADDON_NOT_FOUND', message: 'Add-on not found', request_id: randomUUID() } });
    if (existing.service?.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const addon = await this.prisma.serviceAddon.update({
      where: { id: addonId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.durationMin !== undefined ? { durationMin: dto.durationMin } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });
    return { ok: true, data: { addon } };
  }

  async deleteAddon(addonId: string, ownerId: string) {
    const existing = await this.prisma.serviceAddon.findUnique({
      where: { id: addonId },
      select: { service: { select: { business: { select: { ownerId: true } } } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'ADDON_NOT_FOUND', message: 'Add-on not found', request_id: randomUUID() } });
    if (existing.service?.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    await this.prisma.serviceAddon.delete({ where: { id: addonId } });
    return { ok: true, data: { deleted: true, id: addonId } };
  }

  // ─── Packages ─────────────────────────────────────────────────

  async listPackages(businessId: string) {
    const packages = await this.prisma.package.findMany({
      where: { businessId, isActive: true },
      include: { service: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, data: { packages } };
  }

  async createPackage(
    businessId: string,
    ownerId: string,
    dto: { serviceId: string; name: string; sessionCount: number; priceCents: number; validityDays?: number; description?: string; shareable?: boolean; currency?: string },
  ) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!business) throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const pkg = await this.prisma.package.create({
      data: {
        businessId,
        serviceId: dto.serviceId,
        name: dto.name,
        sessionCount: dto.sessionCount,
        priceCents: dto.priceCents,
        currency: dto.currency ?? 'RON',
        validityDays: dto.validityDays,
        description: dto.description,
        shareable: dto.shareable ?? false,
      },
      include: { service: { select: { id: true, name: true } } },
    });
    return { ok: true, data: { package: pkg } };
  }

  async updatePackage(
    pkgId: string,
    ownerId: string,
    dto: { name?: string; priceCents?: number; sessionCount?: number; validityDays?: number; isActive?: boolean; description?: string; shareable?: boolean },
  ) {
    const existing = await this.prisma.package.findUnique({
      where: { id: pkgId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'PACKAGE_NOT_FOUND', message: 'Package not found', request_id: randomUUID() } });
    if (existing.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const pkg = await this.prisma.package.update({
      where: { id: pkgId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.sessionCount !== undefined ? { sessionCount: dto.sessionCount } : {}),
        ...(dto.validityDays !== undefined ? { validityDays: dto.validityDays } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.shareable !== undefined ? { shareable: dto.shareable } : {}),
      },
      include: { service: { select: { id: true, name: true } } },
    });
    return { ok: true, data: { package: pkg } };
  }

  // ─── Seasonal / Discount rules ─────────────────────────────────

  async listDiscountRules(businessId: string) {
    const rules = await this.prisma.discountRule.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, data: { rules } };
  }

  async createDiscountRule(
    businessId: string,
    ownerId: string,
    dto: {
      name: string;
      ruleType: string;
      discountType: 'pct' | 'flat';
      discountValue: number;
      validFrom?: string;
      validTo?: string;
      conditions?: object;
      appliesTo?: object;
    },
  ) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!business) throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const rule = await this.prisma.discountRule.create({
      data: {
        businessId,
        name: dto.name,
        ruleType: dto.ruleType ?? 'seasonal',
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        priority: 10,
        conditions: (dto.conditions ?? {}) as any,
        appliesTo: (dto.appliesTo ?? { all_services: true }) as any,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });
    return { ok: true, data: { rule } };
  }

  async updateDiscountRule(
    ruleId: string,
    ownerId: string,
    dto: { name?: string; isActive?: boolean; discountValue?: number; validFrom?: string; validTo?: string },
  ) {
    const existing = await this.prisma.discountRule.findUnique({
      where: { id: ruleId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'RULE_NOT_FOUND', message: 'Rule not found', request_id: randomUUID() } });
    if (existing.business?.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });

    const rule = await this.prisma.discountRule.update({
      where: { id: ruleId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.discountValue !== undefined ? { discountValue: dto.discountValue } : {}),
        ...(dto.validFrom !== undefined ? { validFrom: new Date(dto.validFrom) } : {}),
        ...(dto.validTo !== undefined ? { validTo: new Date(dto.validTo) } : {}),
      },
    });
    return { ok: true, data: { rule } };
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
