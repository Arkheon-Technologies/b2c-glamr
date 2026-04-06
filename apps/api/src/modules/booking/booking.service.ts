import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UbookingService {
  constructor(private readonly prisma: PrismaService) {}
}
