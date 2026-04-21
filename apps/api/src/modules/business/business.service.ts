import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DiscoverBusinessesDto } from './dto/discover-businesses.dto';

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
          select: {
            city: true,
            neighborhood: true,
            countryCode: true,
          },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            services: true,
            staffMembers: true,
          },
        },
      },
    });

    return {
      ok: true,
      data: {
        businesses: businesses.map((business) => ({
          id: business.id,
          name: business.name,
          slug: business.slug,
          description: business.description,
          verticals: business.verticals,
          plan_tier: business.planTier,
          is_verified: business.isVerified,
          total_bookings: business.totalBookings,
          logo_url: business.logoUrl,
          cover_image_url: business.coverImageUrl,
          location: business.locations[0] ?? null,
          services_count: business._count.services,
          staff_count: business._count.staffMembers,
        })),
      },
      meta: {
        total: businesses.length,
      },
    };
  }
}
