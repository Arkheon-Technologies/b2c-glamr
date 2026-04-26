import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwner(businessId: string, ownerId: string) {
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!biz) throw new NotFoundException({ ok: false, error: { code: 'BIZ_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (biz.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });
  }

  /* ─── Campaigns ───────────────────────────────────────────────────── */

  async listCampaigns(businessId: string, ownerId: string) {
    await this.assertOwner(businessId, ownerId);
    const campaigns = await this.prisma.campaign.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, data: { campaigns } };
  }

  async createCampaign(
    businessId: string,
    ownerId: string,
    payload: {
      name: string;
      segment?: object;
      channels?: string[];
      scheduledAt?: string;
    },
  ) {
    await this.assertOwner(businessId, ownerId);
    const campaign = await this.prisma.campaign.create({
      data: {
        businessId,
        name: payload.name,
        segment: payload.segment ?? {},
        channels: payload.channels ?? ['email'],
        scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
        status: payload.scheduledAt ? 'scheduled' : 'draft',
      },
    });
    return { ok: true, data: { campaign } };
  }

  async updateCampaign(
    campaignId: string,
    ownerId: string,
    payload: {
      name?: string;
      segment?: object;
      channels?: string[];
      scheduledAt?: string | null;
      status?: string;
    },
  ) {
    const existing = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { businessId: true, business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found', request_id: randomUUID() } });
    if (existing.business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });

    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.segment ? { segment: payload.segment } : {}),
        ...(payload.channels ? { channels: payload.channels } : {}),
        ...(payload.scheduledAt !== undefined
          ? { scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null }
          : {}),
        ...(payload.status ? { status: payload.status } : {}),
      },
    });
    return { ok: true, data: { campaign } };
  }

  async deleteCampaign(campaignId: string, ownerId: string) {
    const existing = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found', request_id: randomUUID() } });
    if (existing.business.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });
    await this.prisma.campaign.delete({ where: { id: campaignId } });
    return { ok: true, data: { deleted: true } };
  }

  /* ─── Message templates ───────────────────────────────────────────── */

  async listTemplates(businessId: string, ownerId: string) {
    await this.assertOwner(businessId, ownerId);
    const templates = await this.prisma.messageTemplate.findMany({
      where: { businessId },
      orderBy: { updatedAt: 'desc' },
    });
    return { ok: true, data: { templates } };
  }

  async upsertTemplate(
    businessId: string,
    ownerId: string,
    kind: string,
    payload: { subject?: string; bodyEmail?: string; bodySms?: string },
  ) {
    await this.assertOwner(businessId, ownerId);
    const existing = await this.prisma.messageTemplate.findFirst({ where: { businessId, kind } });
    const template = existing
      ? await this.prisma.messageTemplate.update({ where: { id: existing.id }, data: payload })
      : await this.prisma.messageTemplate.create({ data: { businessId, kind, ...payload } });
    return { ok: true, data: { template } };
  }
}
