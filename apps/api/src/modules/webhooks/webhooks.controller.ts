import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthReq = Request & { user: AuthenticatedUser };

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly svc: WebhooksService) {}

  /** GET /api/v1/webhooks/business/:businessId */
  @Get('business/:businessId')
  listWebhooks(@Req() req: AuthReq, @Param('businessId') businessId: string) {
    return this.svc.listWebhooks(businessId, req.user.sub);
  }

  /** POST /api/v1/webhooks/business/:businessId */
  @Post('business/:businessId')
  createWebhook(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.svc.createWebhook(businessId, req.user.sub, body.url, body.events ?? []);
  }

  /** PATCH /api/v1/webhooks/:webhookId */
  @Patch(':webhookId')
  updateWebhook(
    @Req() req: AuthReq,
    @Param('webhookId') webhookId: string,
    @Body() body: { url?: string; events?: string[]; active?: boolean },
  ) {
    return this.svc.updateWebhook(webhookId, req.user.sub, body);
  }

  /** DELETE /api/v1/webhooks/:webhookId */
  @Delete(':webhookId')
  deleteWebhook(@Req() req: AuthReq, @Param('webhookId') webhookId: string) {
    return this.svc.deleteWebhook(webhookId, req.user.sub);
  }

  /** GET /api/v1/webhooks/:webhookId/deliveries */
  @Get(':webhookId/deliveries')
  listDeliveries(@Req() req: AuthReq, @Param('webhookId') webhookId: string) {
    return this.svc.listDeliveries(webhookId, req.user.sub);
  }
}
