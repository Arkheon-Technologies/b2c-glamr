import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthReq = Request & { user: AuthenticatedUser };

@Controller('marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
  constructor(private readonly svc: MarketingService) {}

  /** GET /api/v1/marketing/business/:businessId/campaigns */
  @Get('business/:businessId/campaigns')
  listCampaigns(@Req() req: AuthReq, @Param('businessId') businessId: string) {
    return this.svc.listCampaigns(businessId, req.user.sub);
  }

  /** POST /api/v1/marketing/business/:businessId/campaigns */
  @Post('business/:businessId/campaigns')
  createCampaign(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Body() body: { name: string; segment?: object; channels?: string[]; scheduled_at?: string },
  ) {
    return this.svc.createCampaign(businessId, req.user.sub, {
      name: body.name,
      segment: body.segment,
      channels: body.channels,
      scheduledAt: body.scheduled_at,
    });
  }

  /** PATCH /api/v1/marketing/campaigns/:campaignId */
  @Patch('campaigns/:campaignId')
  updateCampaign(
    @Req() req: AuthReq,
    @Param('campaignId') campaignId: string,
    @Body() body: { name?: string; segment?: object; channels?: string[]; scheduled_at?: string | null; status?: string },
  ) {
    return this.svc.updateCampaign(campaignId, req.user.sub, {
      name: body.name,
      segment: body.segment,
      channels: body.channels,
      scheduledAt: body.scheduled_at,
      status: body.status,
    });
  }

  /** DELETE /api/v1/marketing/campaigns/:campaignId */
  @Delete('campaigns/:campaignId')
  deleteCampaign(@Req() req: AuthReq, @Param('campaignId') campaignId: string) {
    return this.svc.deleteCampaign(campaignId, req.user.sub);
  }

  /** GET /api/v1/marketing/business/:businessId/templates */
  @Get('business/:businessId/templates')
  listTemplates(@Req() req: AuthReq, @Param('businessId') businessId: string) {
    return this.svc.listTemplates(businessId, req.user.sub);
  }

  /** PUT /api/v1/marketing/business/:businessId/templates/:kind */
  @Post('business/:businessId/templates/:kind')
  upsertTemplate(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Param('kind') kind: string,
    @Body() body: { subject?: string; body_email?: string; body_sms?: string },
  ) {
    return this.svc.upsertTemplate(businessId, req.user.sub, kind, {
      subject: body.subject,
      bodyEmail: body.body_email,
      bodySms: body.body_sms,
    });
  }
}
