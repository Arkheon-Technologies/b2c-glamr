import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ListServicesDto } from './dto/list-services.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async list(@Query() query: ListServicesDto) {
    return this.servicesService.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.servicesService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() body: CreateServiceDto) {
    return this.servicesService.createService(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(id, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.servicesService.deleteService(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/staff')
  async assignStaff(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('staffIds') staffIds: string[],
  ) {
    return this.servicesService.assignStaff(id, req.user.sub, staffIds ?? []);
  }
}
