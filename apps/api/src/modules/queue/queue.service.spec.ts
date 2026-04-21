import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  const prisma = {
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    businessLocation: {
      findFirst: jest.fn(),
    },
    service: {
      findFirst: jest.fn(),
    },
    walkInQueue: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: QueueService;

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.$transaction.mockReset();
    prisma.$transaction.mockImplementation(
      async (operations: Array<Promise<unknown>>) => Promise.all(operations),
    );

    prisma.businessLocation.findFirst.mockReset();
    prisma.service.findFirst.mockReset();
    prisma.walkInQueue.findMany.mockReset();
    prisma.walkInQueue.count.mockReset();
    prisma.walkInQueue.create.mockReset();
    prisma.walkInQueue.findUnique.mockReset();
    prisma.walkInQueue.update.mockReset();

    service = new QueueService(prisma as never);
  });

  it('lists queue entries with API shape mapping', async () => {
    const joinedAt = new Date('2026-04-16T10:00:00.000Z');

    prisma.walkInQueue.findMany.mockResolvedValue([
      {
        id: 'entry-1',
        businessId: 'business-1',
        locationId: 'location-1',
        customerName: 'Ada Lovelace',
        phone: '+44123456789',
        customerId: null,
        serviceId: 'service-1',
        staffPreference: null,
        position: 1,
        estimatedWaitMin: 0,
        joinedAt,
        notifiedAt: null,
        servedAt: null,
        status: 'waiting',
        service: { name: 'Signature Facial' },
      },
    ]);

    const result = await service.listQueue({
      business_id: 'business-1',
      location_id: 'location-1',
      status: 'waiting',
      limit: 20,
    });

    expect(prisma.walkInQueue.findMany).toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.data.entries).toHaveLength(1);
    expect(result.data.entries[0]).toMatchObject({
      id: 'entry-1',
      business_id: 'business-1',
      location_id: 'location-1',
      customer_name: 'Ada Lovelace',
      service_name: 'Signature Facial',
      status: 'waiting',
    });
  });

  it('joins queue using default primary location and computed position', async () => {
    prisma.businessLocation.findFirst.mockResolvedValue({ id: 'location-primary' });
    prisma.walkInQueue.count.mockResolvedValue(2);
    prisma.walkInQueue.create.mockResolvedValue({
      id: 'entry-2',
      businessId: 'business-1',
      locationId: 'location-primary',
      customerName: 'Grace Hopper',
      position: 3,
      estimatedWaitMin: 30,
      status: 'waiting',
      joinedAt: new Date('2026-04-16T10:05:00.000Z'),
    });

    const result = await service.joinQueue({
      business_id: 'business-1',
      customer_name: '  Grace Hopper  ',
    });

    expect(prisma.businessLocation.findFirst).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: { id: true },
    });

    expect(prisma.walkInQueue.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessId: 'business-1',
        locationId: 'location-primary',
        customerName: 'Grace Hopper',
        position: 3,
        estimatedWaitMin: 30,
        status: 'waiting',
      }),
      select: expect.any(Object),
    });

    expect(result.ok).toBe(true);
    expect(result.data.entry.position).toBe(3);
  });

  it('rejects queue join when provided location does not belong to business', async () => {
    prisma.businessLocation.findFirst.mockResolvedValue(null);

    await expect(
      service.joinQueue({
        business_id: 'business-1',
        location_id: 'location-x',
        customer_name: 'Test User',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects queue join when selected service is not available for location', async () => {
    prisma.businessLocation.findFirst.mockResolvedValue({ id: 'location-1' });
    prisma.service.findFirst.mockResolvedValue(null);

    await expect(
      service.joinQueue({
        business_id: 'business-1',
        location_id: 'location-1',
        customer_name: 'Test User',
        service_id: 'service-x',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails status update for missing queue entry', async () => {
    prisma.walkInQueue.findUnique.mockResolvedValue(null);

    await expect(service.updateStatus('missing-entry', 'served')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates status and reindexes active queue entries', async () => {
    prisma.walkInQueue.findUnique.mockResolvedValue({
      id: 'entry-1',
      businessId: 'business-1',
      locationId: 'location-1',
      customerName: 'Customer One',
      position: 2,
      estimatedWaitMin: 15,
      status: 'waiting',
      notifiedAt: null,
      servedAt: null,
      joinedAt: new Date('2026-04-16T10:00:00.000Z'),
    });

    prisma.walkInQueue.update
      .mockResolvedValueOnce({
        id: 'entry-1',
        businessId: 'business-1',
        locationId: 'location-1',
        customerName: 'Customer One',
        position: 2,
        estimatedWaitMin: 15,
        status: 'served',
        notifiedAt: null,
        servedAt: new Date('2026-04-16T10:30:00.000Z'),
        joinedAt: new Date('2026-04-16T10:00:00.000Z'),
      })
      .mockResolvedValue({});

    prisma.walkInQueue.findMany.mockResolvedValue([
      { id: 'entry-2' },
      { id: 'entry-3' },
    ]);

    const result = await service.updateStatus('entry-1', 'served');

    expect(prisma.walkInQueue.update).toHaveBeenCalledTimes(3);
    expect(prisma.walkInQueue.findMany).toHaveBeenCalledWith({
      where: {
        businessId: 'business-1',
        locationId: 'location-1',
        status: { in: ['waiting', 'notified', 'serving'] },
      },
      orderBy: [{ joinedAt: 'asc' }],
      select: { id: true },
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.data.entry.status).toBe('served');
  });
});
