import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TogglePermissionDto } from './dto/toggle-permission.dto.js';
import { BatchUpdateRolePermissionsDto } from './dto/batch-update-permissions.dto.js';

const prisma = new PrismaClient();

@Injectable()
export class RolesService {
  async findAllRoles() {
    const roles = await prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            users: { where: { deletedAt: null } },
            permissions: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      usersCount: r._count.users,
      permissionsCount: r._count.permissions,
      createdAt: r.createdAt,
    }));
  }

  async getMatrix() {
    const [roles, modules, permissions] = await Promise.all([
      prisma.role.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' },
        include: {
          _count: {
            select: { users: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.module.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' },
      }),
      prisma.permission.findMany({
        where: {
          roleId: { not: null },
          deletedAt: null,
        },
        select: {
          id: true,
          roleId: true,
          moduleId: true,
          action: true,
        },
      }),
    ]);

    return {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        usersCount: r._count.users,
      })),
      modules: modules.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
      })),
      permissions,
    };
  }

  async findRoleById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: { module: true },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Không tìm thấy vai trò với ID ${id}`);
    }

    return {
      ...role,
      users: role.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.deletedAt ? 'Inactive' : 'Active',
      })),
    };
  }

  async togglePermission(dto: TogglePermissionDto) {
    const role = await prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại');
    }

    if (role.name === 'Super Admin') {
      throw new BadRequestException(
        'Không thể thay đổi quyền của Super Admin nhằm bảo vệ an toàn hệ thống',
      );
    }

    const existing = await prisma.permission.findFirst({
      where: {
        roleId: dto.roleId,
        moduleId: dto.moduleId,
        action: dto.action,
        deletedAt: null,
      },
    });

    if (existing) {
      await prisma.permission.delete({
        where: { id: existing.id },
      });
      return {
        granted: false,
        message: `Đã thu hồi quyền ${dto.action} của vai trò ${role.name}`,
      };
    } else {
      await prisma.permission.create({
        data: {
          roleId: dto.roleId,
          moduleId: dto.moduleId,
          action: dto.action,
        },
      });
      return {
        granted: true,
        message: `Đã cấp quyền ${dto.action} cho vai trò ${role.name}`,
      };
    }
  }

  async batchUpdateRolePermissions(dto: BatchUpdateRolePermissionsDto) {
    const role = await prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại');
    }

    if (role.name === 'Super Admin') {
      throw new BadRequestException(
        'Không thể thay đổi quyền của Super Admin nhằm bảo vệ an toàn hệ thống',
      );
    }

    await prisma.$transaction(async (tx) => {
      // Xóa các quyền hiện tại của Role này
      await tx.permission.deleteMany({
        where: { roleId: dto.roleId },
      });

      // Tạo mới danh sách quyền được chọn
      if (dto.permissions && dto.permissions.length > 0) {
        await tx.permission.createMany({
          data: dto.permissions.map((p) => ({
            roleId: dto.roleId,
            moduleId: p.moduleId,
            action: p.action,
          })),
        });
      }
    });

    return {
      success: true,
      message: `Cập nhật thành công ${dto.permissions?.length || 0} quyền cho vai trò ${role.name}`,
    };
  }
}
