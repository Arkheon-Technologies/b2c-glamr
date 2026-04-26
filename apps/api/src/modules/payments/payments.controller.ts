import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('studio/stripe')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/v1/studio/stripe/connect
   * Initiates Stripe Connect Express onboarding for the authenticated user's business.
   * The request body should contain { businessId }.
   */
  @Post('connect')
  async createConnect(@Req() req: Request & { user: { sub: string } }) {
    // We derive businessId from the owner relationship
    const businessId = (req.body as { businessId?: string })?.businessId;
    if (!businessId) {
      return { ok: false, error: { code: 'MISSING_BUSINESS_ID', message: 'businessId is required' } };
    }
    const data = await this.paymentsService.createConnectOnboarding(businessId);
    return { ok: true, data };
  }

  /**
   * GET /api/v1/studio/stripe/connect/callback
   * Called after Stripe KYC redirect. Updates the Connect account status.
   */
  @Get('connect/callback')
  async connectCallback(@Req() req: Request & { user: { sub: string }; query: { businessId?: string } }) {
    const businessId = req.query.businessId;
    if (!businessId) {
      return { ok: false, error: { code: 'MISSING_BUSINESS_ID', message: 'businessId is required' } };
    }
    const data = await this.paymentsService.handleConnectCallback(businessId);
    return { ok: true, data };
  }

  /**
   * GET /api/v1/studio/stripe/connect/status
   * Returns the current Connect account status for a business.
   */
  @Get('connect/status')
  async connectStatus(@Req() req: Request & { user: { sub: string }; query: { businessId?: string } }) {
    const businessId = req.query.businessId;
    if (!businessId) {
      return { ok: false, error: { code: 'MISSING_BUSINESS_ID', message: 'businessId is required' } };
    }
    const data = await this.paymentsService.getConnectStatus(businessId);
    return { ok: true, data };
  }
}
