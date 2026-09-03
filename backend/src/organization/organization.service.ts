import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TransferMemberDto } from './dto/transfer-member.dto.js';

const prisma = new PrismaClient();

@Injectable()
export class OrganizationService {
  /**
   * Lấy bức tranh tổng quan toàn bộ Cơ cấu Tổ chức (Thống kê + Cây phân cấp Org Chart)
   */
  async getOverview() {
    const [departments, teams, allUsers] = await Promise.all([
      prisma.department.findMany({
        where: { deletedAt: null },
        include: {
          manager: {
            select: { id: true, name: true, email: true, phone: true, role: { select: { name: true } } },
          },
          teams: {
            where: { deletedAt: null },
            include: {
              leader: {
                select: { id: true, name: true, email: true, phone: true, role: { select: { name: true } } },
              },
              users: {
                where: { deletedAt: null },
                select: { id: true, name: true, email: true, phone: true, role: { select: { name: true } } },
              },
            },
          },
          users: {
            where: { deletedAt: null },
            select: { id: true, name: true, email: true, phone: true, teamId: true, role: { select: { name: true } } },
          },
        },
        orderBy: { id: 'asc' },
      }),
      prisma.team.findMany({
        where: { deletedAt: null },
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, email: true, departmentId: true, teamId: true, role: { select: { name: true } } },
      }),
    ]);

    const totalDepartments = departments.length;
    const totalTeams = teams.length;
    const totalUsers = allUsers.length;
    const assignedUsers = allUsers.filter((u) => u.departmentId !== null).length;
    const unassignedUsers = totalUsers - assignedUsers;

    // Đếm số lượng lãnh đạo (Trưởng phòng + Trưởng nhóm duy nhất)
    const leaderSet = new Set<number>();
    departments.forEach((d) => {
      if (d.managerId) leaderSet.add(d.managerId);
      d.teams.forEach((t) => {
        if (t.leaderId) leaderSet.add(t.leaderId);
      });
    });

