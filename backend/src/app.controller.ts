import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AuthGuard } from './auth/auth.guard.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard/stats')
  @UseGuards(AuthGuard)
  getDashboardStats() {
    return this.appService.getDashboardStats();
  }
}
