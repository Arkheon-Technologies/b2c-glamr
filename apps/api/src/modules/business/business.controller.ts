import { Controller } from '@nestjs/common';
import { UbusinessService } from './business.service';

@Controller('business')
export class UbusinessController {
  constructor(private readonly businessService: UbusinessService) {}
}
