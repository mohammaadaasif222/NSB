import { Module } from '@nestjs/common';
import { AdminSettingsController, SiteSettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';

@Module({
  controllers: [AdminSettingsController, SiteSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
