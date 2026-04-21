import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { randomUUID } from 'crypto';

export interface AuthenticatedUser {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw this.unauthorized('AUTH_TOKEN_MISSING', 'Missing or invalid authorization token');
    }

    const token = authorizationHeader.slice(7).trim();
    if (!token) {
      throw this.unauthorized('AUTH_TOKEN_MISSING', 'Missing or invalid authorization token');
    }

    try {
      const payload = this.jwtService.verify<AuthenticatedUser>(token);

      if (!payload?.sub) {
        throw this.unauthorized('AUTH_TOKEN_INVALID', 'Invalid authentication token');
      }

      request.user = payload;
      return true;
    } catch {
      throw this.unauthorized('AUTH_TOKEN_INVALID', 'Invalid or expired authentication token');
    }
  }

  private unauthorized(code: string, message: string) {
    return new UnauthorizedException({
      ok: false,
      error: {
        code,
        message,
        request_id: randomUUID(),
      },
    });
  }
}
