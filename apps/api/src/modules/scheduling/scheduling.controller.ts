import { Controller, Get, Query } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get('availability')
  async availability(@Query() query: AvailabilityQueryDto) {
    return this.schedulingService.getAvailability(query);
  }
}
