import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationService.findAllForUser(userId);
  }

  @Patch(':id/read')
  toggleRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationService.toggleRead(userId, +id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Post()
  create(@Body() dto: CreateNotificationDto, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationService.create(userId, dto);
  }
}
