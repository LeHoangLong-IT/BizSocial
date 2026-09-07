import { Injectable } from '@nestjs/common';
import { PrismaClient, ScopeLevel, AccessLevel } from '@prisma/client';

const prisma = new PrismaClient();

export interface CheckAccessParams {
  userId: number;
  userRoleId: number;
  userDepartmentId?: number | null;
  userTeamId?: number | null;
  moduleName: string;
  action: string;
  resourceId?: string;
  resourceOwnerId?: number;
  resourceTeamId?: number | null;
  resourceDeptId?: number | null;
}

export interface AccessCheckResult {
  allowed: boolean;
  scope: ScopeLevel;
  viaDac: boolean;
  accessLevel?: AccessLevel;
  reason?: string;
}

@Injectable()
export class HybridAuthorizationService {
  /**
   * Đánh giá 3 Lớp Phân Quyền: Lớp 1 (RBAC) ➔ Lớp 2 (DAC Override) ➔ Lớp 3 (Scope)
   */
  async checkAccess(params: CheckAccessParams): Promise<AccessCheckResult> {
    const {
      userId,
      userRoleId,
      userDepartmentId,
      userTeamId,
      moduleName,
      action,
      resourceId,
      resourceOwnerId,
      resourceTeamId,
      resourceDeptId,
    } = params;

    // Super Admin: Bỏ qua kiểm tra, có toàn quyền
    const role = await prisma.role.findUnique({ where: { id: userRoleId } });
    if (role?.name === 'Super Admin') {
      return { allowed: true, scope: ScopeLevel.GLOBAL, viaDac: false };
    }

    // ------------------------------------------------------------------------
    // LỚP 1: RBAC Check (Vai trò gốc)
    // ------------------------------------------------------------------------
    const moduleRecord = await prisma.module.findUnique({ where: { name: moduleName } });
    if (!moduleRecord) {
      return { allowed: false, scope: ScopeLevel.PERSONAL, viaDac: false, reason: `Module ${moduleName} không tồn tại` };
    }

    const perm = await prisma.permission.findFirst({
      where: {
        moduleId: moduleRecord.id,
        action: action,
        OR: [{ roleId: userRoleId }, { userId: userId }],
      },
    });

    if (!perm) {
      return { allowed: false, scope: ScopeLevel.PERSONAL, viaDac: false, reason: `Không có quyền RBAC ${action} trên ${moduleName}` };
    }

    // Nếu chỉ kiểm tra quyền truy cập module chung (chưa chỉ định tài nguyên cụ thể)
    if (!resourceId) {
      return { allowed: true, scope: perm.scope, viaDac: false };
    }

    // ------------------------------------------------------------------------
    // LỚP 2: DAC Check (Chia sẻ / Ủy quyền trực tiếp cho User hoặc Team)
    // ------------------------------------------------------------------------
    const now = new Date();
    const dacShare = await prisma.resourceAccessShare.findFirst({
      where: {
        resourceType: moduleName,
        resourceId: String(resourceId),
        OR: [
          { sharedWithId: userId, sharedType: 'USER' },
          ...(userTeamId ? [{ sharedWithId: userTeamId, sharedType: 'TEAM' }] : []),
        ],
        AND: [
          { OR: [{ expireAt: null }, { expireAt: { gte: now } }] },
        ],
      },
    });

    if (dacShare) {
      // Đánh giá cấp độ truy cập DAC (AccessLevel)
      const allowedByDac = this.evaluateAccessLevel(action, dacShare.accessLevel);
      if (allowedByDac) {
        return {
          allowed: true,
          scope: perm.scope,
          viaDac: true,
          accessLevel: dacShare.accessLevel,
        };
      }
    }

    // ------------------------------------------------------------------------
    // LỚP 3: Scope Filter Check (Phạm vi dữ liệu tự động)
    // ------------------------------------------------------------------------
    switch (perm.scope) {
      case ScopeLevel.GLOBAL:
        return { allowed: true, scope: ScopeLevel.GLOBAL, viaDac: false };

      case ScopeLevel.DEPARTMENT:
        const inSameDept = userDepartmentId && resourceDeptId && userDepartmentId === resourceDeptId;
        return {
          allowed: !!inSameDept || resourceOwnerId === userId,
          scope: ScopeLevel.DEPARTMENT,
          viaDac: false,
        };

      case ScopeLevel.TEAM:
        const inSameTeam = userTeamId && resourceTeamId && userTeamId === resourceTeamId;
        return {
          allowed: !!inSameTeam || resourceOwnerId === userId,
          scope: ScopeLevel.TEAM,
          viaDac: false,
        };

      case ScopeLevel.PERSONAL:
      default:
        return {
          allowed: resourceOwnerId === userId,
          scope: ScopeLevel.PERSONAL,
          viaDac: false,
        };
    }
  }

  /**
   * Helper đánh giá xem AccessLevel của DAC có thỏa mãn action yêu cầu không
   */
  private evaluateAccessLevel(action: string, level: AccessLevel): boolean {
    if (level === AccessLevel.FULL_CONTROL) return true;
    if (action === 'READ') return true; // Cả CAN_VIEW, CAN_EDIT, CAN_APPROVE đều được đọc
    if (action === 'UPDATE' && level === AccessLevel.CAN_EDIT) return true;
    if (action === 'APPROVE' && level === AccessLevel.CAN_APPROVE) return true;
    return false;
  }
}
