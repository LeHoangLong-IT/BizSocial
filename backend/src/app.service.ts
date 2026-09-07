import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AppService {
  getHello(): string {
    return 'BizSocial ERP API Running!';
  }

  async getDashboardStats() {
    const [
      totalUsers,
      inactiveUsers,
      departmentsCount,
      teamsCount,
      rolesCount,
      departments,
      roles,
      recentUsers,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { NOT: { deletedAt: null } } }),
      prisma.department.count({ where: { deletedAt: null } }),
      prisma.team.count({ where: { deletedAt: null } }),
      prisma.role.count({ where: { deletedAt: null } }),
      prisma.department.findMany({
        where: { deletedAt: null },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.role.findMany({
        where: { deletedAt: null },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          role: { select: { name: true } },
          department: { select: { name: true } },
          team: { select: { name: true } },
        },
      }),
      prisma.departmentTransferLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const palette = ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#ec4899'];

    const departmentDistribution = departments.map((d, index) => ({
      name: d.name,
      value: d._count.users,
      color: palette[index % palette.length],
    }));

    const roleDistribution = roles.map((r) => ({
      name: r.name,
      count: r._count.users,
    }));

    return {
      summary: {
        totalUsers,
        activeUsers: totalUsers,
        inactiveUsers,
        departmentsCount,
        teamsCount,
        rolesCount,
        attendanceRate: 98.4,
      },
      departmentDistribution,
      roleDistribution,
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name || u.email.split('@')[0],
        email: u.email,
        role: u.role?.name || 'Nhân viên',
        department: u.department?.name || 'Chưa gán',
        team: u.team?.name || 'Chưa gán',
        createdAt: u.createdAt,
      })),
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        userId: log.userId,
        fromDept: log.fromDeptName || 'Chưa có',
        toDept: log.toDeptName || 'Chưa có',
        reason: log.reason || 'Luân chuyển chuyên môn',
        changedByName: log.changedByName || 'Hệ thống',
        createdAt: log.createdAt,
      })),
    };
  }
}
