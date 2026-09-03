import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { TogglePermissionDto } from './dto/toggle-permission.dto.js';
import { BatchUpdateRolePermissionsDto } from './dto/batch-update-permissions.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { RequirePermission } from '../guards/require-permission.decorator.js';

@Controller('roles')
@UseGuards(AuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('Role', 'READ')
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get('matrix')
  @RequirePermission('Role', 'READ')
  getMatrix() {
    return this.rolesService.getMatrix();
  }

  @Get(':id')
  @RequirePermission('Role', 'READ')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findRoleById(id);
  }

  @Post('matrix/toggle')
  @RequirePermission('Role', 'UPDATE')
  togglePermission(@Body() toggleDto: TogglePermissionDto) {
    return this.rolesService.togglePermission(toggleDto);
  }

  @Post('matrix/batch-update')
  @RequirePermission('Role', 'UPDATE')
  batchUpdate(@Body() batchDto: BatchUpdateRolePermissionsDto) {
    return this.rolesService.batchUpdateRolePermissions(batchDto);
  }
}
