import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveBusinessId(slug: string): Promise<string> {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business.id;
  }

  async listThreads(slug: string, limit = 20, offset = 0) {
    const businessId = await this.resolveBusinessId(slug);

    const [threads, total] = await Promise.all([
      this.prisma.qaThread.findMany({
        where: { businessId, isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          answers: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.qaThread.count({ where: { businessId, isPublic: true } }),
    ]);

    return {
      threads: threads.map((t) => ({
        id: t.id,
        question: t.question,
        is_public: t.isPublic,
        created_at: t.createdAt,
        answers: t.answers.map((a) => ({
          id: a.id,
          staff_id: a.staffId,
          answer: a.answer,
          created_at: a.createdAt,
        })),
      })),
      total,
    };
  }

  async askQuestion(slug: string, askerId: string | null, question: string) {
    const businessId = await this.resolveBusinessId(slug);

    const thread = await this.prisma.qaThread.create({
      data: {
        businessId,
        askerId,
        question,
        isPublic: true,
      },
      include: { answers: true },
    });

    return {
      id: thread.id,
      question: thread.question,
      is_public: thread.isPublic,
      created_at: thread.createdAt,
      answers: [],
    };
  }

  async postAnswer(slug: string, threadId: string, staffUserId: string, answer: string) {
    const businessId = await this.resolveBusinessId(slug);

    // Verify the thread belongs to this business
    const thread = await this.prisma.qaThread.findFirst({
      where: { id: threadId, businessId },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    // Resolve the staffMember row for this user+business
    const staffMember = await this.prisma.staffMember.findFirst({
      where: { userId: staffUserId, businessId },
      select: { id: true },
    });
    if (!staffMember) throw new ForbiddenException('Not a staff member of this business');

    const answerRow = await this.prisma.qaAnswer.create({
      data: { threadId, staffId: staffMember.id, answer },
    });

    return {
      id: answerRow.id,
      staff_id: answerRow.staffId,
      answer: answerRow.answer,
      created_at: answerRow.createdAt,
    };
  }
}
