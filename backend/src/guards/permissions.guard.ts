import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from './require-permission.decorator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<{
      module: string;
      action: string;
    }>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming JWT auth populates this

    if (!user || !user.roleId) {
      throw new ForbiddenException('User role not found');
    }

    const { module, action } = requiredPermission;

    const moduleRecord = await prisma.module.findUnique({
      where: { name: module },
    });

    if (!moduleRecord) {
      throw new ForbiddenException(`Module ${module} not found`);
    }

    const hasPermission = await prisma.permission.findFirst({
      where: {
        roleId: user.roleId,
        moduleId: moduleRecord.id,
        action: action,
      },
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have ${action} permission for ${module}`,
      );
    }

    return true;
  }
}
