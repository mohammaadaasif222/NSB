import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { type AdminSettings, type SettingsUpdate, settingsUpdateSchema, type SiteSettings } from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { SettingsService } from './settings.service.js';

/** Public settings the website reads, e.g. the WhatsApp number. Never includes secrets. */
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get(): Promise<SiteSettings> {
    return this.settings.siteSettings();
  }
}

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get(): Promise<AdminSettings> {
    return this.settings.get();
  }

  @Patch()
  update(@Body(new ZodPipe(settingsUpdateSchema)) body: SettingsUpdate): Promise<AdminSettings> {
    return this.settings.update(body);
  }
}
