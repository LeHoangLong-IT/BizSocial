import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostStatusDto } from './dto/status-post.dto.js';
import { PostStatus } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreatePostDto) {
    const platformsStr = Array.isArray(dto.platforms)
      ? JSON.stringify(dto.platforms)
      : dto.platforms || '["FACEBOOK"]';

    const mediaUrlsStr = Array.isArray(dto.mediaUrls)
      ? JSON.stringify(dto.mediaUrls)
      : dto.mediaUrls || '[]';

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        platforms: platformsStr,
        status: dto.status || PostStatus.DRAFT,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        mediaUrls: mediaUrlsStr,
        hashtags: dto.hashtags || '',
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(query: {
    status?: string;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as PostStatus;
    }

    if (query.platform && query.platform !== 'ALL') {
      where.platforms = {
        contains: query.platform,
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
        { hashtags: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          approvedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((post: any) => ({
        ...post,
        platforms: this.safeParseJson(post.platforms, ['FACEBOOK']),
        mediaUrls: this.safeParseJson(post.mediaUrls, []),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCalendar() {
    const posts = await this.prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return posts.map((post: any) => ({
      ...post,
      platforms: this.safeParseJson(post.platforms, ['FACEBOOK']),
      mediaUrls: this.safeParseJson(post.mediaUrls, []),
    }));
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return {
      ...post,
      platforms: this.safeParseJson(post.platforms, ['FACEBOOK']),
      mediaUrls: this.safeParseJson(post.mediaUrls, []),
    };
  }

  async updateStatus(id: number, userId: number, dto: UpdatePostStatusDto) {
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    const data: any = {
      status: dto.status,
    };

    if (dto.status === PostStatus.APPROVED || dto.status === PostStatus.PUBLISHED) {
      data.approvedById = userId;
    }

    if (dto.status === PostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    if (dto.status === PostStatus.REJECTED && dto.rejectReason) {
      data.rejectReason = dto.rejectReason;
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    return {
      ...updated,
      platforms: this.safeParseJson(updated.platforms, ['FACEBOOK']),
      mediaUrls: this.safeParseJson(updated.mediaUrls, []),
    };
  }

  async delete(id: number) {
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async generateAiContent(topic: string, platform: string = 'FACEBOOK') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        title: `Kịch bản truyền thông: ${topic}`,
        content: `🚀 [BIZSOCIAL ERP CAMPAIGN] ${topic}\n\n✨ Điểm nổi bật:\n- Tối ưu hóa quy trình làm việc chuẩn ERP 2026\n- Quản lý tập trung đa kênh Social Media\n- Tích hợp Trí tuệ Nhân tạo Gemini AI bóc tách dữ liệu\n\n📌 Hãy liên hệ ngay hôm nay để nhận ưu đãi dùng thử!`,
        hashtags: '#BizSocialERP #SocialMediaManagement #ERP2026 #Innovation',
      };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Bạn là chuyên gia Sáng tạo Nội dung Social Media cho BizSocial ERP. Hãy tạo một bài viết thu hút theo chủ đề "${topic}" dành cho nền tảng ${platform}.\nTrả về dữ liệu dạng JSON có cấu trúc chính xác như sau:\n{\n  "title": "Tiêu đề hấp dẫn ngắn gọn",\n  "content": "Nội dung caption chi tiết có emoji linh hoạt",\n  "hashtags": "#hashtag1 #hashtag2 #hashtag3"\n}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data: any = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title || `Kịch bản: ${topic}`,
        content: parsed.content || rawText,
        hashtags: parsed.hashtags || '#BizSocialERP #Marketing',
      };
    } catch (error) {
      return {
        title: `Kịch bản truyền thông: ${topic}`,
        content: `🚀 [BIZSOCIAL ERP CAMPAIGN] ${topic}\n\n✨ Điểm nổi bật:\n- Tối ưu hóa quy trình làm việc chuẩn ERP 2026\n- Quản lý tập trung đa kênh Social Media\n- Tích hợp Trí tuệ Nhân tạo Gemini AI bóc tách dữ liệu\n\n📌 Hãy liên hệ ngay hôm nay để nhận ưu đãi dùng thử!`,
        hashtags: '#BizSocialERP #SocialMediaManagement #ERP2026',
      };
    }
  }

  private safeParseJson(data: string | null, fallback: any) {
    if (!data) return fallback;
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
}
