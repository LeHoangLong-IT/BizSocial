import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    console.log(`Login attempt for email: "${email}" with password: "${pass}"`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch permissions
    const rawPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { roleId: user.roleId },
          { userId: user.id },
        ],
      },
      include: {
        module: true,
      }
    });

    let permissions = rawPermissions.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module.name,
      action: p.action,
    }));

    // Super Admin có tất cả quyền trên mọi modules
    if (user.role?.name === 'Super Admin') {
      const allModules = await prisma.module.findMany({ where: { deletedAt: null } });
      const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'];
      permissions = [];
      allModules.forEach(m => {
        actions.forEach(a => {
          permissions.push({
            moduleId: m.id,
            moduleName: m.name,
            action: a,
          });
        });
      });
    }

    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    const refreshPayload = { sub: user.id, email: user.email, tokenType: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1d' }),
      this.jwtService.signAsync(refreshPayload, { expiresIn: '7d' }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        roleId: user.roleId,
        roleName: user.role?.name || '',
        departmentId: user.departmentId,
        teamId: user.teamId,
      },
      permissions,
    };
  }

  async refreshToken(refreshTokenString: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenString);
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
      }

      // Fetch permissions
      const rawPermissions = await prisma.permission.findMany({
        where: {
          OR: [
            { roleId: user.roleId },
            { userId: user.id },
          ],
        },
        include: {
          module: true,
        }
      });

      let permissions = rawPermissions.map(p => ({
        moduleId: p.moduleId,
        moduleName: p.module.name,
        action: p.action,
      }));

      if (user.role?.name === 'Super Admin') {
        const allModules = await prisma.module.findMany({ where: { deletedAt: null } });
        const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'];
        permissions = [];
        allModules.forEach(m => {
          actions.forEach(a => {
            permissions.push({
              moduleId: m.id,
              moduleName: m.name,
              action: a,
            });
          });
        });
      }

      const newPayload = { sub: user.id, email: user.email, roleId: user.roleId };
      const newRefreshPayload = { sub: user.id, email: user.email, tokenType: 'refresh' };

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(newPayload, { expiresIn: '1d' }),
        this.jwtService.signAsync(newRefreshPayload, { expiresIn: '7d' }),
      ]);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          roleId: user.roleId,
          roleName: user.role?.name || '',
          departmentId: user.departmentId,
          teamId: user.teamId,
        },
        permissions,
      };
    } catch (err) {
      throw new UnauthorizedException('Refresh token đã hết hạn hoặc không hợp lệ');
    }
  }
}
