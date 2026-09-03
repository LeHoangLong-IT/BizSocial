import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { OrganizationService } from './organization.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TransferMemberDto } from './dto/transfer-member.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { RequirePermission } from '../guards/require-permission.decorator.js';

@Controller('organization')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('overview')
  @RequirePermission('Department', 'READ')
  getOverview() {
    return this.orgService.getOverview();
  }

  @Get('departments')
  @RequirePermission('Department', 'READ')
  findAllDepartments() {
    return this.orgService.findAllDepartments();
  }

  @Get('departments/:id')
  @RequirePermission('Department', 'READ')
  findDepartmentById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.findDepartmentById(id);
  }

  @Post('departments')
  @RequirePermission('Department', 'CREATE')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.orgService.createDepartment(dto);
  }

  @Put('departments/:id')
  @RequirePermission('Department', 'UPDATE')
  updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.orgService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  @RequirePermission('Department', 'DELETE')
  deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.deleteDepartment(id);
  }

  @Get('teams')
  @RequirePermission('Department', 'READ')
  findAllTeams() {
    return this.orgService.findAllTeams();
  }

  @Post('teams')
  @RequirePermission('Department', 'CREATE')
  createTeam(@Body() dto: CreateTeamDto) {
    return this.orgService.createTeam(dto);
  }

  @Put('teams/:id')
  @RequirePermission('Department', 'UPDATE')
  updateTeam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.orgService.updateTeam(id, dto);
  }

  @Delete('teams/:id')
  @RequirePermission('Department', 'DELETE')
  deleteTeam(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.deleteTeam(id);
  }

  @Post('transfer-member')
  @RequirePermission('Department', 'UPDATE')
  transferMember(@Body() dto: TransferMemberDto, @Req() req: any) {
    return this.orgService.transferMember(dto, req.user);
  }

  @Get('transfer-logs')
  @RequirePermission('Department', 'READ')
  getTransferLogs() {
    return this.orgService.getTransferLogs();
  }
}
