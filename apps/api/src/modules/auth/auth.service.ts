import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

/**
 * Auth response shapes per AUTH-BASELINE-CONTRACT.md
 *
 * Success: { ok: true, data: { user, session } }
 * Error:   { ok: false, error: { code, message, request_id } }
 */

export interface SessionPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

@Injectable()
export class AuthService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTtlSeconds = this.config.get<number>('JWT_ACCESS_TTL_SECONDS', 900);
    this.refreshTtlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS', 7);
  }

  // POST /auth/register
  async register(data: {
    email: string;
    password: string;
    name: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException({
        ok: false,
        error: {
          code: 'AUTH_ACCOUNT_EXISTS',
          message: 'An account with this email already exists',
          request_id: randomUUID(),
        },
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.name,
        customerProfile: {
          create: {
            referralCode: randomUUID().slice(0, 8).toUpperCase(),
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    const session = await this.createSession(user.id);

    return {
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
        },
        session,
      },
    };
  }

  // POST /auth/login
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        ok: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          request_id: randomUUID(),
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        ok: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          request_id: randomUUID(),
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await this.createSession(user.id);

    return {
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
        },
        session,
      },
    };
  }

  // POST /auth/forgot-password
  async forgotPassword(email: string) {
    // Always return success to prevent user enumeration
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      // TODO: Generate reset token and send email via SendGrid
      // const resetToken = randomUUID();
      // await sendResetEmail(user.email, resetToken);
    }

    return {
      ok: true,
      data: {
        accepted: true,
        message: 'If the account exists, reset instructions have been sent',
      },
    };
  }

  // POST /auth/reset-password
  async resetPassword(token: string, newPassword: string) {
    // TODO: Validate reset token, find user, update password
    // For now, return the contract shape
    const passwordHash = await bcrypt.hash(newPassword, 12);

    return {
      ok: true,
      data: {
        reset: true,
      },
    };
  }

  // POST /auth/refresh-token
  async refreshToken(refreshTokenValue: string) {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: refreshTokenValue,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException({
        ok: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired refresh token',
          request_id: randomUUID(),
        },
      });
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const session = await this.createSession(storedToken.userId);

    return {
      ok: true,
      data: { session },
    };
  }

  // POST /auth/logout
  async logout(refreshTokenValue: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: refreshTokenValue,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return {
      ok: true,
      data: {
        revoked: true,
      },
    };
  }

  // ─── Internal ───────────────────────────────────────────────

  private async createSession(userId: string): Promise<SessionPayload> {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.accessTtlSeconds },
    );

    const refreshTokenValue = randomUUID();
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + this.refreshTtlDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenValue, // TODO: hash before storing in production
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      expires_in: this.accessTtlSeconds,
      token_type: 'Bearer',
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isPlatformAdmin: true,
      },
    });
  }
}
