import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { MailService } from './mail.service.js';
import { AdminNotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [SettingsModule],
  controllers: [AdminNotificationsController],
  providers: [NotificationsService, MailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
