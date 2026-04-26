import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() body: CreateBookingDto) {
    // Always override customer_id with the authenticated user — never trust client-supplied value
    body.customer_id = req.user.sub;
    return this.bookingService.createBooking(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMyBookings(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: 'upcoming' | 'past' | 'all',
  ) {
    return this.bookingService.getMyBookings(req.user.sub, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookingService.getBookingById(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: CancelBookingDto,
  ) {
    return this.bookingService.cancelBookingAsCustomer(id, req.user.sub, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reschedule')
  async reschedule(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { start_at: string },
  ) {
    return this.bookingService.rescheduleBookingAsCustomer(id, req.user.sub, body.start_at);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/receipt')
  async receipt(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookingService.getReceipt(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.bookingService.updateStatusAsBusiness(id, req.user.sub, body.status);
  }

  /** POST /api/v1/bookings/counter/:token/accept — customer accepts counter */
  @UseGuards(JwtAuthGuard)
  @Post('counter/:token/accept')
  async acceptCounter(
    @Req() req: AuthenticatedRequest,
    @Param('token') token: string,
  ) {
    return this.bookingService.acceptCounter(token, req.user.sub);
  }

  /** POST /api/v1/bookings/counter/:token/decline — customer declines counter */
  @UseGuards(JwtAuthGuard)
  @Post('counter/:token/decline')
  async declineCounter(
    @Req() req: AuthenticatedRequest,
    @Param('token') token: string,
  ) {
    return this.bookingService.declineCounter(token, req.user.sub);
  }

  /** PATCH /api/v1/bookings/studio/:id/reschedule — business drags appointment to new slot */
  @UseGuards(JwtAuthGuard)
  @Patch('studio/:id/reschedule')
  async rescheduleAsBusiness(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { start_at: string; notify_client?: boolean; reason?: string },
  ) {
    return this.bookingService.rescheduleAsBusiness(
      id,
      req.user.sub,
      body.start_at,
      body.notify_client ?? false,
      body.reason,
    );
  }

  /** POST /api/v1/studio/inbox/:id/counter — business sends counter-proposal */
  // Note: prefix is 'bookings' but studio routes are also handled here for simplicity
  @UseGuards(JwtAuthGuard)
  @Post('studio/:id/counter')
  async sendCounter(
    @Req() req: AuthenticatedRequest,
    @Param('id') appointmentId: string,
    @Body() body: { startAt: string },
  ) {
    return this.bookingService.sendCounter(appointmentId, req.user.sub, body.startAt);
  }
}
