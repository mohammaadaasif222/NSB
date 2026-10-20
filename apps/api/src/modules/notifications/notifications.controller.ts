import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { type EmailTestInput, emailTestSchema, type StorageTestResult } from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, CurrentAdmin } from '../auth/admin.guard.js';
import type { SessionPayload } from '../auth/auth.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('admin/notifications')
@UseGuards(AdminGuard)
export class AdminNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Sends a test email with the saved SMTP settings (to the signed-in admin by default). */
  @Post('test-email')
  @HttpCode(200)
  testEmail(
    @Body(new ZodPipe(emailTestSchema)) body: EmailTestInput,
    @CurrentAdmin() admin: SessionPayload,
  ): Promise<StorageTestResult> {
    return this.notifications.sendTest(body.to ?? admin.email);
  }
}
