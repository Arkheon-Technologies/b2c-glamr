import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard, AuthenticatedUser } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /** GET /api/v1/messages/business/:businessId — list threads */
  @UseGuards(JwtAuthGuard)
  @Get('business/:businessId')
  async listThreads(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
  ) {
    return this.messagesService.listThreads(businessId, req.user.sub);
  }

  /** POST /api/v1/messages/business/:businessId/threads — create thread */
  @UseGuards(JwtAuthGuard)
  @Post('business/:businessId/threads')
  async createThread(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() body: { customer_id: string; appointment_id?: string },
  ) {
    return this.messagesService.createThread(businessId, req.user.sub, body.customer_id, body.appointment_id);
  }

  /** GET /api/v1/messages/threads/:threadId — get thread with messages */
  @UseGuards(JwtAuthGuard)
  @Get('threads/:threadId')
  async getThread(
    @Req() req: AuthenticatedRequest,
    @Param('threadId') threadId: string,
  ) {
    return this.messagesService.getThread(threadId, req.user.sub);
  }

  /** POST /api/v1/messages/threads/:threadId — send message */
  @UseGuards(JwtAuthGuard)
  @Post('threads/:threadId')
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('threadId') threadId: string,
    @Body() body: { body: string },
  ) {
    return this.messagesService.sendMessage(threadId, req.user.sub, body.body);
  }
}
