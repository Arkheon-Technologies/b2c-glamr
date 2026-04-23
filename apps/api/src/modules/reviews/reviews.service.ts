import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusinessReviews(businessId: string, limit = 20, offset = 0) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { businessId, isFlagged: false },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          ratingOverall: true,
          ratingSkill: true,
          ratingClean: true,
          ratingValue: true,
          text: true,
          photoUrls: true,
          isVerified: true,
          businessResponse: true,
          businessResponseAt: true,
          createdAt: true,
          customer: { select: { fullName: true, avatarUrl: true } },
          technician: { select: { displayName: true } },
          appointment: { select: { service: { select: { name: true } } } },
        },
      }),
      this.prisma.review.count({ where: { businessId, isFlagged: false } }),
    ]);

    // Aggregate ratings
    const agg = await this.prisma.review.aggregate({
      where: { businessId, isFlagged: false },
      _avg: { ratingOverall: true, ratingSkill: true, ratingClean: true, ratingValue: true },
      _count: true,
    });

    return {
      ok: true,
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          rating_overall: r.ratingOverall,
          rating_skill: r.ratingSkill,
          rating_clean: r.ratingClean,
          rating_value: r.ratingValue,
          text: r.text,
          photo_urls: r.photoUrls,
          is_verified: r.isVerified,
          business_response: r.businessResponse,
          business_response_at: r.businessResponseAt?.toISOString() ?? null,
          created_at: r.createdAt.toISOString(),
          customer_name: r.customer.fullName,
          customer_avatar: r.customer.avatarUrl,
          technician_name: r.technician.displayName,
          service_name: r.appointment?.service?.name ?? null,
        })),
        summary: {
          total_reviews: agg._count,
          avg_overall: Number(agg._avg.ratingOverall ?? 0),
          avg_skill: Number(agg._avg.ratingSkill ?? 0),
          avg_clean: Number(agg._avg.ratingClean ?? 0),
          avg_value: Number(agg._avg.ratingValue ?? 0),
        },
      },
      meta: { total, limit, offset },
    };
  }

  async getReviewsBySlug(slug: string, limit = 20, offset = 0) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!business) {
      throw new NotFoundException({
        ok: false,
        error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() },
      });
    }
    return this.getBusinessReviews(business.id, limit, offset);
  }
}
