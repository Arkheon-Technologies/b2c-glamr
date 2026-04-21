import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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
}
