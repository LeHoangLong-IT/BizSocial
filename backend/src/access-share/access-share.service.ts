import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, AccessLevel } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateShareDto {
  resourceType: string;
  resourceId: string;
  sharedWithId: number;
  sharedType?: 'USER' | 'TEAM';
  accessLevel?: AccessLevel;
  expireAt?: string | null;
}

@Injectable()
export class AccessShareService {
  async shareResource(createdById: number, dto: CreateShareDto) {
    if (!dto.resourceType || !dto.resourceId || !dto.sharedWithId) {
      throw new BadRequestException('Thiếu thông tin bắt buộc để chia sẻ tài nguyên!');
    }

    const share = await prisma.resourceAccessShare.create({
      data: {
        resourceType: dto.resourceType,
        resourceId: String(dto.resourceId),
        sharedWithId: Number(dto.sharedWithId),
        sharedType: dto.sharedType || 'USER',
        accessLevel: dto.accessLevel || AccessLevel.CAN_VIEW,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : null,
        createdById: createdById,
      },
    });

    return { message: 'Chia sẻ tài nguyên / ủy quyền thành công!', share };
  }

  async getResourceShares(resourceType: string, resourceId: string) {
    const shares = await prisma.resourceAccessShare.findMany({
      where: {
        resourceType,
        resourceId: String(resourceId),
      },
      orderBy: { createdAt: 'desc' },
    });

    return shares;
  }

  async removeShare(id: number) {
    const existing = await prisma.resourceAccessShare.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Quyền chia sẻ không tồn tại!');
    }

    await prisma.resourceAccessShare.delete({ where: { id } });
    return { message: 'Thu hồi quyền chia sẻ thành công!' };
  }
}
