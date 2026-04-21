import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const hashMock = bcrypt.hash as unknown as jest.Mock;
const compareMock = bcrypt.compare as unknown as jest.Mock;

describe('AuthService', () => {
  const prisma = {
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
  };

  const configValues: Record<string, string | number> = {
    JWT_ACCESS_TTL_SECONDS: 900,
    JWT_REFRESH_TTL_DAYS: 7,
    JWT_SECRET: 'test-secret',
  };

  const config = {
    get: jest.fn((key: string, fallback?: string | number) => configValues[key] ?? fallback),
  } as unknown as ConfigService;

  const jwtService = {
    sign: jest.fn(() => 'access-token-value'),
  } as unknown as JwtService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    hashMock.mockResolvedValue('hashed-password');
    compareMock.mockResolvedValue(true);

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

    prisma.$transaction.mockReset();
    prisma.$transaction.mockImplementation(
      async (operations: Array<Promise<unknown>>) => Promise.all(operations),
    );

    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    service = new AuthService(prisma as never, jwtService, config);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers a new account and returns a session payload', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'hello@example.com',
      fullName: 'Hello Test',
      createdAt: new Date(),
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'token-1' });

    const result = await service.register({
      email: 'Hello@Example.com',
      password: 'password123',
      name: 'Hello Test',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'hello@example.com' },
    });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.data.user.email).toBe('hello@example.com');
    expect(result.data.session.access_token).toBe('access-token-value');
    expect(result.data.session.refresh_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const storedTokenHash = prisma.refreshToken.create.mock.calls[0][0].data.tokenHash;
    expect(storedTokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('throws conflict when registering an existing email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        email: 'taken@example.com',
        password: 'password123',
        name: 'Taken User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials and updates last login timestamp', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'user@example.com',
      fullName: 'User Login',
      passwordHash: 'stored-hash',
    });
    prisma.user.update.mockResolvedValue({ id: 'user-2' });
    prisma.refreshToken.create.mockResolvedValue({ id: 'token-2' });

    const result = await service.login('User@Example.com', 'password123');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(compareMock).toHaveBeenCalledWith('password123', 'stored-hash');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { lastLoginAt: expect.any(Date) },
    });
    expect(result.ok).toBe(true);
    expect(result.data.user.id).toBe('user-2');
  });

  it('throws unauthorized for invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      email: 'user@example.com',
      fullName: 'User Login',
      passwordHash: 'stored-hash',
    });
    compareMock.mockResolvedValue(false);

    await expect(service.login('user@example.com', 'wrong-pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshes session and supports legacy plain token storage', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue({ id: 'old-token', userId: 'user-4' });
    prisma.refreshToken.update.mockResolvedValue({ id: 'old-token' });
    prisma.refreshToken.create.mockResolvedValue({ id: 'new-token' });

    const result = await service.refreshToken('legacy-refresh-token');

    expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: { in: expect.any(Array) },
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
    });

    const tokenVariants = prisma.refreshToken.findFirst.mock.calls[0][0].where.tokenHash.in;
    expect(tokenVariants).toContain('legacy-refresh-token');
    expect(tokenVariants).toHaveLength(2);

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'old-token' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result.ok).toBe(true);
    expect(result.data.session.access_token).toBe('access-token-value');
  });

  it('revokes logout token and supports legacy/plain token matching', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.logout('legacy-refresh-token');

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        tokenHash: { in: expect.any(Array) },
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    });

    const tokenVariants = prisma.refreshToken.updateMany.mock.calls[0][0].where.tokenHash.in;
    expect(tokenVariants).toContain('legacy-refresh-token');
    expect(tokenVariants).toHaveLength(2);
    expect(result).toEqual({ ok: true, data: { revoked: true } });
  });

  it('creates password reset token for existing users', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-5',
      email: 'reset@example.com',
    });
    prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 2 });
    prisma.passwordResetToken.create.mockResolvedValue({ id: 'reset-token-1' });

    const result = await service.forgotPassword('reset@example.com');

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-5',
        usedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: {
        usedAt: expect.any(Date),
      },
    });

    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-5',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      },
    });
    expect(result.data.accepted).toBe(true);
  });

  it('returns accepted response without creating reset token for unknown users', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.forgotPassword('missing@example.com');

    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(result.data.accepted).toBe(true);
  });

  it('resets password and revokes active sessions with a valid token', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'prt-1',
      userId: 'user-6',
    });
    prisma.user.update.mockResolvedValue({ id: 'user-6' });
    prisma.passwordResetToken.update.mockResolvedValue({ id: 'prt-1' });
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.resetPassword('valid-reset-token', 'new-password-123');

    expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        usedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      select: {
        id: true,
        userId: true,
      },
    });
    expect(hashMock).toHaveBeenCalledWith('new-password-123', 12);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-6' },
      data: { passwordHash: 'hashed-password' },
    });
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-6',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
    expect(result).toEqual({ ok: true, data: { reset: true } });
  });

  it('throws unauthorized when reset token is invalid or expired', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(
      service.resetPassword('expired-token', 'new-password-123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});