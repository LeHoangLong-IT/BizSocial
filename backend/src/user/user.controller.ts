import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { RequirePermission } from '../guards/require-permission.decorator.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';

import { AuthGuard } from '../auth/auth.guard.js';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission('User', 'CREATE')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermission('User', 'READ')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermission('User', 'READ')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermission('User', 'UPDATE')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermission('User', 'DELETE')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch(':id/restore')
  @RequirePermission('User', 'UPDATE')
  restore(@Param('id') id: string) {
    return this.userService.restore(+id);
  }

  @Delete(':id/permanent')
  @RequirePermission('User', 'DELETE')
  permanentDelete(@Param('id') id: string) {
    return this.userService.permanentDelete(+id);
  }
}
