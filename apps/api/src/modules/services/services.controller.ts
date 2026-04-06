import { Controller } from '@nestjs/common';
import { UservicesService } from './services.service';

@Controller('services')
export class UservicesController {
  constructor(private readonly servicesService: UservicesService) {}
}
