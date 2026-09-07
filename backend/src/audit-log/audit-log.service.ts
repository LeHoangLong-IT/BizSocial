import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAuditLogDto {
  userId?: number;
  userName?: string;
  action: string;
  details: string;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  async logAction(dto: CreateAuditLogDto) {
    return prisma.securityAuditLog.create({
      data: {
        userId: dto.userId || null,
        userName: dto.userName || 'System / Admin',
        action: dto.action,
        details: dto.details,
        ipAddress: dto.ipAddress || '127.0.0.1',
      },
    });
  }

  async getLogs(limit: number = 50) {
    return prisma.securityAuditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
