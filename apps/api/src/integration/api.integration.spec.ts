import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { AuthModule } from '../modules/auth/auth.module';
import { BookingModule } from '../modules/booking/booking.module';
import { PortfolioModule } from '../modules/portfolio/portfolio.module';
import { QueueModule } from '../modules/queue/queue.module';

function createPrismaMock() {
  return {
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    appointment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walkInQueue: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    staffMember: {
      findFirst: jest.fn(),
    },
    portfolioItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    businessLocation: {
      findFirst: jest.fn(),
    },
  };
}

async function requestJson(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const headers = new Headers(init?.headers ?? {});
  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;

  return {
    status: response.status,
    body,
  };
}

describe('API Integration (auth + booking + queue)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let jwtService: JwtService;
  const prisma = createPrismaMock();

  function authHeader(userId = 'user-1') {
    return {
      authorization: `Bearer ${jwtService.sign({
        sub: userId,
        email: `${userId}@example.com`,
      })}`,
    };
  }

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        AuthModule,
        BookingModule,
        PortfolioModule,
        QueueModule,
      ],
    });

    moduleBuilder.overrideProvider(PrismaService).useValue(prisma);

    const moduleRef: TestingModule = await moduleBuilder.compile();
    jwtService = moduleRef.get(JwtService);

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.$transaction.mockReset();
    prisma.$transaction.mockImplementation(
      async (operations: Array<Promise<unknown>>) => Promise.all(operations),
    );

    prisma.user.findUnique.mockReset();
    prisma.user.create.mockReset();
    prisma.user.update.mockReset();

    prisma.refreshToken.create.mockReset();
    prisma.refreshToken.findFirst.mockReset();
    prisma.refreshToken.update.mockReset();
    prisma.refreshToken.updateMany.mockReset();

    prisma.passwordResetToken.create.mockReset();
    prisma.passwordResetToken.findFirst.mockReset();
    prisma.passwordResetToken.update.mockReset();
    prisma.passwordResetToken.updateMany.mockReset();

    prisma.service.findUnique.mockReset();
    prisma.service.findFirst.mockReset();

    prisma.appointment.findFirst.mockReset();
    prisma.appointment.create.mockReset();
    prisma.appointment.findUnique.mockReset();
    prisma.appointment.update.mockReset();

    prisma.walkInQueue.findMany.mockReset();
    prisma.walkInQueue.count.mockReset();
    prisma.walkInQueue.create.mockReset();
    prisma.walkInQueue.findUnique.mockReset();
    prisma.walkInQueue.update.mockReset();

    prisma.business.findUnique.mockReset();
    prisma.business.findFirst.mockReset();
    prisma.staffMember.findFirst.mockReset();

    prisma.portfolioItem.findMany.mockReset();
    prisma.portfolioItem.findUnique.mockReset();
    prisma.portfolioItem.create.mockReset();
    prisma.portfolioItem.update.mockReset();

    prisma.businessLocation.findFirst.mockReset();

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('validates auth register payload', async () => {
    const response = await requestJson(baseUrl, '/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bad-email',
        password: 'short',
        name: '',
      }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it('registers a user through HTTP contract', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      fullName: 'New User',
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'token-1' });

    const response = await requestJson(baseUrl, '/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'New@Example.com',
        password: 'Password123',
        name: 'New User',
      }),
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      ok: true,
      data: {
        user: {
          id: 'user-1',
          email: 'new@example.com',
          name: 'New User',
        },
      },
    });

    const parsed = response.body as {
      data: { session: { access_token: string; refresh_token: string } };
    };

    expect(typeof parsed.data.session.access_token).toBe('string');
    expect(typeof parsed.data.session.refresh_token).toBe('string');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
    });
  });

  it('validates booking create payload', async () => {
    const response = await requestJson(baseUrl, '/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify({
        service_id: 'service-1',
        start_at: 'not-a-date',
      }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it('creates and cancels booking through HTTP endpoints', async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: 'service-1',
      businessId: 'business-1',
      locationId: 'location-1',
      isActive: true,
      durationActiveMin: 45,
      durationProcessingMin: 15,
      durationFinishMin: 0,
      serviceStaff: [
        {
          staffId: 'staff-1',
          staff: { isActive: true },
        },
      ],
    });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue({
      id: 'booking-1',
      businessId: 'business-1',
      serviceId: 'service-1',
      staffId: 'staff-1',
      customerId: null,
      startAt: new Date('2026-04-18T10:00:00.000Z'),
      endAt: new Date('2026-04-18T11:00:00.000Z'),
      status: 'confirmed',
    });

    const createResponse = await requestJson(baseUrl, '/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify({
        service_id: 'service-1',
        start_at: '2026-04-18T10:00:00.000Z',
      }),
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      ok: true,
      data: {
        booking: {
          id: 'booking-1',
          status: 'confirmed',
        },
      },
    });

    prisma.appointment.findUnique.mockResolvedValue({
      id: 'booking-1',
      status: 'confirmed',
      notes: null,
      startAt: new Date('2026-04-18T10:00:00.000Z'),
      endAt: new Date('2026-04-18T11:00:00.000Z'),
    });
    prisma.appointment.update.mockResolvedValue({
      id: 'booking-1',
      status: 'cancelled_by_customer',
      startAt: new Date('2026-04-18T10:00:00.000Z'),
      endAt: new Date('2026-04-18T11:00:00.000Z'),
    });

    const cancelResponse = await requestJson(baseUrl, '/api/v1/bookings/booking-1/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Need to reschedule' }),
    });

    expect(cancelResponse.status).toBe(201);
    expect(cancelResponse.body).toMatchObject({
      ok: true,
      data: {
        booking: {
          id: 'booking-1',
          status: 'cancelled_by_customer',
        },
      },
    });
  });

  it('lists and mutates queue entries through HTTP endpoints', async () => {
    prisma.walkInQueue.findMany.mockResolvedValueOnce([
      {
        id: 'queue-1',
        businessId: 'business-1',
        locationId: 'location-1',
        customerName: 'Ada',
        phone: null,
        customerId: null,
        serviceId: null,
        staffPreference: null,
        position: 1,
        estimatedWaitMin: 0,
        joinedAt: new Date('2026-04-17T09:00:00.000Z'),
        notifiedAt: null,
        servedAt: null,
        status: 'waiting',
        service: null,
      },
    ]);

    const listResponse = await requestJson(
      baseUrl,
      '/api/v1/queue?business_id=business-1&limit=20',
      { method: 'GET' },
    );

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toMatchObject({
      ok: true,
      data: {
        entries: [
          {
            id: 'queue-1',
            business_id: 'business-1',
            customer_name: 'Ada',
            status: 'waiting',
          },
        ],
      },
    });

    prisma.businessLocation.findFirst.mockResolvedValue({ id: 'location-1' });
    prisma.walkInQueue.count.mockResolvedValue(1);
    prisma.walkInQueue.create.mockResolvedValue({
      id: 'queue-2',
      businessId: 'business-1',
      locationId: 'location-1',
      customerName: 'Grace',
      position: 2,
      estimatedWaitMin: 15,
      status: 'waiting',
      joinedAt: new Date('2026-04-17T09:10:00.000Z'),
    });

    const joinResponse = await requestJson(baseUrl, '/api/v1/queue/join', {
      method: 'POST',
      body: JSON.stringify({
        business_id: 'business-1',
        customer_name: 'Grace',
      }),
    });

    expect(joinResponse.status).toBe(201);
    expect(joinResponse.body).toMatchObject({
      ok: true,
      data: {
        entry: {
          id: 'queue-2',
          position: 2,
          status: 'waiting',
        },
      },
    });

    prisma.walkInQueue.findUnique.mockResolvedValue({
      id: 'queue-2',
      businessId: 'business-1',
      locationId: 'location-1',
      customerName: 'Grace',
      position: 2,
      estimatedWaitMin: 15,
      status: 'waiting',
      notifiedAt: null,
      servedAt: null,
      joinedAt: new Date('2026-04-17T09:10:00.000Z'),
    });

    prisma.walkInQueue.update
      .mockResolvedValueOnce({
        id: 'queue-2',
        businessId: 'business-1',
        locationId: 'location-1',
        customerName: 'Grace',
        position: 2,
        estimatedWaitMin: 15,
        status: 'served',
        notifiedAt: null,
        servedAt: new Date('2026-04-17T09:35:00.000Z'),
        joinedAt: new Date('2026-04-17T09:10:00.000Z'),
      })
      .mockResolvedValue({});

    prisma.walkInQueue.findMany.mockResolvedValueOnce([{ id: 'queue-3' }]);

    const updateResponse = await requestJson(baseUrl, '/api/v1/queue/queue-2/status', {
      method: 'POST',
      body: JSON.stringify({ status: 'served' }),
    });

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body).toMatchObject({
      ok: true,
      data: {
        entry: {
          id: 'queue-2',
          status: 'served',
        },
      },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('validates queue status transition payload', async () => {
    const response = await requestJson(baseUrl, '/api/v1/queue/queue-9/status', {
      method: 'POST',
      body: JSON.stringify({ status: 'unknown' }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it('lists published portfolio items through HTTP endpoint', async () => {
    prisma.portfolioItem.findMany.mockResolvedValue([
      {
        id: 'portfolio-1',
        businessId: 'business-1',
        technicianId: 'tech-1',
        beforeUrl: null,
        afterUrl: 'https://cdn.example.com/after-1.jpg',
        healedUrl: null,
        beforeThumbUrl: null,
        afterThumbUrl: 'https://cdn.example.com/after-thumb-1.jpg',
        serviceVertical: 'lashes',
        serviceName: 'Classic Lash Set',
        tags: ['lashes', 'natural'],
        consentType: 'signed',
        isWatermarked: true,
        isPublished: true,
        watermarkedAfterUrl: 'https://cdn.example.com/after-watermarked-1.jpg',
        viewCount: 340,
        bookTapCount: 28,
        createdAt: new Date('2026-04-17T11:00:00.000Z'),
        technician: {
          id: 'tech-1',
          displayName: 'Nia Wells',
          technicianProfile: {
            slug: 'nia-wells',
            avatarUrl: 'https://cdn.example.com/tech-1.jpg',
            avgRating: 4.8,
          },
        },
        business: {
          id: 'business-1',
          name: 'Atelier Lashes',
          slug: 'atelier-lashes',
          logoUrl: null,
          isVerified: true,
        },
      },
    ]);

    const response = await requestJson(baseUrl, '/api/v1/portfolio?limit=12', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      data: {
        items: [
          {
            id: 'portfolio-1',
            service_vertical: 'lashes',
            service_name: 'Classic Lash Set',
            image_urls: {
              primary: 'https://cdn.example.com/after-watermarked-1.jpg',
            },
            technician: {
              id: 'tech-1',
              display_name: 'Nia Wells',
            },
            business: {
              id: 'business-1',
              name: 'Atelier Lashes',
            },
          },
        ],
      },
      meta: {
        total: 1,
      },
    });
  });

  it('requires authentication for portfolio write endpoints', async () => {
    const response = await requestJson(baseUrl, '/api/v1/portfolio', {
      method: 'POST',
      body: JSON.stringify({
        business_id: 'business-1',
        technician_id: 'tech-1',
        after_url: 'https://cdn.example.com/after-2.jpg',
      }),
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      ok: false,
      error: {
        code: 'AUTH_TOKEN_MISSING',
      },
    });
  });

  it('requires authentication for portfolio upload presign endpoint', async () => {
    const response = await requestJson(baseUrl, '/api/v1/portfolio/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({
        business_id: 'business-1',
        file_name: 'after.jpg',
        content_type: 'image/jpeg',
        variant: 'after',
      }),
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      ok: false,
      error: {
        code: 'AUTH_TOKEN_MISSING',
      },
    });
  });

  it('forbids non-manager staff from publishing portfolio items', async () => {
    prisma.portfolioItem.findUnique.mockResolvedValue({
      id: 'portfolio-3',
      businessId: 'business-1',
    });
    prisma.business.findFirst.mockResolvedValue(null);
    prisma.staffMember.findFirst
      .mockResolvedValueOnce({ id: 'staff-3' })
      .mockResolvedValueOnce(null);

    const response = await requestJson(baseUrl, '/api/v1/portfolio/portfolio-3/publish', {
      method: 'POST',
      headers: authHeader('staff-3'),
      body: JSON.stringify({ is_published: true }),
    });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      ok: false,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Only business owners or managers can publish portfolio items',
      },
    });
    expect(prisma.portfolioItem.update).not.toHaveBeenCalled();
  });

  it('blocks create when non-manager staff attempts immediate publish', async () => {
    prisma.business.findUnique.mockResolvedValue({ id: 'business-1' });
    prisma.business.findFirst.mockResolvedValue(null);
    prisma.staffMember.findFirst
      .mockResolvedValueOnce({ id: 'tech-1' })
      .mockResolvedValueOnce({ id: 'staff-8' })
      .mockResolvedValueOnce(null);

    const response = await requestJson(baseUrl, '/api/v1/portfolio', {
      method: 'POST',
      headers: authHeader('staff-8'),
      body: JSON.stringify({
        business_id: 'business-1',
        technician_id: 'tech-1',
        after_url: 'https://cdn.example.com/after-8.jpg',
        is_published: true,
      }),
    });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      ok: false,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Only business owners or managers can publish portfolio items',
      },
    });
    expect(prisma.portfolioItem.create).not.toHaveBeenCalled();
  });

  it('allows manager-role staff to publish portfolio items', async () => {
    prisma.portfolioItem.findUnique.mockResolvedValue({
      id: 'portfolio-4',
      businessId: 'business-1',
    });
    prisma.business.findFirst.mockResolvedValue(null);
    prisma.staffMember.findFirst
      .mockResolvedValueOnce({ id: 'staff-4' })
      .mockResolvedValueOnce({ id: 'staff-4' });
    prisma.portfolioItem.update.mockResolvedValue({
      id: 'portfolio-4',
      businessId: 'business-1',
      technicianId: 'tech-1',
      beforeUrl: null,
      afterUrl: 'https://cdn.example.com/after-4.jpg',
      healedUrl: null,
      beforeThumbUrl: null,
      afterThumbUrl: null,
      serviceVertical: 'hair',
      serviceName: 'Sculpt Cut',
      tags: ['hair'],
      consentType: 'signed',
      isWatermarked: false,
      isPublished: true,
      watermarkedAfterUrl: null,
      viewCount: 11,
      bookTapCount: 2,
      createdAt: new Date('2026-04-17T12:00:00.000Z'),
      technician: {
        id: 'tech-1',
        displayName: 'Nia Wells',
        technicianProfile: {
          slug: 'nia-wells',
          avatarUrl: null,
          avgRating: 4.8,
        },
      },
      business: {
        id: 'business-1',
        name: 'Atelier Lashes',
        slug: 'atelier-lashes',
        logoUrl: null,
        isVerified: true,
      },
    });

    const response = await requestJson(baseUrl, '/api/v1/portfolio/portfolio-4/publish', {
      method: 'POST',
      headers: authHeader('staff-4'),
      body: JSON.stringify({ is_published: true }),
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      ok: true,
      data: {
        item: {
          id: 'portfolio-4',
          is_published: true,
        },
      },
    });
  });

  it('creates, publishes, and tracks portfolio booking taps', async () => {
    prisma.business.findUnique.mockResolvedValue({ id: 'business-1' });
    prisma.business.findFirst.mockResolvedValue({ id: 'business-1' });
    prisma.staffMember.findFirst
      .mockResolvedValueOnce({ id: 'tech-1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.portfolioItem.create.mockResolvedValue({
      id: 'portfolio-2',
      businessId: 'business-1',
      technicianId: 'tech-1',
      beforeUrl: null,
      afterUrl: 'https://cdn.example.com/after-2.jpg',
      healedUrl: null,
      beforeThumbUrl: null,
      afterThumbUrl: null,
      serviceVertical: 'hair',
      serviceName: 'Sculpt Cut',
      tags: ['hair', 'precision'],
      consentType: 'signed',
      isWatermarked: false,
      isPublished: false,
      watermarkedAfterUrl: null,
      viewCount: 0,
      bookTapCount: 0,
      createdAt: new Date('2026-04-17T12:00:00.000Z'),
      technician: {
        id: 'tech-1',
        displayName: 'Nia Wells',
        technicianProfile: {
          slug: 'nia-wells',
          avatarUrl: null,
          avgRating: 4.8,
        },
      },
      business: {
        id: 'business-1',
        name: 'Atelier Lashes',
        slug: 'atelier-lashes',
        logoUrl: null,
        isVerified: true,
      },
    });

    const createResponse = await requestJson(baseUrl, '/api/v1/portfolio', {
      method: 'POST',
      headers: authHeader('owner-1'),
      body: JSON.stringify({
        business_id: 'business-1',
        technician_id: 'tech-1',
        after_url: 'https://cdn.example.com/after-2.jpg',
        service_vertical: 'hair',
        service_name: 'Sculpt Cut',
        tags: ['hair', 'precision'],
        consent_type: 'signed',
      }),
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      ok: true,
      data: {
        item: {
          id: 'portfolio-2',
          is_published: false,
        },
      },
    });

    prisma.portfolioItem.findUnique.mockResolvedValueOnce({
      id: 'portfolio-2',
      businessId: 'business-1',
    });
    prisma.portfolioItem.update.mockResolvedValueOnce({
      id: 'portfolio-2',
      businessId: 'business-1',
      technicianId: 'tech-1',
      beforeUrl: null,
      afterUrl: 'https://cdn.example.com/after-2.jpg',
      healedUrl: null,
      beforeThumbUrl: null,
      afterThumbUrl: null,
      serviceVertical: 'hair',
      serviceName: 'Sculpt Cut',
      tags: ['hair', 'precision'],
      consentType: 'signed',
      isWatermarked: false,
      isPublished: true,
      watermarkedAfterUrl: null,
      viewCount: 0,
      bookTapCount: 0,
      createdAt: new Date('2026-04-17T12:00:00.000Z'),
      technician: {
        id: 'tech-1',
        displayName: 'Nia Wells',
        technicianProfile: {
          slug: 'nia-wells',
          avatarUrl: null,
          avgRating: 4.8,
        },
      },
      business: {
        id: 'business-1',
        name: 'Atelier Lashes',
        slug: 'atelier-lashes',
        logoUrl: null,
        isVerified: true,
      },
    });

    const publishResponse = await requestJson(baseUrl, '/api/v1/portfolio/portfolio-2/publish', {
      method: 'POST',
      headers: authHeader('owner-1'),
      body: JSON.stringify({ is_published: true }),
    });

    expect(publishResponse.status).toBe(201);
    expect(publishResponse.body).toMatchObject({
      ok: true,
      data: {
        item: {
          id: 'portfolio-2',
          is_published: true,
        },
      },
    });

    prisma.portfolioItem.findUnique.mockResolvedValue({ id: 'portfolio-2' });
    prisma.portfolioItem.update.mockResolvedValueOnce({
      id: 'portfolio-2',
      bookTapCount: 1,
    });

    const trackResponse = await requestJson(baseUrl, '/api/v1/portfolio/portfolio-2/book-tap', {
      method: 'POST',
    });

    expect(trackResponse.status).toBe(201);
    expect(trackResponse.body).toMatchObject({
      ok: true,
      data: {
        tracked: true,
        item_id: 'portfolio-2',
        book_tap_count: 1,
      },
    });
  });
});
