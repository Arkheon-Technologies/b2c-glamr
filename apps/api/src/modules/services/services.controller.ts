import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ListServicesDto } from './dto/list-services.dto';

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
}
