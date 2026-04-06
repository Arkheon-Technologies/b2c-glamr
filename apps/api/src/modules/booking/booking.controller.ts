import { Controller } from '@nestjs/common';
import { UbookingService } from './booking.service';

@Controller('booking')
export class UbookingController {
  constructor(private readonly bookingService: UbookingService) {}
}
