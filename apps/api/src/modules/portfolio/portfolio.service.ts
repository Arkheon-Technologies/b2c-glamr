import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UportfolioService {
  constructor(private readonly prisma: PrismaService) {}
}
