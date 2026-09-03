import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { OrganizationModule } from './organization/organization.module.js';
import { UserModule } from './user/user.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [AuthModule, OrganizationModule, UserModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
