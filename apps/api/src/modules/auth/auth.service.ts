import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { createHash, randomUUID } from 'crypto';

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
  private readonly resetTokenTtlMinutes: number;
  private readonly refreshTokenPepper: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTtlSeconds = this.config.get<number>('JWT_ACCESS_TTL_SECONDS', 900);
    this.refreshTtlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS', 7);
    this.resetTokenTtlMinutes = this.config.get<number>('AUTH_RESET_TOKEN_TTL_MINUTES', 30);
    this.refreshTokenPepper = this.config.get<string>('JWT_SECRET', 'glamr-dev-secret');
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
      const resetToken = randomUUID();
      const tokenHash = this.hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + this.resetTokenTtlMinutes * 60_000);
      const resetLink = this.buildResetLink(resetToken);

      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const emailSent = await this.sendPasswordResetEmail(user.email, resetLink);

      // Development fallback so token-based reset can still be tested end-to-end.
      if (!emailSent && this.config.get<string>('APP_ENV', 'development') !== 'production') {
        console.log(`[auth] password reset token for ${user.email}: ${resetToken}`);
      }
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
    const tokenHash = this.hashResetToken(token);
    const resetTokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!resetTokenRecord) {
      throw new UnauthorizedException({
        ok: false,
        error: {
          code: 'AUTH_RESET_TOKEN_INVALID',
          message: 'Reset token is invalid or expired',
          request_id: randomUUID(),
        },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId: resetTokenRecord.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      ok: true,
      data: {
        reset: true,
      },
    };
  }

  // POST /auth/refresh-token
  async refreshToken(refreshTokenValue: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshTokenValue);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: { in: [refreshTokenHash, refreshTokenValue] },
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
    const refreshTokenHash = this.hashRefreshToken(refreshTokenValue);

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: { in: [refreshTokenHash, refreshTokenValue] },
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
        tokenHash: this.hashRefreshToken(refreshTokenValue),
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

  private hashRefreshToken(tokenValue: string) {
    return createHash('sha256')
      .update(`${tokenValue}:${this.refreshTokenPepper}`)
      .digest('hex');
  }

  private hashResetToken(tokenValue: string) {
    return createHash('sha256')
      .update(`${tokenValue}:${this.refreshTokenPepper}`)
      .digest('hex');
  }

  private buildResetLink(token: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const baseUrl = frontendUrl.replace(/\/$/, '');
    return `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  }

  private async sendPasswordResetEmail(email: string, resetLink: string) {
    const sendgridApiKey = this.config.get<string>('SENDGRID_API_KEY', '').trim();
    const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL', '').trim();

    if (!sendgridApiKey || !fromEmail) {
      return false;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email }],
              subject: 'Reset your GLAMR password',
            },
          ],
          from: { email: fromEmail, name: 'GLAMR' },
          content: [
            {
              type: 'text/plain',
              value: `We received a request to reset your GLAMR password.\n\nUse this link to continue:\n${resetLink}\n\nThis link expires in ${this.resetTokenTtlMinutes} minutes.`,
            },
            {
              type: 'text/html',
              value: `<p>We received a request to reset your GLAMR password.</p><p><a href="${resetLink}">Reset Password</a></p><p>This link expires in ${this.resetTokenTtlMinutes} minutes.</p>`,
            },
          ],
        }),
      });

      if (response.ok) {
        return true;
      }

      const details = await response.text().catch(() => 'no response body');
      console.error(`[auth] sendgrid reset email failed (${response.status}): ${details}`);
      return false;
    } catch (error) {
      console.error('[auth] sendgrid reset email request failed', error);
      return false;
    }
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
