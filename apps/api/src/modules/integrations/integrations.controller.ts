import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthReq = Request & { user: AuthenticatedUser };

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly svc: IntegrationsService) {}

  /** GET /api/v1/integrations/business/:businessId */
  @Get('business/:businessId')
  listConnections(@Req() req: AuthReq, @Param('businessId') businessId: string) {
    return this.svc.listConnections(businessId, req.user.sub);
  }

  /** POST /api/v1/integrations/business/:businessId/:provider/connect */
  @Post('business/:businessId/:provider/connect')
  connectIntegration(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Param('provider') provider: string,
    @Body() body: { config?: object; tokens?: object },
  ) {
    return this.svc.connectIntegration(businessId, req.user.sub, provider, body);
  }

  /** DELETE /api/v1/integrations/business/:businessId/:provider */
  @Delete('business/:businessId/:provider')
  disconnectIntegration(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Param('provider') provider: string,
  ) {
    return this.svc.disconnectIntegration(businessId, req.user.sub, provider);
  }

  /** PATCH /api/v1/integrations/business/:businessId/:provider/config */
  @Patch('business/:businessId/:provider/config')
  updateConfig(
    @Req() req: AuthReq,
    @Param('businessId') businessId: string,
    @Param('provider') provider: string,
    @Body() body: { config: object },
  ) {
    return this.svc.updateIntegrationConfig(businessId, req.user.sub, provider, body.config);
  }
}
