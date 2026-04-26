import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async validateReviewToken(token: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { reviewToken: token },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        service: { select: { id: true, name: true } },
        staff: { select: { id: true, displayName: true } },
        business: { select: { id: true, name: true, slug: true } },
        review: { select: { id: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException({ ok: false, error: { code: 'INVALID_REVIEW_TOKEN', message: 'Review token not found or expired' } });
    }
    if (appointment.review) {
      throw new BadRequestException({ ok: false, error: { code: 'ALREADY_REVIEWED', message: 'This appointment has already been reviewed' } });
    }

    return {
      appointment_id: appointment.id,
      start_at: appointment.startAt,
      end_at: appointment.endAt,
      service: appointment.service,
      staff: appointment.staff,
      business: appointment.business,
    };
  }

  async submitReview(
    customerId: string,
    dto: { appointmentId: string; rating: number; body?: string; categoryScores?: Record<string, number>; photos?: string[] },
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      select: {
        id: true,
        businessId: true,
        staffId: true,
        customerId: true,
        review: { select: { id: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.review) throw new BadRequestException('Already reviewed');
    if (appointment.customerId !== customerId) throw new BadRequestException('Not your appointment');

    const review = await this.prisma.review.create({
      data: {
        appointmentId: dto.appointmentId,
        businessId: appointment.businessId,
        technicianId: appointment.staffId,
        customerId,
        ratingOverall: dto.rating,
        text: dto.body,
        categoryScores: dto.categoryScores ?? {},
        photoUrls: dto.photos ?? [],
        isVerified: true,
      },
    });

    return { id: review.id, created_at: review.createdAt };
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
