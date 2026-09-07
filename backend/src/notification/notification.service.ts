import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { NotificationGateway } from './notification.gateway.js';

const prisma = new PrismaClient();

@Injectable()
export class NotificationService {
  constructor(private gateway: NotificationGateway) {}

  async seedDefaultsIfEmpty(userId: number) {
    const count = await prisma.notification.count({
      where: { userId, deletedAt: null },
    });

    if (count === 0) {
      const defaults = [
        {
          title: 'Bài đăng Facebook Reels đã được phê duyệt',
          desc: 'Leader Merline đã duyệt bài đăng "Series Reels ERP 2026". Bài sẽ được xuất bản lúc 14:00.',
          type: 'approval',
          read: false,
        },
        {
          title: 'Phân công Lead CRM mới từ TikTok',
          desc: 'Bạn vừa được hệ thống tự động phân bổ 1 Lead tiềm năng từ chiến dịch TikTok Viral Summer.',
          type: 'crm',
          read: false,
        },
        {
          title: 'Chúc mừng! Đạt Huy hiệu "Senior Content Specialist"',
          desc: 'Bạn đã tích lũy đủ 850 XP và mở khóa huy hiệu thành tích Level 3 trong hệ thống.',
          type: 'badge',
          read: false,
        },
        {
          title: 'Cập nhật tính năng AI Gemini v2.4',
          desc: 'Hệ thống đã nâng cấp module phân tích cảm xúc comment tự động.',
          type: 'system',
          read: true,
        },
        {
          title: 'Nhắc nhở: Lịch họp trực tuần',
          desc: 'Báo cáo tổng kết tuần của Team Content Creator diễn ra lúc 09:00 sáng mai.',
          type: 'meeting',
          read: true,
        },
      ];

      for (const item of defaults) {
        await prisma.notification.create({
          data: {
            userId,
            title: item.title,
            desc: item.desc,
            type: item.type,
            read: item.read,
          },
        });
      }
    }
  }

  async findAllForUser(userId: number) {
    await this.seedDefaultsIfEmpty(userId);
    const notifications = await prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n: any) => ({
      id: n.id.toString(),
      title: n.title,
      desc: n.desc,
      time: this.formatTimeAgo(n.createdAt),
      read: n.read,
      type: n.type,
      createdAt: n.createdAt,
    }));
  }

  async toggleRead(userId: number, id: number) {
    const notif = await prisma.notification.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!notif) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: !notif.read },
    });

    return {
      id: updated.id.toString(),
      title: updated.title,
      desc: updated.desc,
      time: this.formatTimeAgo(updated.createdAt),
      read: updated.read,
      type: updated.type,
      createdAt: updated.createdAt,
    };
  }

  async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, read: false, deletedAt: null },
      data: { read: true },
    });

    return this.findAllForUser(userId);
  }

  async create(userId: number, dto: CreateNotificationDto) {
    const targetUserId = dto.userId || userId;
    const n = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: dto.title,
        desc: dto.desc,
        type: dto.type || 'system',
        read: false,
      },
    });

    const result = {
      id: n.id.toString(),
      title: n.title,
      desc: n.desc,
      time: 'Vừa xong',
      read: n.read,
      type: n.type,
      createdAt: n.createdAt,
    };

    // Broadcast to user socket room in real-time
    this.gateway.sendNotificationToUser(targetUserId, result);

    return result;
  }

  private formatTimeAgo(date: Date): string {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  }
}
