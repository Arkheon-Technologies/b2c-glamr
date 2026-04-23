import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('business/:slug')
  async getByBusinessSlug(
    @Param('slug') slug: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.reviewsService.getReviewsBySlug(slug, limit ?? 20, offset ?? 0);
  }
}
