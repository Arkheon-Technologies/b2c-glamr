import { Controller } from '@nestjs/common';
import { UschedulingService } from './scheduling.service';

@Controller('scheduling')
export class UschedulingController {
  constructor(private readonly schedulingService: UschedulingService) {}
}