    return {
      stats: {
        totalDepartments,
        totalTeams,
        totalUsers,
        assignedUsers,
        unassignedUsers,
        totalLeaders: leaderSet.size,
      },
      departments,
      allUsers,
    };
  }

  /**
   * Lấy danh sách toàn bộ Phòng ban
   */
  async findAllDepartments() {
    return prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        manager: {
          select: { id: true, name: true, email: true, phone: true, role: { select: { name: true } } },
        },
        teams: {
          where: { deletedAt: null },
          include: {
            leader: { select: { id: true, name: true, email: true, role: { select: { name: true } } } },
            _count: { select: { users: { where: { deletedAt: null } } } },
          },
        },
        _count: {
          select: {
            teams: { where: { deletedAt: null } },
            users: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Lấy chi tiết 1 phòng ban
   */
  async findDepartmentById(id: number) {
    const dept = await prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: {
          select: { id: true, name: true, email: true, phone: true, role: { select: { name: true } } },
        },
        teams: {
          where: { deletedAt: null },
          include: {
            leader: { select: { id: true, name: true, email: true } },
            users: { where: { deletedAt: null }, select: { id: true, name: true, email: true, role: true } },
          },
        },
        users: {
          where: { deletedAt: null },
          select: { id: true, name: true, email: true, phone: true, teamId: true, role: true },
        },
      },
    });

    if (!dept) {
      throw new NotFoundException(`Không tìm thấy phòng ban #${id}`);
    }

    return dept;
  }

  /**
   * Tạo mới Phòng ban
   */
  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await prisma.department.findFirst({
      where: { name: dto.name, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`Phòng ban với tên '${dto.name}' đã tồn tại!`);
    }

    const dept = await prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        managerId: dto.managerId || null,
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    // Nếu có chỉ định manager, cập nhật luôn departmentId cho người đó
    if (dto.managerId) {
      await prisma.user.update({
        where: { id: dto.managerId },
        data: { departmentId: dept.id },
      });
    }

    return dept;
  }

  /**
   * Chỉnh sửa Phòng ban
   */
  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    await this.findDepartmentById(id);

    if (dto.name) {
      const duplicate = await prisma.department.findFirst({
        where: { name: dto.name, id: { not: id }, deletedAt: null },
      });
      if (duplicate) {
        throw new BadRequestException(`Tên phòng ban '${dto.name}' đã được sử dụng!`);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.managerId !== undefined && { managerId: dto.managerId }),
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    if (dto.managerId) {
      await prisma.user.update({
        where: { id: dto.managerId },
        data: { departmentId: id },
      });
    }

    return updated;
  }

  /**
   * Xóa mềm Phòng ban
   */
  async deleteDepartment(id: number) {
    await this.findDepartmentById(id);

    // Kiểm tra xem phòng ban còn nhân sự không
    const memberCount = await prisma.user.count({
      where: { departmentId: id, deletedAt: null },
    });

    if (memberCount > 0) {
      throw new BadRequestException(`Phòng ban hiện vẫn còn ${memberCount} nhân viên. Vui lòng điều chuyển nhân sự sang phòng ban khác trước khi xóa!`);
    }

    // Xóa mềm các team trực thuộc
    await prisma.team.updateMany({
      where: { departmentId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Lấy danh sách toàn bộ Đội nhóm (Teams)
   */
  async findAllTeams() {
    return prisma.team.findMany({
      where: { deletedAt: null },
      include: {
        department: { select: { id: true, name: true } },
        leader: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { users: { where: { deletedAt: null } } } },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Tạo Đội nhóm mới
   */
  async createTeam(dto: CreateTeamDto) {
    const existing = await prisma.team.findFirst({
      where: { name: dto.name, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`Đội nhóm '${dto.name}' đã tồn tại!`);
    }

    const team = await prisma.team.create({
      data: {
        name: dto.name,
        departmentId: dto.departmentId,
        description: dto.description || null,
        leaderId: dto.leaderId || null,
      },
      include: {
        department: { select: { id: true, name: true } },
        leader: { select: { id: true, name: true, email: true } },
      },
    });

    // Nếu có leader, gán luôn user đó vào team và department này
    if (dto.leaderId) {
      await prisma.user.update({
        where: { id: dto.leaderId },
        data: { teamId: team.id, departmentId: dto.departmentId },
      });
    }

    return team;
  }

  /**
   * Cập nhật Đội nhóm
   */
  async updateTeam(id: number, dto: UpdateTeamDto) {
    const team = await prisma.team.findFirst({
      where: { id, deletedAt: null },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội nhóm #${id}`);
    }

    if (dto.name) {
      const duplicate = await prisma.team.findFirst({
        where: { name: dto.name, id: { not: id }, deletedAt: null },
      });
      if (duplicate) {
        throw new BadRequestException(`Tên đội nhóm '${dto.name}' đã được sử dụng!`);
      }
    }

    const updated = await prisma.team.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.leaderId !== undefined && { leaderId: dto.leaderId }),
      },
      include: {
        department: { select: { id: true, name: true } },
        leader: { select: { id: true, name: true, email: true } },
      },
    });

    if (dto.leaderId) {
      await prisma.user.update({
        where: { id: dto.leaderId },
        data: { teamId: id, departmentId: updated.departmentId },
      });
    }

    return updated;
  }

  /**
   * Xóa mềm Đội nhóm
   */
  async deleteTeam(id: number) {
    const team = await prisma.team.findFirst({
      where: { id, deletedAt: null },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội nhóm #${id}`);
    }

    // Điều chuyển các user khỏi team (giữ nguyên department)
    await prisma.user.updateMany({
      where: { teamId: id, deletedAt: null },
      data: { teamId: null },
    });

    return prisma.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Điều chuyển nhân sự sang Phòng ban / Đội nhóm khác & Ghi nhật ký Audit Log
   */
  async transferMember(dto: TransferMemberDto, currentUser?: any) {
    const user = await prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
      include: {
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${dto.userId}`);
    }

    let targetDeptName: string | null = null;
    let targetTeamName: string | null = null;

    if (dto.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: dto.departmentId, deletedAt: null },
      });
      if (!dept) {
        throw new NotFoundException(`Không tìm thấy phòng ban #${dto.departmentId}`);
      }
      targetDeptName = dept.name;
    }

    if (dto.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: dto.teamId, deletedAt: null },
      });
      if (!team) {
        throw new NotFoundException(`Không tìm thấy đội nhóm #${dto.teamId}`);
      }
      if (dto.departmentId && team.departmentId !== dto.departmentId) {
        throw new BadRequestException(`Đội nhóm '${team.name}' không thuộc phòng ban đã chọn!`);
      }
      targetTeamName = team.name;
    }

    const newDeptId = dto.departmentId !== undefined ? dto.departmentId : user.departmentId;
    const newTeamId = dto.teamId !== undefined ? dto.teamId : user.teamId;

    const updatedUser = await prisma.user.update({
      where: { id: dto.userId },
      data: {
        departmentId: newDeptId,
        teamId: newTeamId,
      },
      include: {
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // Ghi nhật ký lịch sử điều chuyển (Audit Log)
    await prisma.departmentTransferLog.create({
      data: {
        userId: dto.userId,
        fromDeptId: user.departmentId,
        fromDeptName: user.department?.name || null,
        toDeptId: newDeptId,
        toDeptName: targetDeptName || (newDeptId === user.departmentId ? user.department?.name : null),
        fromTeamId: user.teamId,
        fromTeamName: user.team?.name || null,
        toTeamId: newTeamId,
        toTeamName: targetTeamName || (newTeamId === user.teamId ? user.team?.name : null),
        reason: dto.reason || null,
        changedById: currentUser?.id || null,
        changedByName: currentUser?.name || currentUser?.email || 'Quản trị viên',
      },
    });

    return updatedUser;
  }

  /**
   * Lấy danh sách Nhật ký Lịch sử Điều chuyển
   */
  async getTransferLogs(limit = 100) {
    return prisma.departmentTransferLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { id: true, name: true } },
          },
        },
      },
    });
  }
}
