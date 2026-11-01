import { Module } from '@nestjs/common';
import { AdminSettingsController, SiteSettingsController } from './settings.controller.js';
import { SettingsSecrets } from './settings-secrets.js';
import { SettingsService } from './settings.service.js';
import { StorageCredentialsService } from './storage-credentials.service.js';

@Module({
  controllers: [AdminSettingsController, SiteSettingsController],
  providers: [SettingsSecrets, StorageCredentialsService, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
