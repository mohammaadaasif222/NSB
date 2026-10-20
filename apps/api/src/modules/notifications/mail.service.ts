import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import type { SmtpConfig } from '../settings/settings.service.js';
import type { EmailContent } from './enquiry-email.js';

/** Sends one email over the SMTP server saved in Admin > Settings. */
@Injectable()
export class MailService {
  async send(config: SmtpConfig, to: string[], content: EmailContent): Promise<void> {
    const transport = this.createTransport(config);
    try {
      await transport.sendMail({ from: { name: config.fromName, address: config.fromEmail }, to, ...content });
    } finally {
      transport.close();
    }
  }

  /** A fresh connection per send: settings may change at any time, and alerts are infrequent. */
  protected createTransport(config: SmtpConfig): Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.security === 'tls',
      requireTLS: config.security === 'starttls',
      ignoreTLS: config.security === 'none',
      auth: config.username ? { user: config.username, pass: config.password } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      // Messages are built from plain strings only; never let content pull in files or URLs.
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
}
