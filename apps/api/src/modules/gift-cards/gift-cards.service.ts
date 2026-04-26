import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PurchaseGiftCardDto } from './dto/purchase-gift-card.dto';
import { randomBytes } from 'crypto';

function generateCode(): string {
  // e.g. GLMR-A1B2-C3D4-E5F6
  const hex = randomBytes(6).toString('hex').toUpperCase();
  return `GLMR-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

@Injectable()
export class GiftCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async purchase(userId: string | null, dto: PurchaseGiftCardDto) {
    const code = generateCode();

    const card = await this.prisma.giftCard.create({
      data: {
        code,
        amountCents: dto.amountCents,
        balanceCents: dto.amountCents,
        purchaserUserId: userId,
        recipientEmail: dto.recipientEmail,
        businessId: dto.businessId,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
    });

    return {
      id: card.id,
      code: card.code,
      amount_cents: card.amountCents,
      balance_cents: card.balanceCents,
      recipient_email: card.recipientEmail,
      issued_at: card.issuedAt,
    };
  }

  async getByCode(code: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new NotFoundException('Gift card not found');

    return {
      id: card.id,
      code: card.code,
      amount_cents: card.amountCents,
      balance_cents: card.balanceCents,
      recipient_email: card.recipientEmail,
      issued_at: card.issuedAt,
      expires_at: card.expiresAt,
    };
  }

  async redeem(code: string, userId: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new NotFoundException('Gift card not found');
    if (card.balanceCents <= 0) throw new BadRequestException('Gift card has no remaining balance');
    if (card.expiresAt && card.expiresAt < new Date()) throw new BadRequestException('Gift card has expired');

    const redeemedAmount = card.balanceCents;

    await this.prisma.$transaction([
      this.prisma.giftCard.update({
        where: { code },
        data: { balanceCents: 0 },
      }),
      this.prisma.walletLedger.create({
        data: {
          userId,
          amountCents: redeemedAmount,
          kind: 'gift_redeem',
        },
      }),
    ]);

    return {
      redeemed_cents: redeemedAmount,
      new_balance: 0,
    };
  }

  async getWalletBalance(userId: string): Promise<number> {
    const result = await this.prisma.walletLedger.aggregate({
      where: { userId },
      _sum: { amountCents: true },
    });
    return result._sum.amountCents ?? 0;
  }
}
