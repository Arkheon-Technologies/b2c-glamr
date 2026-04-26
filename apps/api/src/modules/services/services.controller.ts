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

  // ─── Add-on routes (declared before :id to avoid conflicts) ───

  @UseGuards(JwtAuthGuard)
  @Get('addons/:addonId')
  async getAddon(@Param('addonId') addonId: string) {
    return { ok: true, data: { addonId } };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('addons/:addonId')
  async updateAddon(
    @Req() req: AuthenticatedRequest,
    @Param('addonId') addonId: string,
    @Body() body: { name?: string; priceCents?: number; durationMin?: number; isActive?: boolean; description?: string },
  ) {
    return this.servicesService.updateAddon(addonId, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('addons/:addonId')
  async deleteAddon(@Req() req: AuthenticatedRequest, @Param('addonId') addonId: string) {
    return this.servicesService.deleteAddon(addonId, req.user.sub);
  }

  // ─── Package routes ─────────────────────────────────────────

  @Get('business/:businessId/packages')
  async listPackages(@Param('businessId') businessId: string) {
    return this.servicesService.listPackages(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('business/:businessId/packages')
  async createPackage(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() body: { serviceId: string; name: string; sessionCount: number; priceCents: number; validityDays?: number; description?: string; shareable?: boolean; currency?: string },
  ) {
    return this.servicesService.createPackage(businessId, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('packages/:pkgId')
  async updatePackage(
    @Req() req: AuthenticatedRequest,
    @Param('pkgId') pkgId: string,
    @Body() body: { name?: string; priceCents?: number; sessionCount?: number; validityDays?: number; isActive?: boolean; description?: string; shareable?: boolean },
  ) {
    return this.servicesService.updatePackage(pkgId, req.user.sub, body);
  }

  // ─── Seasonal / Discount rule routes ────────────────────────

  @Get('business/:businessId/pricing-rules')
  async listDiscountRules(@Param('businessId') businessId: string) {
    return this.servicesService.listDiscountRules(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('business/:businessId/pricing-rules')
  async createDiscountRule(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() body: { name: string; ruleType?: string; discountType: 'pct' | 'flat'; discountValue: number; validFrom?: string; validTo?: string; appliesTo?: object },
  ) {
    return this.servicesService.createDiscountRule(businessId, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('pricing-rules/:ruleId')
  async updateDiscountRule(
    @Req() req: AuthenticatedRequest,
    @Param('ruleId') ruleId: string,
    @Body() body: { name?: string; isActive?: boolean; discountValue?: number; validFrom?: string; validTo?: string },
  ) {
    return this.servicesService.updateDiscountRule(ruleId, req.user.sub, body);
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

  @Get(':id/addons')
  async listAddons(@Param('id') id: string) {
    return this.servicesService.listAddons(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/addons')
  async createAddon(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { name: string; priceCents: number; durationMin?: number; description?: string },
  ) {
    return this.servicesService.createAddon(id, req.user.sub, body);
  }
}
