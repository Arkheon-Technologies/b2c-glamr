import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { DiscoverBusinessesDto } from './dto/discover-businesses.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('discover')
  async discover(@Query() query: DiscoverBusinessesDto) {
    return this.businessService.discover(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() body: CreateBusinessDto) {
    return this.businessService.createBusiness(req.user.sub, body);
  }

  @Get(':slug/profile')
  async publicProfile(@Param('slug') slug: string) {
    return this.businessService.getPublicProfile(slug);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.businessService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateBusinessDto,
  ) {
    return this.businessService.updateBusiness(id, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/bookings')
  async getBookings(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return this.businessService.getBusinessBookings(id, req.user.sub, status);
  }
}
