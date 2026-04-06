import { Controller } from '@nestjs/common';
import { UqueueService } from './queue.service';

@Controller('queue')
export class UqueueController {
  constructor(private readonly queueService: UqueueService) {}
}
