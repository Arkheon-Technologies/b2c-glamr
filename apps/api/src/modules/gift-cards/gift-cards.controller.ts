import { Controller, Post, Get, Param, Body, UseGuards, Req, Optional } from '@nestjs/common';
import { Request } from 'express';
import { GiftCardsService } from './gift-cards.service';
import { PurchaseGiftCardDto } from './dto/purchase-gift-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  /** POST /api/v1/gift-cards/purchase — authenticated or guest */
  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchase(
    @Body() dto: PurchaseGiftCardDto,
    @Req() req: Request & { user?: { sub?: string } },
  ) {
    const userId = req.user?.sub ?? null;
    const data = await this.giftCardsService.purchase(userId, dto);
    return { ok: true, data };
  }

  /** GET /api/v1/gift-cards/:code — check balance and details */
  @Get(':code')
  async getByCode(@Param('code') code: string) {
    const data = await this.giftCardsService.getByCode(code);
    return { ok: true, data };
  }

  /** POST /api/v1/gift-cards/:code/redeem — authenticated customer */
  @Post(':code/redeem')
  @UseGuards(JwtAuthGuard)
  async redeem(
    @Param('code') code: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const data = await this.giftCardsService.redeem(code, req.user.sub);
    return { ok: true, data };
  }

  /** GET /api/v1/gift-cards/wallet/balance — wallet balance for current user */
  @Get('wallet/balance')
  @UseGuards(JwtAuthGuard)
  async walletBalance(@Req() req: Request & { user: { sub: string } }) {
    const balance = await this.giftCardsService.getWalletBalance(req.user.sub);
    return { ok: true, data: { balance_cents: balance } };
  }
}
