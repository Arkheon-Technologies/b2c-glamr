import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getStripe() {
    // Lazy-load Stripe to avoid import errors when key is not set
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key) throw new BadRequestException('Stripe is not configured');
    return new Stripe(key, { apiVersion: '2024-06-20' });
  }

  private get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  // ─── Stripe Connect Onboarding ──────────────────────────────────

  async createConnectOnboarding(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, slug: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    const stripe = this.getStripe();

    // Check if account already exists
    let existing = await this.prisma.stripeConnectAccount.findUnique({
      where: { businessId },
    });

    let stripeAccountId: string;
    if (existing) {
      stripeAccountId = existing.stripeAccountId;
    } else {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_profile: { name: business.name },
        metadata: { businessId },
      });
      stripeAccountId = account.id;
      existing = await this.prisma.stripeConnectAccount.create({
        data: { businessId, stripeAccountId },
      });
    }

    // Create account link for KYC
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${this.frontendUrl}/studio/payments?stripe=refresh`,
      return_url: `${this.frontendUrl}/studio/payments?stripe=done`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url, stripe_account_id: stripeAccountId };
  }

  async handleConnectCallback(businessId: string) {
    const account = await this.prisma.stripeConnectAccount.findUnique({
      where: { businessId },
    });
    if (!account) throw new NotFoundException('No Stripe account found for this business');

    const stripe = this.getStripe();
    const stripeAccount = await stripe.accounts.retrieve(account.stripeAccountId);

    await this.prisma.stripeConnectAccount.update({
      where: { businessId },
      data: {
        chargesEnabled: stripeAccount.charges_enabled,
        payoutsEnabled: stripeAccount.payouts_enabled,
        requirementsDue: stripeAccount.requirements?.currently_due ?? [],
      },
    });

    return {
      connected: stripeAccount.charges_enabled,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled,
    };
  }

  async getConnectStatus(businessId: string) {
    const account = await this.prisma.stripeConnectAccount.findUnique({
      where: { businessId },
      select: {
        stripeAccountId: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        requirementsDue: true,
        updatedAt: true,
      },
    });

    if (!account) return { connected: false };

    return {
      connected: true,
      charges_enabled: account.chargesEnabled,
      payouts_enabled: account.payoutsEnabled,
      requirements_due: account.requirementsDue,
      stripe_account_id: account.stripeAccountId,
      updated_at: account.updatedAt,
    };
  }
}
