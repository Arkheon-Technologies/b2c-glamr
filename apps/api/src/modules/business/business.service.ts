import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DiscoverBusinessesDto } from './dto/discover-businesses.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { randomUUID } from 'crypto';

function notFound(message = 'Business not found') {
  return new NotFoundException({
    ok: false,
    error: { code: 'BUSINESS_NOT_FOUND', message, request_id: randomUUID() },
  });
}

function forbidden(message = 'You do not own this business') {
  return new ForbiddenException({
    ok: false,
    error: { code: 'BUSINESS_ACCESS_DENIED', message, request_id: randomUUID() },
  });
}

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async discover(params: DiscoverBusinessesDto) {
    const take = params.limit ?? 20;
    const query = params.query?.trim();
    const vertical = params.vertical?.trim();

    const businesses = await this.prisma.business.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { instagramHandle: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(vertical ? { verticals: { has: vertical } } : {}),
      },
      orderBy: [{ isVerified: 'desc' }, { totalBookings: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        verticals: true,
        planTier: true,
        isVerified: true,
        logoUrl: true,
        coverImageUrl: true,
        totalBookings: true,
        locations: {
          select: { city: true, neighborhood: true, countryCode: true },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
        _count: { select: { services: true, staffMembers: true } },
      },
    });

    return {
      ok: true,
      data: {
        businesses: businesses.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          description: b.description,
          verticals: b.verticals,
          plan_tier: b.planTier,
          is_verified: b.isVerified,
          total_bookings: b.totalBookings,
          logo_url: b.logoUrl,
          cover_image_url: b.coverImageUrl,
          location: b.locations[0] ?? null,
          services_count: b._count.services,
          staff_count: b._count.staffMembers,
        })),
      },
      meta: { total: businesses.length },
    };
  }

  async createBusiness(ownerId: string, dto: CreateBusinessDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + randomUUID().slice(0, 6);

    const business = await this.prisma.business.create({
      data: {
        ownerId,
        name: dto.name,
        slug,
        businessType: dto.businessType as any,
        description: dto.about,
        ...(dto.verticalIds?.length ? { verticals: dto.verticalIds } : {}),
        locations: {
          create: {
            addressLine1: dto.address.line1,
            city: dto.address.city,
            countryCode: dto.address.countryCode,
            timezone: dto.address.timezone,
            latitude: dto.address.latitude ?? 0,
            longitude: dto.address.longitude ?? 0,
            isPrimary: true,
          },
        },
      },
      select: { id: true, name: true, slug: true, description: true, logoUrl: true, isVerified: true, totalBookings: true },
    });

    return {
      ok: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          about: business.description,
          logo_url: business.logoUrl,
          is_verified: business.isVerified,
          total_bookings: business.totalBookings,
        },
      },
    };
  }

  async getById(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverImageUrl: true,
        isVerified: true,
        totalBookings: true,
        ownerId: true,
        locations: {
          select: { id: true, city: true, neighborhood: true, addressLine1: true, countryCode: true, timezone: true },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
        services: {
          where: { isActive: true },
          select: { id: true, name: true, priceCents: true, currency: true, durationActiveMin: true },
        },
        staffMembers: {
          where: { isActive: true },
          select: { id: true, displayName: true, role: true },
        },
      },
    });

    if (!business) throw notFound();

    return {
      ok: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          about: business.description,
          logo_url: business.logoUrl,
          cover_image_url: business.coverImageUrl,
          is_verified: business.isVerified,
          total_bookings: business.totalBookings,
          owner_id: business.ownerId,
          location: business.locations[0] ?? null,
          services: business.services,
          staff: business.staffMembers,
        },
      },
    };
  }

  async updateBusiness(id: string, ownerId: string, dto: UpdateBusinessDto) {
    const existing = await this.prisma.business.findUnique({ where: { id }, select: { ownerId: true } });
    if (!existing) throw notFound();
    if (existing.ownerId !== ownerId) throw forbidden();

    const business = await this.prisma.business.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.about !== undefined ? { description: dto.about } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        ...(dto.verticalIds !== undefined ? { verticals: dto.verticalIds } : {}),
      },
      select: { id: true, name: true, slug: true, description: true, logoUrl: true, isVerified: true, totalBookings: true },
    });

    return {
      ok: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          about: business.description,
          logo_url: business.logoUrl,
          is_verified: business.isVerified,
          total_bookings: business.totalBookings,
        },
      },
    };
  }

  async getBusinessBookings(businessId: string, ownerId: string, status?: string) {
    const existing = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!existing) throw notFound();
    if (existing.ownerId !== ownerId) throw forbidden();

    const now = new Date();
    const where =
      status === 'upcoming'
        ? { startAt: { gte: now }, status: { notIn: ['cancelled_by_customer', 'cancelled_by_business', 'no_show'] as string[] } }
        : status === 'past'
        ? { OR: [{ startAt: { lt: now } }, { status: { in: ['cancelled_by_customer', 'cancelled_by_business', 'no_show', 'completed'] as string[] } }] }
        : {};

    const bookings = await this.prisma.appointment.findMany({
      where: { businessId, ...where },
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        guestName: true,
        customerId: true,
        customer: { select: { fullName: true, email: true } },
        service: { select: { id: true, name: true, priceCents: true, currency: true } },
        staff: { select: { id: true, displayName: true } },
      },
    });

    return {
      ok: true,
      data: {
        bookings: bookings.map((b) => ({
          id: b.id,
          start_at: b.startAt.toISOString(),
          end_at: b.endAt.toISOString(),
          status: b.status,
          customer_name: b.customer?.fullName ?? b.guestName ?? 'Guest',
          customer_email: b.customer?.email ?? null,
          service: b.service,
          staff: b.staff ? { id: b.staff.id, display_name: b.staff.displayName } : null,
        })),
      },
      meta: { total: bookings.length },
    };
  }

  async getPublicProfile(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverImageUrl: true,
        isVerified: true,
        totalBookings: true,
        locations: {
          select: { city: true, neighborhood: true, countryCode: true },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            priceMaxCents: true,
            currency: true,
            durationActiveMin: true,
            durationProcessingMin: true,
            durationFinishMin: true,
            vertical: { select: { slug: true, name: true } },
          },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        },
        staffMembers: {
          where: { isActive: true },
          select: {
            id: true,
            displayName: true,
            role: true,
            technicianProfile: { select: { avgRating: true } },
          },
        },
      },
    });

    if (!business) throw notFound('Business not found');

    return {
      ok: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          about: business.description,
          logo_url: business.logoUrl,
          cover_image_url: business.coverImageUrl,
          is_verified: business.isVerified,
          total_bookings: business.totalBookings,
          location: business.locations[0] ?? null,
          services: business.services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price_cents: s.priceCents,
            price_max_cents: s.priceMaxCents,
            currency: s.currency,
            duration_active_min: s.durationActiveMin,
            duration_processing_min: s.durationProcessingMin,
            duration_finish_min: s.durationFinishMin,
            vertical: s.vertical,
          })),
          staff: business.staffMembers.map((sm) => ({
            id: sm.id,
            display_name: sm.displayName,
            role: sm.role,
            avg_rating: sm.technicianProfile?.avgRating ?? null,
          })),
        },
      },
    };
  }
}
