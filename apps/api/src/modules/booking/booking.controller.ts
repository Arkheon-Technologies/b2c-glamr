import { Body, Controller, Param, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() body: CreateBookingDto) {
    return this.bookingService.createBooking(body);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() body: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(id, body.reason);
  }
}
