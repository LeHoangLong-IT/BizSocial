import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service.js';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getLogs(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 50;
    return this.auditLogService.getLogs(take);
  }
}
