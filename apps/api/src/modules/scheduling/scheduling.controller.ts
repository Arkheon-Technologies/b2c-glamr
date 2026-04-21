import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get('availability')
  async availability(@Query() query: AvailabilityQueryDto) {
    return this.schedulingService.getAvailability(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('schedules')
  async setSchedule(@Req() req: AuthenticatedRequest, @Body() body: SetScheduleDto) {
    return this.schedulingService.setSchedule(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('schedules/:staffId')
  async getStaffSchedule(@Req() req: AuthenticatedRequest, @Param('staffId') staffId: string) {
    return this.schedulingService.getStaffSchedule(staffId, req.user.sub);
  }
}
