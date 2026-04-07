import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Auth endpoints per AUTH-BASELINE-CONTRACT.md
 * Base path: /auth (under global /api/v1 prefix)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; new_password: string },
  ) {
    return this.authService.resetPassword(body.token, body.new_password);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    return this.authService.logout(body.refresh_token);
  }
}
