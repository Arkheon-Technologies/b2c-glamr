import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PrismaService } from '../../database/prisma.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { CreatePortfolioUploadIntentDto } from './dto/create-portfolio-upload-intent.dto';
import { ListPortfolioDto } from './dto/list-portfolio.dto';

type PortfolioStorageConfig = {
  bucket: string;
  region: string;
  endpoint: string | null;
  publicBaseUrl: string | null;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

@Injectable()
export class PortfolioService {
  private readonly portfolioPublishRoles = ['manager'];
  private readonly uploadMimeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  private readonly uploadVariants = new Set([
    'before',
    'after',
    'healed',
    'before_thumb',
    'after_thumb',
    'watermarked_after',
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async list(params: ListPortfolioDto) {
    const businessId = params.business_id?.trim();
    const technicianId = params.technician_id?.trim();
    const vertical = params.vertical?.trim();
    const tag = params.tag?.trim();
    const search = params.search?.trim();
    const includeUnpublished = params.include_unpublished ?? false;
    const take = params.limit ?? 24;

    const items = await this.prisma.portfolioItem.findMany({
      where: {
        ...(includeUnpublished ? {} : { isPublished: true }),
        ...(businessId ? { businessId } : {}),
        ...(technicianId ? { technicianId } : {}),
        ...(vertical
          ? {
              serviceVertical: {
                contains: vertical,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search
          ? {
              OR: [
                { serviceName: { contains: search, mode: 'insensitive' } },
                { serviceVertical: { contains: search, mode: 'insensitive' } },
                {
                  technician: {
                    displayName: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  business: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      take,
      select: this.portfolioSelect(),
    });

    return {
      ok: true,
      data: {
        items: items.map((item) => this.toPortfolioResponse(item)),
      },
      meta: {
        total: items.length,
      },
    };
  }

  async create(payload: CreatePortfolioItemDto, authenticatedUserId: string) {
    const [business, technician] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: payload.business_id },
        select: { id: true },
      }),
      this.prisma.staffMember.findFirst({
        where: {
          id: payload.technician_id,
          businessId: payload.business_id,
        },
        select: { id: true },
      }),
    ]);

    if (!business) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'PORTFOLIO_BUSINESS_NOT_FOUND',
          message: 'Business not found',
          request_id: randomUUID(),
        },
      });
    }

    await this.assertStudioAccessForBusiness(
      payload.business_id,
      authenticatedUserId,
    );

    if (payload.is_published) {
      await this.assertPortfolioPublishAccess(
        payload.business_id,
        authenticatedUserId,
      );
    }

    if (!technician) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'PORTFOLIO_TECHNICIAN_NOT_FOUND',
          message: 'Technician not found for this business',
          request_id: randomUUID(),
        },
      });
    }

    const tags = (payload.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20);

    const created = await this.prisma.portfolioItem.create({
      data: {
        businessId: payload.business_id,
        technicianId: payload.technician_id,
        appointmentId: payload.appointment_id,
        beforeUrl: payload.before_url,
        afterUrl: payload.after_url,
        healedUrl: payload.healed_url,
        beforeThumbUrl: payload.before_thumb_url,
        afterThumbUrl: payload.after_thumb_url,
        serviceVertical: payload.service_vertical,
        serviceName: payload.service_name,
        tags,
        consentType: payload.consent_type ?? 'none',
        isPublished: payload.is_published ?? false,
        isWatermarked: payload.is_watermarked ?? false,
        watermarkedAfterUrl: payload.watermarked_after_url,
      },
      select: this.portfolioSelect(),
    });

    return {
      ok: true,
      data: {
        item: this.toPortfolioResponse(created),
      },
    };
  }

  async createUploadIntent(
    payload: CreatePortfolioUploadIntentDto,
    authenticatedUserId: string,
  ) {
    const businessId = payload.business_id.trim();
    const fileName = payload.file_name.trim();
    const contentType = payload.content_type.trim().toLowerCase();
    const variant = payload.variant.trim().toLowerCase();

    if (!businessId) {
      throw this.badRequest(
        'PORTFOLIO_UPLOAD_BUSINESS_REQUIRED',
        'Business ID is required for upload intent',
      );
    }

    if (!this.uploadVariants.has(variant)) {
      throw this.badRequest(
        'PORTFOLIO_UPLOAD_VARIANT_INVALID',
        'Upload variant is invalid',
      );
    }

    await this.assertStudioAccessForBusiness(businessId, authenticatedUserId);

    const extension = this.resolveUploadExtension(fileName, contentType);

    const storage = this.resolveStorageConfig();

    if (!storage.bucket || !storage.region) {
      throw this.storageUnavailable(
        'Portfolio storage is not configured. Set STORAGE_BUCKET/STORAGE_REGION (or AWS_S3_BUCKET/AWS_REGION).',
      );
    }

    const expiresIn = this.resolveUploadExpiry();
    const objectKey = this.buildObjectKey({ businessId, extension, variant });

    const command = new PutObjectCommand({
      Bucket: storage.bucket,
      Key: objectKey,
      ContentType: contentType,
      Metadata: {
        business_id: businessId,
        variant,
      },
    });

    try {
      const uploadUrl = await getSignedUrl(this.createS3Client(storage), command, {
        expiresIn,
      });

      return {
        ok: true,
        data: {
          upload: {
            upload_url: uploadUrl,
            method: 'PUT',
            asset_url: this.resolvePublicAssetUrl(storage, objectKey),
            asset_key: objectKey,
            expires_in: expiresIn,
            required_headers: {
              'Content-Type': contentType,
            },
          },
        },
      };
    } catch {
      throw this.storageUnavailable(
        'Unable to generate upload URL. Check storage credentials and bucket permissions.',
      );
    }
  }

  async setPublished(
    id: string,
    isPublished: boolean,
    authenticatedUserId: string,
  ) {
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'PORTFOLIO_ITEM_NOT_FOUND',
          message: 'Portfolio item not found',
          request_id: randomUUID(),
        },
      });
    }

    await this.assertStudioAccessForBusiness(
      existing.businessId,
      authenticatedUserId,
    );

    await this.assertPortfolioPublishAccess(
      existing.businessId,
      authenticatedUserId,
    );

    const updated = await this.prisma.portfolioItem.update({
      where: { id },
      data: {
        isPublished,
      },
      select: this.portfolioSelect(),
    });

    return {
      ok: true,
      data: {
        item: this.toPortfolioResponse(updated),
      },
    };
  }

  async trackBookTap(id: string) {
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        ok: false,
        error: {
          code: 'PORTFOLIO_ITEM_NOT_FOUND',
          message: 'Portfolio item not found',
          request_id: randomUUID(),
        },
      });
    }

    const updated = await this.prisma.portfolioItem.update({
      where: { id },
      data: {
        bookTapCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        bookTapCount: true,
      },
    });

    return {
      ok: true,
      data: {
        tracked: true,
        item_id: updated.id,
        book_tap_count: updated.bookTapCount,
      },
    };
  }

  private portfolioSelect() {
    return {
      id: true,
      businessId: true,
      technicianId: true,
      beforeUrl: true,
      afterUrl: true,
      healedUrl: true,
      beforeThumbUrl: true,
      afterThumbUrl: true,
      serviceVertical: true,
      serviceName: true,
      tags: true,
      consentType: true,
      isWatermarked: true,
      watermarkedAfterUrl: true,
      viewCount: true,
      bookTapCount: true,
      createdAt: true,
      isPublished: true,
      technician: {
        select: {
          id: true,
          displayName: true,
          technicianProfile: {
            select: {
              slug: true,
              avatarUrl: true,
              avgRating: true,
            },
          },
        },
      },
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          isVerified: true,
        },
      },
    };
  }

  private async assertStudioAccessForBusiness(
    businessId: string,
    authenticatedUserId: string,
  ) {
    if (!authenticatedUserId) {
      throw new ForbiddenException({
        ok: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You are not authorized to manage this business',
          request_id: randomUUID(),
        },
      });
    }

    const [ownedBusiness, staffMembership] = await Promise.all([
      this.prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: authenticatedUserId,
        },
        select: { id: true },
      }),
      this.prisma.staffMember.findFirst({
        where: {
          businessId,
          userId: authenticatedUserId,
          isActive: true,
        },
        select: { id: true },
      }),
    ]);

    if (!ownedBusiness && !staffMembership) {
      throw new ForbiddenException({
        ok: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You are not authorized to manage this business',
          request_id: randomUUID(),
        },
      });
    }
  }

  private async assertPortfolioPublishAccess(
    businessId: string,
    authenticatedUserId: string,
  ) {
    if (!authenticatedUserId) {
      throw new ForbiddenException({
        ok: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'Only business owners or managers can publish portfolio items',
          request_id: randomUUID(),
        },
      });
    }

    const [ownedBusiness, managerMembership] = await Promise.all([
      this.prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: authenticatedUserId,
        },
        select: { id: true },
      }),
      this.prisma.staffMember.findFirst({
        where: {
          businessId,
          userId: authenticatedUserId,
          isActive: true,
          role: {
            in: this.portfolioPublishRoles,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!ownedBusiness && !managerMembership) {
      throw new ForbiddenException({
        ok: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'Only business owners or managers can publish portfolio items',
          request_id: randomUUID(),
        },
      });
    }
  }

  private resolveUploadExtension(fileName: string, contentType: string) {
    const expectedExtension = this.uploadMimeToExtension[contentType];

    if (!expectedExtension) {
      throw this.badRequest(
        'PORTFOLIO_UPLOAD_CONTENT_TYPE_INVALID',
        'Unsupported content type for upload',
      );
    }

    const parsedExtension = extname(fileName).replace('.', '').toLowerCase();

    if (!parsedExtension) {
      return expectedExtension;
    }

    const normalizedParsed =
      parsedExtension === 'jpeg' ? 'jpg' : parsedExtension;
    const normalizedExpected =
      expectedExtension === 'jpeg' ? 'jpg' : expectedExtension;

    if (normalizedParsed !== normalizedExpected) {
      throw this.badRequest(
        'PORTFOLIO_UPLOAD_EXTENSION_MISMATCH',
        'File extension does not match content type',
      );
    }

    return expectedExtension;
  }

  private resolveUploadExpiry() {
    const configured = this.config.get<number>('PORTFOLIO_UPLOAD_URL_TTL_SECONDS', 900);

    if (typeof configured !== 'number' || Number.isNaN(configured)) {
      return 900;
    }

    return Math.min(Math.max(Math.floor(configured), 60), 3600);
  }

  private buildObjectKey(params: {
    businessId: string;
    extension: string;
    variant: string;
  }) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');

    return `portfolio/${params.businessId}/${year}/${month}/${randomUUID()}-${params.variant}.${params.extension}`;
  }

  private resolveStorageConfig(): PortfolioStorageConfig {
    const bucket = this.readStorageSetting('STORAGE_BUCKET', 'AWS_S3_BUCKET');
    const endpoint = this.normalizeUrlSetting(
      this.readStorageSetting('STORAGE_ENDPOINT'),
    );
    const publicBaseUrl = this.normalizeUrlSetting(
      this.readStorageSetting('STORAGE_PUBLIC_BASE_URL', 'AWS_S3_PUBLIC_BASE_URL'),
    );
    const region = this.resolveStorageRegion(endpoint);
    const accessKeyId = this.readStorageSetting(
      'STORAGE_ACCESS_KEY_ID',
      'AWS_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.readStorageSetting(
      'STORAGE_SECRET_ACCESS_KEY',
      'AWS_SECRET_ACCESS_KEY',
    );

    return {
      bucket,
      region,
      endpoint,
      publicBaseUrl,
      accessKeyId,
      secretAccessKey,
      forcePathStyle: this.resolveStorageForcePathStyle(endpoint),
    };
  }

  private readStorageSetting(primary: string, fallback?: string) {
    const primaryValue = this.config.get<string>(primary, '').trim();

    if (primaryValue) {
      return primaryValue;
    }

    if (!fallback) {
      return '';
    }

    return this.config.get<string>(fallback, '').trim();
  }

  private normalizeUrlSetting(value: string) {
    if (!value) {
      return null;
    }

    return value.replace(/\/$/, '');
  }

  private resolveStorageRegion(endpoint: string | null) {
    const configuredRegion = this.readStorageSetting('STORAGE_REGION', 'AWS_REGION');

    if (configuredRegion) {
      return configuredRegion;
    }

    // Many S3-compatible providers (for example R2) accept "auto" when no region is required.
    if (endpoint) {
      return 'auto';
    }

    return '';
  }

  private resolveStorageForcePathStyle(endpoint: string | null) {
    const configuredValue = this.readStorageSetting('STORAGE_FORCE_PATH_STYLE');

    if (!configuredValue) {
      return Boolean(endpoint);
    }

    return ['1', 'true', 'yes', 'on'].includes(configuredValue.toLowerCase());
  }

  private createS3Client(storage: PortfolioStorageConfig) {
    const endpointConfig = storage.endpoint
      ? {
          endpoint: storage.endpoint,
          forcePathStyle: storage.forcePathStyle,
        }
      : {};

    return new S3Client({
      region: storage.region,
      ...endpointConfig,
      ...(storage.accessKeyId && storage.secretAccessKey
        ? {
            credentials: {
              accessKeyId: storage.accessKeyId,
              secretAccessKey: storage.secretAccessKey,
            },
          }
        : {}),
    });
  }

  private resolvePublicAssetUrl(
    storage: PortfolioStorageConfig,
    objectKey: string,
  ) {
    if (storage.publicBaseUrl) {
      return `${storage.publicBaseUrl}/${objectKey}`;
    }

    const endpointAssetUrl = this.resolveEndpointAssetUrl(storage, objectKey);

    if (endpointAssetUrl) {
      return endpointAssetUrl;
    }

    return `https://${storage.bucket}.s3.${storage.region}.amazonaws.com/${objectKey}`;
  }

  private resolveEndpointAssetUrl(
    storage: PortfolioStorageConfig,
    objectKey: string,
  ) {
    if (!storage.endpoint) {
      return null;
    }

    if (storage.forcePathStyle) {
      return `${storage.endpoint}/${storage.bucket}/${objectKey}`;
    }

    try {
      const parsedEndpoint = new URL(storage.endpoint);
      const endpointPath = parsedEndpoint.pathname.replace(/\/$/, '');

      return `${parsedEndpoint.protocol}//${storage.bucket}.${parsedEndpoint.host}${endpointPath}/${objectKey}`;
    } catch {
      return `${storage.endpoint}/${storage.bucket}/${objectKey}`;
    }
  }

  private badRequest(code: string, message: string) {
    return new BadRequestException({
      ok: false,
      error: {
        code,
        message,
        request_id: randomUUID(),
      },
    });
  }

  private storageUnavailable(message: string) {
    return new ServiceUnavailableException({
      ok: false,
      error: {
        code: 'PORTFOLIO_STORAGE_UNAVAILABLE',
        message,
        request_id: randomUUID(),
      },
    });
  }

  private toPortfolioResponse(item: {
    id: string;
    businessId: string;
    technicianId: string;
    beforeUrl: string | null;
    afterUrl: string | null;
    healedUrl: string | null;
    beforeThumbUrl: string | null;
    afterThumbUrl: string | null;
    serviceVertical: string | null;
    serviceName: string | null;
    tags: string[];
    consentType: string;
    isWatermarked: boolean;
    watermarkedAfterUrl: string | null;
    viewCount: number;
    bookTapCount: number;
    createdAt: Date;
    isPublished: boolean;
    technician: {
      id: string;
      displayName: string;
      technicianProfile: {
        slug: string;
        avatarUrl: string | null;
        avgRating: unknown;
      } | null;
    };
    business: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      isVerified: boolean;
    };
  }) {
    return {
      id: item.id,
      business_id: item.businessId,
      technician_id: item.technicianId,
      service_vertical: item.serviceVertical,
      service_name: item.serviceName,
      tags: item.tags,
      consent_type: item.consentType,
      is_watermarked: item.isWatermarked,
      is_published: item.isPublished,
      view_count: item.viewCount,
      book_tap_count: item.bookTapCount,
      created_at: item.createdAt.toISOString(),
      image_urls: {
        before: item.beforeUrl,
        after: item.afterUrl,
        healed: item.healedUrl,
        before_thumb: item.beforeThumbUrl,
        after_thumb: item.afterThumbUrl,
        watermarked_after: item.watermarkedAfterUrl,
        primary:
          item.watermarkedAfterUrl ??
          item.afterThumbUrl ??
          item.afterUrl ??
          item.healedUrl ??
          item.beforeThumbUrl ??
          item.beforeUrl,
      },
      technician: {
        id: item.technician.id,
        display_name: item.technician.displayName,
        slug: item.technician.technicianProfile?.slug ?? null,
        avatar_url: item.technician.technicianProfile?.avatarUrl ?? null,
        avg_rating:
          item.technician.technicianProfile?.avgRating != null
            ? Number(item.technician.technicianProfile.avgRating)
            : null,
      },
      business: {
        id: item.business.id,
        name: item.business.name,
        slug: item.business.slug,
        logo_url: item.business.logoUrl,
        is_verified: item.business.isVerified,
      },
    };
  }
}
