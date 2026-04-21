import { Controller, Get, Query } from '@nestjs/common';
import { BusinessService } from './business.service';
import { DiscoverBusinessesDto } from './dto/discover-businesses.dto';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('discover')
  async discover(@Query() query: DiscoverBusinessesDto) {
    return this.businessService.discover(query);
  }
}
