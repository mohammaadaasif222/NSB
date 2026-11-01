import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Enquiry, StorageTestResult } from '@nsb/shared';
import type { Env } from '../../config/env.js';
import { SettingsService } from '../settings/settings.service.js';
import { adminEnquiryEmail, type EnquiryListing, vendorEnquiryEmail } from './enquiry-email.js';
import { MailService } from './mail.service.js';

export interface EnquiryNotice {
  enquiry: Enquiry;
  /** Null for a lead about no listing in particular (real estate "Get a callback"). */
  listing: EnquiryListing | null;
}

/** Who a lead alert goes to. */
export const ALERT_TARGETS = ['nsb', 'vendor'] as const;
export type AlertTarget = (typeof ALERT_TARGETS)[number];

/** What a saved lead needs for its alert to be sent later. */
export interface PendingAlert {
  listing: EnquiryListing | null;
  targets: AlertTarget[];
}

/** Some alerts could not be sent; `left` says whose, so a retry does not email the others again. */
export class AlertFailed extends Error {
  constructor(
    message: string,
    readonly left: AlertTarget[],
  ) {
    super(message);
  }
}

/**
 * Lead alerts by email, over the SMTP server configured in Admin > Settings. Callers must not
 * fail the request if a notification fails — the lead is already saved.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly siteUrl: string | undefined;
  private readonly adminUrl: string | undefined;

  constructor(
    private readonly settings: SettingsService,
    private readonly mail: MailService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('SITE_URL', { infer: true });
    this.adminUrl = config.get('ADMIN_URL', { infer: true }) ?? this.siteUrl;
  }

  /** Emails the NSB recipients and, if enabled, the vendor. Rejects with AlertFailed if any email failed. */
  async enquiryReceived({ enquiry, listing }: EnquiryNotice, targets: readonly AlertTarget[] = ALERT_TARGETS): Promise<void> {
    const vendorEmail = listing?.vendorEmail;
    const config = await this.settings.smtpConfig();
    if (!config?.enabled) {
      this.logger.log(`Enquiry ${enquiry.id} saved; email alerts are off`);
      return;
    }
    const all = [
      { target: 'nsb' as const, label: 'NSB recipients', send: () => this.mail.send(config, config.adminRecipients, adminEnquiryEmail(enquiry, listing, this.siteUrl, this.adminUrl)) },
      // The site-wide switch (Settings) and the listing's own switch must both allow it.
      ...(config.notifyVendor && listing?.notifyVendor && vendorEmail
        ? [{ target: 'vendor' as const, label: 'vendor', send: () => this.mail.send(config, [vendorEmail], vendorEnquiryEmail(enquiry)) }]
        : []),
    ];
    const sends = all.filter((s) => targets.includes(s.target));
    const results = await Promise.allSettled(sends.map((s) => s.send()));
    const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [`${sends[i].label}: ${(r.reason as Error).message}`] : []));
    const left = sends.filter((_, i) => results[i].status === 'rejected').map((s) => s.target);
    if (failed.length) throw new AlertFailed(`Enquiry ${enquiry.id} alert failed (${failed.join('; ')})`, left);
  }

  /** Sends a test email with the saved settings, even while alerts are switched off. */
  async sendTest(to: string): Promise<StorageTestResult> {
    const config = await this.settings.smtpConfig();
    if (!config) return { ok: false, message: 'Save the SMTP settings first.' };
    try {
      await this.mail.send(config, [to], {
        subject: 'Test email from Noida Super Bazaar',
        text: 'Your SMTP settings work. Enquiry alerts will be sent from this address.',
        html: '<p>Your SMTP settings work. Enquiry alerts will be sent from this address.</p>',
      });
      return { ok: true, message: `Test email sent to ${to}. Check the inbox (and spam folder).` };
    } catch (err) {
      this.logger.warn('SMTP test failed', err);
      // nodemailer errors name the SMTP problem (connection, TLS or login) without the password.
      return { ok: false, message: `Sending failed: ${(err as Error).message}` };
    }
  }
}
