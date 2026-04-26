import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  /** List feed posts, optionally filtered by category or staff follows */
  async listPosts(params: {
    userId?: string;
    category?: string;
    mode?: 'for_you' | 'following' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(params.limit ?? 20, 50);
    const offset = params.offset ?? 0;

    let staffFilter: { staffId: { in: string[] } } | undefined;

    if (params.mode === 'following' && params.userId) {
      const follows = await this.prisma.follow.findMany({
        where: { followerId: params.userId },
        select: { targetStaffId: true },
      });
      const staffIds = follows.map((f) => f.targetStaffId);
      staffFilter = staffIds.length > 0 ? { staffId: { in: staffIds } } : { staffId: { in: ['__none__'] } };
    }

    const where = {
      ...(params.category ? { category: params.category } : {}),
      ...staffFilter,
    };

    const [posts, total] = await Promise.all([
      this.prisma.feedPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.feedPost.count({ where }),
    ]);

    // Batch-fetch business and staff info
    const businessIds = [...new Set(posts.map((p) => p.businessId))];
    const staffIds = [...new Set(posts.map((p) => p.staffId))];

    const [businesses, staff] = await Promise.all([
      businessIds.length ? this.prisma.business.findMany({
        where: { id: { in: businessIds } },
        select: { id: true, name: true, slug: true },
      }) : [],
      staffIds.length ? this.prisma.staffMember.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      }) : [],
    ]);

    const bizMap = Object.fromEntries(businesses.map((b) => [b.id, b]));
    const staffMap = Object.fromEntries(staff.map((s) => [s.id, s]));

    // Check which posts the user has liked
    let likedPostIds = new Set<string>();
    if (params.userId) {
      const likes = await this.prisma.feedLike.findMany({
        where: { userId: params.userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    return {
      ok: true,
      data: {
        posts: posts.map((p) => ({
          id: p.id,
          hero_photo_url: p.heroPhotoUrl,
          caption: p.caption,
          category: p.category,
          like_count: p.likeCount,
          save_count: p.saveCount,
          comment_count: p.commentCount,
          published_at: p.publishedAt,
          liked_by_me: likedPostIds.has(p.id),
          business: bizMap[p.businessId] ?? null,
          staff: staffMap[p.staffId] ?? null,
        })),
      },
      meta: { total, limit, offset },
    };
  }

  /** Toggle like on a post — returns new like count and liked state */
  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException({ ok: false, error: { code: 'POST_NOT_FOUND', message: 'Post not found', request_id: randomUUID() } });

    const existing = await this.prisma.feedLike.findUnique({ where: { userId_postId: { userId, postId } } });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.feedLike.delete({ where: { userId_postId: { userId, postId } } }),
        this.prisma.feedPost.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { ok: true, data: { liked: false, like_count: Math.max(post.likeCount - 1, 0) } };
    } else {
      await this.prisma.$transaction([
        this.prisma.feedLike.create({ data: { userId, postId } }),
        this.prisma.feedPost.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
      ]);
      return { ok: true, data: { liked: true, like_count: post.likeCount + 1 } };
    }
  }

  /** Save a post to user's default "Saved" collection */
  async savePost(postId: string, userId: string) {
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException({ ok: false, error: { code: 'POST_NOT_FOUND', message: 'Post not found', request_id: randomUUID() } });

    // Find or create default "Saved" collection
    let collection = await this.prisma.collection.findFirst({
      where: { userId, name: 'Saved' },
    });
    if (!collection) {
      collection = await this.prisma.collection.create({
        data: { userId, name: 'Saved', isPublic: false },
      });
    }

    // Upsert
    await this.prisma.collectionItem.upsert({
      where: { collectionId_feedPostId: { collectionId: collection.id, feedPostId: postId } },
      create: { collectionId: collection.id, feedPostId: postId },
      update: {},
    });

    await this.prisma.feedPost.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } });

    return { ok: true, data: { saved: true, collection_id: collection.id } };
  }

  /** Follow / unfollow a staff member */
  async toggleFollow(targetStaffId: string, followerId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_targetStaffId: { followerId, targetStaffId } },
    });

    if (existing) {
      await this.prisma.follow.delete({ where: { followerId_targetStaffId: { followerId, targetStaffId } } });
      return { ok: true, data: { following: false } };
    } else {
      await this.prisma.follow.create({ data: { followerId, targetStaffId } });
      return { ok: true, data: { following: true } };
    }
  }

  /** Get distinct categories from published posts */
  async getCategories() {
    const result = await this.prisma.feedPost.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return {
      ok: true,
      data: { categories: result.map((r) => r.category).filter(Boolean) as string[] },
    };
  }
}
