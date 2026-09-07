import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TogglePermissionDto } from './dto/toggle-permission.dto.js';

const prisma = new PrismaClient();

const PROTECTED_ROLES = ['Super Admin', 'Manager', 'Leader', 'Employee', 'Intern'];

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
      isProtected: PROTECTED_ROLES.includes(r.name),
      createdAt: r.createdAt,
    }));
  }

  async createRole(dto: { name: string; description?: string }) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Tên vai trò không được để trống!');
    }

    const existing = await prisma.role.findFirst({
      where: { name: dto.name.trim(), deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException(`Vai trò "${dto.name}" đã tồn tại trên hệ thống!`);
    }

    const newRole = await prisma.role.create({
      data: {
        name: dto.name.trim(),
        description: dto.description || null,
      },
    });

    // Ghi log bảo mật
    await prisma.securityAuditLog.create({
      data: {
        action: 'ROLE_CREATE',
        details: `Tạo thành công vai trò tùy chỉnh mới: "${newRole.name}" (ID #${newRole.id})`,
      },
    });

    return newRole;
  }

  async updateRole(id: number, dto: { name?: string; description?: string }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại!');
    }

    if (PROTECTED_ROLES.includes(role.name) && dto.name && dto.name !== role.name) {
      throw new BadRequestException(`Không được thay đổi tên của vai trò hệ thống bảo vệ "${role.name}"`);
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : role.name,
        description: dto.description !== undefined ? dto.description : role.description,
      },
    });

    // Ghi log bảo mật
    await prisma.securityAuditLog.create({
      data: {
        action: 'ROLE_UPDATE',
        details: `Cập nhật thông tin vai trò: "${updated.name}" (ID #${updated.id})`,
      },
    });

    return updated;
  }

  async deleteRole(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: { where: { deletedAt: null } } },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại!');
    }

    if (PROTECTED_ROLES.includes(role.name)) {
      throw new BadRequestException(`Vai trò hệ thống "${role.name}" được bảo vệ vĩnh viễn, không thể xóa!`);
    }

    if (role._count.users > 0) {
      throw new BadRequestException(`Không thể xóa vai trò "${role.name}" vì đang có ${role._count.users} nhân sự gắn vai trò này!`);
    }

    await prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Ghi log bảo mật
    await prisma.securityAuditLog.create({
      data: {
        action: 'ROLE_DELETE',
        details: `Xóa vai trò tùy chỉnh: "${role.name}" (ID #${role.id})`,
      },
    });

    return { message: `Đã xóa thành công vai trò "${role.name}"` };
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
          scope: true,
        },
      }),
    ]);

    return {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isProtected: PROTECTED_ROLES.includes(r.name),
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
      isProtected: PROTECTED_ROLES.includes(role.name),
      users: role.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.deletedAt ? 'Inactive' : 'Active',
      })),
    };
  }

  async togglePermission(dto: TogglePermissionDto & { scope?: any }) {
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
      if (dto.scope && existing.scope !== dto.scope) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: { scope: dto.scope },
        });
        return {
          granted: true,
          scope: dto.scope,
          message: `Đã cập nhật phạm vi ${dto.scope} cho quyền ${dto.action} của vai trò ${role.name}`,
        };
      } else {
        await prisma.permission.delete({
          where: { id: existing.id },
        });
        return {
          granted: false,
          message: `Đã thu hồi quyền ${dto.action} của vai trò ${role.name}`,
        };
      }
    } else {
      await prisma.permission.create({
        data: {
          roleId: dto.roleId,
          moduleId: dto.moduleId,
          action: dto.action,
          scope: dto.scope || 'PERSONAL',
        },
      });
      return {
        granted: true,
        scope: dto.scope || 'PERSONAL',
        message: `Đã cấp quyền ${dto.action} (${dto.scope || 'PERSONAL'}) cho vai trò ${role.name}`,
      };
    }
  }

  async batchUpdateRolePermissions(dto: any) {
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
      await tx.permission.deleteMany({
        where: { roleId: dto.roleId },
      });

      if (dto.permissions && dto.permissions.length > 0) {
        await tx.permission.createMany({
          data: dto.permissions.map((p: any) => ({
            roleId: dto.roleId,
            moduleId: p.moduleId,
            action: p.action,
            scope: p.scope || 'PERSONAL',
          })),
        });
      }
    });

    // Ghi log bảo mật
    await prisma.securityAuditLog.create({
      data: {
        action: 'MATRIX_UPDATE',
        details: `Cập nhật ma trận phân quyền & Scope cho vai trò: "${role.name}" (${dto.permissions?.length || 0} quyền được cấp)`,
      },
    });

    return {
      success: true,
      message: `Cập nhật thành công ${dto.permissions?.length || 0} quyền cho vai trò ${role.name}`,
    };
  }
}

