import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { OrganizationModule } from './organization/organization.module.js';
import { UserModule } from './user/user.module.js';
import { RolesModule } from './roles/roles.module.js';
import { AccessShareModule } from './access-share/access-share.module.js';
import { AuditLogModule } from './audit-log/audit-log.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { HybridAuthorizationService } from './guards/hybrid-authorization.service.js';

@Module({
  imports: [AuthModule, OrganizationModule, UserModule, RolesModule, AccessShareModule, AuditLogModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService, HybridAuthorizationService],
})
export class AppModule {}
