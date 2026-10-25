import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { type AdminSettings, canDo, type SettingsUpdate, settingsUpdateSchema, type SiteSettings } from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, Allow, CurrentAdmin } from '../auth/admin.guard.js';
import type { CurrentAdminInfo } from '../auth/auth.service.js';
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

/** Home page and sponsor content that Admins (not only Super Admins) manage. */
const EDITOR_SETTINGS = new Set(['projectSideAd', 'homeCards']);

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** Editors read it too: the listing forms need the upload limit, Real Estate the sponsor ad. Secrets are never included. */
  @Get()
  @Allow('edit')
  get(): Promise<AdminSettings> {
    return this.settings.get();
  }

  /** Editors may save the home page cards and the project page sponsor ad; everything else is for Super Admins. */
  @Patch()
  @Allow('edit')
  update(@CurrentAdmin() admin: CurrentAdminInfo, @Body(new ZodPipe(settingsUpdateSchema)) body: SettingsUpdate): Promise<AdminSettings> {
    const others = Object.keys(body).filter((key) => !EDITOR_SETTINGS.has(key) && body[key as keyof SettingsUpdate] !== undefined);
    if (others.length && !canDo(admin.role, 'manage')) throw new ForbiddenException('Only a Super Admin can change these settings.');
    return this.settings.update(body);
  }
}
