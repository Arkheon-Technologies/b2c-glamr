import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

export const SUPPORTED_PROVIDERS = [
  'google_calendar',
  'google_business',
  'mailchimp',
  'brevo',
  'zapier',
] as const;

export type Provider = (typeof SUPPORTED_PROVIDERS)[number];

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwner(businessId: string, ownerId: string) {
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!biz) throw new NotFoundException({ ok: false, error: { code: 'BIZ_NOT_FOUND', message: 'Business not found', request_id: randomUUID() } });
    if (biz.ownerId !== ownerId) throw new ForbiddenException({ ok: false, error: { code: 'FORBIDDEN', message: 'Not your business', request_id: randomUUID() } });
  }

  async listConnections(businessId: string, ownerId: string) {
    await this.assertOwner(businessId, ownerId);
    const connections = await this.prisma.integrationConnection.findMany({
      where: { businessId },
      orderBy: { connectedAt: 'desc' },
      select: { id: true, provider: true, config: true, connectedAt: true },
    });
    // Merge with full provider list to show disconnected ones too
    const connected = new Map(connections.map((c) => [c.provider, c]));
    const all = SUPPORTED_PROVIDERS.map((p) => ({
      provider: p,
      connected: connected.has(p),
      connectedAt: connected.get(p)?.connectedAt ?? null,
      config: connected.get(p)?.config ?? null,
    }));
    return { ok: true, data: { integrations: all } };
  }

  async connectIntegration(
    businessId: string,
    ownerId: string,
    provider: string,
    payload: { config?: object; tokens?: object },
  ) {
    await this.assertOwner(businessId, ownerId);
    const connection = await this.prisma.integrationConnection.upsert({
      where: { businessId_provider: { businessId, provider } },
      create: {
        businessId,
        provider,
        config: payload.config ?? {},
        tokens: payload.tokens ?? {},
        connectedAt: new Date(),
      },
      update: {
        config: payload.config ?? {},
        tokens: payload.tokens ?? {},
        connectedAt: new Date(),
      },
      select: { id: true, provider: true, config: true, connectedAt: true },
    });
    return { ok: true, data: { connection } };
  }

  async disconnectIntegration(businessId: string, ownerId: string, provider: string) {
    await this.assertOwner(businessId, ownerId);
    const existing = await this.prisma.integrationConnection.findUnique({
      where: { businessId_provider: { businessId, provider } },
    });
    if (!existing) {
      return { ok: true, data: { disconnected: false } };
    }
    await this.prisma.integrationConnection.delete({
      where: { businessId_provider: { businessId, provider } },
    });
    return { ok: true, data: { disconnected: true } };
  }

  async updateIntegrationConfig(
    businessId: string,
    ownerId: string,
    provider: string,
    config: object,
  ) {
    await this.assertOwner(businessId, ownerId);
    const existing = await this.prisma.integrationConnection.findUnique({
      where: { businessId_provider: { businessId, provider } },
    });
    if (!existing) throw new NotFoundException({ ok: false, error: { code: 'INTEGRATION_NOT_FOUND', message: 'Integration not connected', request_id: randomUUID() } });
    const connection = await this.prisma.integrationConnection.update({
      where: { businessId_provider: { businessId, provider } },
      data: { config },
      select: { id: true, provider: true, config: true, connectedAt: true },
    });
    return { ok: true, data: { connection } };
  }
}
