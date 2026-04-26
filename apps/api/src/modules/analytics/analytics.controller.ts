import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };
type Period = '7d' | '30d' | 'month' | 'last_month';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('business/:businessId/summary')
  async getSummary(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.analyticsService.getSummary(businessId, req.user.sub, period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('business/:businessId/revenue-series')
  async getRevenueSeries(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.analyticsService.getRevenueSeries(businessId, req.user.sub, period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('business/:businessId/top-services')
  async getTopServices(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.analyticsService.getTopServices(businessId, req.user.sub, period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('business/:businessId/peak-hours')
  async getPeakHours(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.analyticsService.getPeakHours(businessId, req.user.sub, period);
  }
}
