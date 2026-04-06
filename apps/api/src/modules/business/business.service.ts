import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UbusinessService {
  constructor(private readonly prisma: PrismaService) {}
}
