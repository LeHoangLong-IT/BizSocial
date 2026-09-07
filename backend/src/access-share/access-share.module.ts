import { Module } from '@nestjs/common';
import { AccessShareController } from './access-share.controller.js';
import { AccessShareService } from './access-share.service.js';

@Module({
  controllers: [AccessShareController],
  providers: [AccessShareService],
  exports: [AccessShareService],
})
export class AccessShareModule {}
