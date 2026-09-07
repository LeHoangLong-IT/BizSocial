import { Controller, Post, Get, Delete, Body, Param, Request } from '@nestjs/common';
import { AccessShareService } from './access-share.service.js';
import type { CreateShareDto } from './access-share.service.js';

@Controller('access-share')
export class AccessShareController {
  constructor(private readonly accessShareService: AccessShareService) {}

  @Post()
  async shareResource(@Request() req: any, @Body() dto: CreateShareDto) {
    const userId = req.user?.id || 1;
    return this.accessShareService.shareResource(userId, dto);
  }

  @Get('resource/:type/:id')
  async getResourceShares(
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    return this.accessShareService.getResourceShares(type, id);
  }

  @Delete(':id')
  async removeShare(@Param('id') id: string) {
    return this.accessShareService.removeShare(Number(id));
  }
}
