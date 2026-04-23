import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        customerProfile: {
          select: {
            referralCode: true,
            totalBookings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          request_id: randomUUID(),
        },
      });
    }

    return {
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          created_at: user.createdAt.toISOString(),
          referral_code: user.customerProfile?.referralCode ?? null,
          total_bookings: user.customerProfile?.totalBookings ?? 0,
        },
      },
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    return {
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
        },
      },
    };
  }

  async getStats(userId: string) {
    const stats = await this.prisma.customerBusinessStat.findMany({
      where: { customerId: userId },
      include: {
        business: {
          select: { name: true, slug: true }
        }
      }
    });

    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    return {
      ok: true,
      data: {
        total_bookings: profile?.totalBookings ?? 0,
        businesses: stats.map(s => ({
          business_id: s.businessId,
          business_name: s.business.name,
          slug: s.business.slug,
          booking_count: s.bookingCount,
          total_spent_cents: s.totalSpentCents,
          loyalty_tier: s.loyaltyTier,
          is_vip: s.isVip,
          no_show_count: s.noShowCount
        }))
      }
    };
  }

  async updatePreferences(userId: string, preferences: Record<string, any>) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: preferences },
      select: { notificationPreferences: true }
    });

    return {
      ok: true,
      data: {
        preferences: user.notificationPreferences
      }
    };
  }
}
