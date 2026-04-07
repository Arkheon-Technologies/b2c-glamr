import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}
}
