import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

type Period = '7d' | '30d' | 'month' | 'last_month';

function periodRange(period: Period): { from: Date; to: Date; prevFrom: Date; prevTo: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  let from: Date;
  if (period === '7d') {
    from = new Date(to);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    from = new Date(to.getFullYear(), to.getMonth(), 1);
  } else if (period === 'last_month') {
    from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
    const lastDay = new Date(to.getFullYear(), to.getMonth(), 0);
    lastDay.setHours(23, 59, 59, 999);
    const prevFrom = new Date(to.getFullYear(), to.getMonth() - 2, 1);
    return { from, to: lastDay, prevFrom, prevTo: new Date(from.getTime() - 1) };
  } else {
    // 30d default
    from = new Date(to);
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
  }

  const prevTo = new Date(from.getTime() - 1);
  const diffMs = to.getTime() - from.getTime();
  const prevFrom = new Date(prevTo.getTime() - diffMs);

  return { from, to, prevFrom, prevTo };
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyOwner(businessId: string, ownerId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });
    if (!business) throw new NotFoundException({ ok: false, error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'ACCESS_DENIED', message: 'Access denied', request_id: randomUUID() } });
  }

  /** KPI summary: revenue, bookings, new clients, retention */
  async getSummary(businessId: string, ownerId: string, period: Period = '30d') {
    await this.verifyOwner(businessId, ownerId);
    const { from, to, prevFrom, prevTo } = periodRange(period);

    const CANCELLED = ['cancelled_by_customer', 'cancelled_by_business', 'no_show'];

    // Current period bookings
    const current = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { gte: from, lte: to }, status: { notIn: CANCELLED } },
      select: { customerId: true, service: { select: { priceCents: true } } },
    });

    // Previous period bookings
    const prev = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { gte: prevFrom, lte: prevTo }, status: { notIn: CANCELLED } },
      select: { customerId: true, service: { select: { priceCents: true } } },
    });

    // New clients in period (first-ever booking at this business)
    const allPrevCustomers = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { lt: from }, status: { notIn: CANCELLED } },
      select: { customerId: true },
      distinct: ['customerId'],
    });
    const existingCustomerIds = new Set(allPrevCustomers.map((a) => a.customerId));
    const currentCustomerIds = [...new Set(current.map((a) => a.customerId).filter(Boolean))] as string[];
    const newClients = currentCustomerIds.filter((id) => !existingCustomerIds.has(id)).length;

    // Retention: customers who also booked in prev period
    const prevCustomerIds = new Set(prev.map((a) => a.customerId).filter(Boolean));
    const returningClients = currentCustomerIds.filter((id) => prevCustomerIds.has(id ?? '')).length;
    const retentionPct = currentCustomerIds.length > 0
      ? Math.round((returningClients / currentCustomerIds.length) * 100)
      : 0;

    const revenue = current.reduce((sum, a) => sum + (a.service?.priceCents ?? 0), 0);
    const prevRevenue = prev.reduce((sum, a) => sum + (a.service?.priceCents ?? 0), 0);

    const revChange = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;
    const bookChange = prev.length > 0 ? Math.round(((current.length - prev.length) / prev.length) * 100) : null;

    return {
      ok: true,
      data: {
        revenue_cents: revenue,
        revenue_change_pct: revChange,
        bookings: current.length,
        bookings_change_pct: bookChange,
        new_clients: newClients,
        retention_pct: retentionPct,
        unique_clients: currentCustomerIds.length,
        period: { from: from.toISOString(), to: to.toISOString() },
      },
    };
  }

  /** Daily revenue series for the period */
  async getRevenueSeries(businessId: string, ownerId: string, period: Period = '30d') {
    await this.verifyOwner(businessId, ownerId);
    const { from, to } = periodRange(period);
    const CANCELLED = ['cancelled_by_customer', 'cancelled_by_business', 'no_show'];

    const appointments = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { gte: from, lte: to }, status: { notIn: CANCELLED } },
      select: { startAt: true, service: { select: { priceCents: true } } },
    });

    // Group by day
    const byDay: Record<string, number> = {};
    const current = new Date(from);
    while (current <= to) {
      byDay[current.toISOString().split('T')[0]] = 0;
      current.setDate(current.getDate() + 1);
    }
    for (const a of appointments) {
      const day = a.startAt.toISOString().split('T')[0];
      if (day in byDay) byDay[day] += a.service?.priceCents ?? 0;
    }

    return {
      ok: true,
      data: {
        series: Object.entries(byDay).map(([date, value]) => ({ date, value })),
      },
    };
  }

  /** Top services by bookings and revenue */
  async getTopServices(businessId: string, ownerId: string, period: Period = '30d') {
    await this.verifyOwner(businessId, ownerId);
    const { from, to } = periodRange(period);
    const CANCELLED = ['cancelled_by_customer', 'cancelled_by_business', 'no_show'];

    const appointments = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { gte: from, lte: to }, status: { notIn: CANCELLED } },
      select: { serviceId: true, service: { select: { name: true, priceCents: true } } },
    });

    const grouped: Record<string, { name: string; bookings: number; revenue: number }> = {};
    for (const a of appointments) {
      if (!a.serviceId) continue;
      if (!grouped[a.serviceId]) grouped[a.serviceId] = { name: a.service?.name ?? 'Service', bookings: 0, revenue: 0 };
      grouped[a.serviceId].bookings++;
      grouped[a.serviceId].revenue += a.service?.priceCents ?? 0;
    }

    const sorted = Object.values(grouped).sort((a, b) => b.bookings - a.bookings).slice(0, 10);

    return {
      ok: true,
      data: { services: sorted.map((s) => ({ name: s.name, bookings: s.bookings, revenue_cents: s.revenue })) },
    };
  }

  /** Peak hours utilisation heatmap (day-of-week × hour-of-day) */
  async getPeakHours(businessId: string, ownerId: string, period: Period = '30d') {
    await this.verifyOwner(businessId, ownerId);
    const { from, to } = periodRange(period);
    const CANCELLED = ['cancelled_by_customer', 'cancelled_by_business', 'no_show'];

    const appointments = await this.prisma.appointment.findMany({
      where: { businessId, startAt: { gte: from, lte: to }, status: { notIn: CANCELLED } },
      select: { startAt: true },
    });

    // day 0=Sun,1=Mon,…,6=Sat → remap to Mon=0..Sun=6
    const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
    for (const a of appointments) {
      const dow = (a.startAt.getDay() + 6) % 7; // Mon=0
      const hour = a.startAt.getHours();
      if (hour >= 8 && hour <= 19) {
        grid[dow][hour - 8]++;
      }
    }

    // Normalise to 0–100
    const maxVal = Math.max(...grid.flat(), 1);
    const normalised = grid.map((row) => row.map((v) => Math.round((v / maxVal) * 100)));

    return {
      ok: true,
      data: {
        heatmap: normalised,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        hours: ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
      },
    };
  }
}
