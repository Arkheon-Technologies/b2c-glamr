import { Controller, Delete, Get, Param, Post, Query, Req, UseGuards, Optional } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /** GET /api/v1/feed?category=&mode=for_you&limit=20&offset=0 */
  @UseGuards(JwtAuthGuard)
  @Get()
  async listPosts(
    @Req() req: AuthenticatedRequest,
    @Query('category') category?: string,
    @Query('mode') mode?: 'for_you' | 'following' | 'all',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.feedService.listPosts({
      userId: req.user?.sub,
      category,
      mode: mode ?? 'for_you',
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  /** GET /api/v1/feed/categories */
  @Get('categories')
  async getCategories() {
    return this.feedService.getCategories();
  }

  /** POST /api/v1/feed/:postId/like */
  @UseGuards(JwtAuthGuard)
  @Post(':postId/like')
  async toggleLike(
    @Req() req: AuthenticatedRequest,
    @Param('postId') postId: string,
  ) {
    return this.feedService.toggleLike(postId, req.user!.sub);
  }

  /** POST /api/v1/feed/:postId/save */
  @UseGuards(JwtAuthGuard)
  @Post(':postId/save')
  async savePost(
    @Req() req: AuthenticatedRequest,
    @Param('postId') postId: string,
  ) {
    return this.feedService.savePost(postId, req.user!.sub);
  }

  /** POST /api/v1/feed/follow/:staffId */
  @UseGuards(JwtAuthGuard)
  @Post('follow/:staffId')
  async follow(
    @Req() req: AuthenticatedRequest,
    @Param('staffId') staffId: string,
  ) {
    return this.feedService.toggleFollow(staffId, req.user!.sub);
  }
}
