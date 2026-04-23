import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: AuthenticatedRequest, @Body() body: UpdateMeDto) {
    return this.usersService.updateMe(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.usersService.getStats(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  async updatePreferences(@Req() req: AuthenticatedRequest, @Body() body: Record<string, any>) {
    return this.usersService.updatePreferences(req.user.sub, body);
  }
}
