import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  // Sinh mật khẩu ngẫu nhiên 8 ký tự
  private generateRandomPassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        phone: createUserDto.phone,
        roleId: createUserDto.roleId,
        departmentId: createUserDto.departmentId,
        teamId: createUserDto.teamId,
        password: hashedPassword,
      },
      include: {
        role: true,
        department: true,
      }
    });

    // Trả về kèm raw password để Admin thấy và gửi cho user
    return {
      message: 'Tạo tài khoản thành công',
      user,
      generatedPassword: randomPassword,
    };
  }

  async findAll() {
    return prisma.user.findMany({
      include: {
        role: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        permissions: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure user exists

    if (updateUserDto.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: updateUserDto.email, id: { not: id } }
      });
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng');
      }
    }

    const updateData: any = {
      email: updateUserDto.email,
      name: updateUserDto.name,
      phone: updateUserDto.phone,
      roleId: updateUserDto.roleId,
      departmentId: updateUserDto.departmentId,
      teamId: updateUserDto.teamId,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        department: true,
      }
    });

    return {
      message: 'Cập nhật thành công',
      user: updatedUser
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return {
      message: 'Khóa tài khoản thành công'
    };
  }

  async restore(id: number) {
    await this.findOne(id);

    await prisma.user.update({
      where: { id },
      data: { deletedAt: null }
    });

    return {
      message: 'Khôi phục tài khoản thành công'
    };
  }

  async permanentDelete(id: number) {
    await this.findOne(id);

    // Xóa permissions trực tiếp nếu có
    await prisma.permission.deleteMany({
      where: { userId: id }
    });

    await prisma.user.delete({
      where: { id }
    });

    return {
      message: 'Xóa vĩnh viễn tài khoản thành công'
    };
  }
}
