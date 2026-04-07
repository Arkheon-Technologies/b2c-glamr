import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}
}
