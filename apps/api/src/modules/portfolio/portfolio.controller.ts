import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { CreatePortfolioUploadIntentDto } from './dto/create-portfolio-upload-intent.dto';
import { ListPortfolioDto } from './dto/list-portfolio.dto';
import { PublishPortfolioItemDto } from './dto/publish-portfolio-item.dto';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async list(@Query() query: ListPortfolioDto) {
    return this.portfolioService.list(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: CreatePortfolioItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.portfolioService.create(body, request.user?.sub ?? '');
  }

  @Post('uploads/presign')
  @UseGuards(JwtAuthGuard)
  async createUploadIntent(
    @Body() body: CreatePortfolioUploadIntentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.portfolioService.createUploadIntent(body, request.user?.sub ?? '');
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(
    @Param('id') id: string,
    @Body() body: PublishPortfolioItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.portfolioService.setPublished(
      id,
      body.is_published,
      request.user?.sub ?? '',
    );
  }

  @Post(':id/book-tap')
  async trackBookTap(@Param('id') id: string) {
    return this.portfolioService.trackBookTap(id);
  }
}
