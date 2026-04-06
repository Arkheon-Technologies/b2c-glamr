import { Controller } from '@nestjs/common';
import { UreviewsService } from './reviews.service';

@Controller('reviews')
export class UreviewsController {
  constructor(private readonly reviewsService: UreviewsService) {}
}
