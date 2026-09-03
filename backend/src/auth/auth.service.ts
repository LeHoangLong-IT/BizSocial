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

    const permissions = rawPermissions.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module.name,
      action: p.action,
    }));

    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        departmentId: user.departmentId,
        teamId: user.teamId,
      },
      permissions,
    };
  }
}
