import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Simple in-memory cache for featured results
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

function makeCache<T>() {
  const store = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | null {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.data;
    },
    set(key: string, data: T, ttlMs: number) {
      store.set(key, { data, expiresAt: Date.now() + ttlMs });
    },
  };
}

@Injectable()
export class SearchService {
  private readonly featuredCache = makeCache<object[]>();

  constructor(private readonly prisma: PrismaService) {}

  // ─── Autocomplete ──────────────────────────────────────────────

  async autocomplete(q: string) {
    const term = q.trim();

    const [businesses, services] = await Promise.all([
      this.prisma.business.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
          isVerified: true,
        },
        select: { id: true, name: true, slug: true, logoUrl: true },
        take: 5,
        orderBy: { totalBookings: 'desc' },
      }),
      this.prisma.service.findMany({
        where: {
          name: { contains: term, mode: 'insensitive' },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          vertical: { select: { slug: true, name: true } },
        },
        take: 5,
      }),
    ]);

    // Static Romania launch neighborhoods
    const allNeighborhoods = [
      'Floreasca', 'Dorobanți', 'Herăstrău', 'Aviatorilor', 'Decebal',
      'Pipera', 'Băneasa', 'Cotroceni', 'Universitate', 'Unirii',
      'Victoriei', 'Romană', 'Kiseleff', 'Tineretului', 'Militari',
    ];
    const neighborhoods = allNeighborhoods
      .filter((n) => n.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 4);

    return {
      businesses: businesses.map((b) => ({
        id: b.id,
        label: b.name,
        slug: b.slug,
        logo_url: b.logoUrl,
        kind: 'business',
      })),
      services: services.map((s) => ({
        id: s.id,
        label: s.name,
        vertical: s.vertical?.slug ?? null,
        kind: 'service',
      })),
      neighborhoods: neighborhoods.map((n) => ({ label: n, kind: 'neighborhood' })),
    };
  }

  // ─── Featured ──────────────────────────────────────────────────

  async getFeatured() {
    const CACHE_KEY = 'featured';
    const cached = this.featuredCache.get(CACHE_KEY);
    if (cached) return cached;

    const businesses = await this.prisma.business.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverImageUrl: true,
        totalBookings: true,
        verticals: true,
        locations: {
          select: { city: true, neighborhood: true, countryCode: true },
          take: 1,
          where: { isPrimary: true },
        },
        reviews: {
          select: { ratingOverall: true },
        },
      },
      take: 20,
      orderBy: { totalBookings: 'desc' },
    });

    // Score = avg_rating * log(totalBookings + 1)
    const scored = businesses
      .map((b) => {
        const reviews = b.reviews as { ratingOverall: number }[];
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / reviews.length
            : 3;
        const score = avgRating * Math.log(b.totalBookings + 1);
        return { business: b, score };
      })
      .sort((a, z) => z.score - a.score)
      .slice(0, 4)
      .map(({ business: b }) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        logo_url: b.logoUrl,
        cover_image_url: b.coverImageUrl,
        verticals: b.verticals,
        total_bookings: b.totalBookings,
        location: b.locations[0]
          ? {
              city: b.locations[0].city,
              neighborhood: b.locations[0].neighborhood,
              countryCode: b.locations[0].countryCode,
            }
          : null,
      }));

    this.featuredCache.set(CACHE_KEY, scored, 10 * 60 * 1000); // 10 min
    return scored;
  }

  // ─── Trending ──────────────────────────────────────────────────

  async getTrending() {
    const rows = await this.prisma.trendingQuery.findMany({
      orderBy: { rank: 'asc' },
      take: 10,
    });

    return rows.map((r) => ({ slug: r.slug, label: r.label, rank: r.rank }));
  }
}
