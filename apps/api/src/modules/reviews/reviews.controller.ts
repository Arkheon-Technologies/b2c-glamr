import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class SubmitReviewDto {
  @IsString() appointmentId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() body?: string;
  @IsOptional() categoryScores?: Record<string, number>;
  @IsOptional() photos?: string[];
}

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

  /** GET /api/v1/reviews/token/:token — validate review invite token */
  @Get('token/:token')
  async validateToken(@Param('token') token: string) {
    const data = await this.reviewsService.validateReviewToken(token);
    return { ok: true, data };
  }

  /** POST /api/v1/reviews — submit a review (authenticated) */
  @Post()
  @UseGuards(JwtAuthGuard)
  async submit(
    @Body() dto: SubmitReviewDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const data = await this.reviewsService.submitReview(req.user.sub, dto);
    return { ok: true, data };
  }
}
