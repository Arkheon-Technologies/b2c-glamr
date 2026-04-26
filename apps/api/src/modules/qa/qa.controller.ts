import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, Req, ParseIntPipe, DefaultValuePipe, Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { QaService } from './qa.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { PostAnswerDto } from './dto/post-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  /** GET /api/v1/qa/:slug — public, paginated */
  @Get(':slug')
  async list(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const data = await this.qaService.listThreads(slug, limit, offset);
    return { ok: true, data };
  }

  /** POST /api/v1/qa/:slug — authenticated customer (optional) */
  @Post(':slug')
  @UseGuards(JwtAuthGuard)
  async ask(
    @Param('slug') slug: string,
    @Body() dto: AskQuestionDto,
    @Req() req: Request & { user?: { sub?: string } },
  ) {
    const askerId = req.user?.sub ?? null;
    const data = await this.qaService.askQuestion(slug, askerId, dto.question);
    return { ok: true, data };
  }

  /** POST /api/v1/qa/:slug/:id/answer — authenticated staff */
  @Post(':slug/:id/answer')
  @UseGuards(JwtAuthGuard)
  async answer(
    @Param('slug') slug: string,
    @Param('id') threadId: string,
    @Body() dto: PostAnswerDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const data = await this.qaService.postAnswer(slug, threadId, req.user.sub, dto.answer);
    return { ok: true, data };
  }
}
