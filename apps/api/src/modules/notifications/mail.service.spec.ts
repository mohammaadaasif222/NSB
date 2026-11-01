import { describe, expect, it } from 'vitest';
import type { Transporter } from 'nodemailer';
import type { SmtpConfig } from '../settings/settings.service.js';
import { MailService } from './mail.service.js';

class FakeMail extends MailService {
  active = 0;
  most = 0;

  protected override createTransport() {
    return {
      sendMail: async () => {
        this.most = Math.max(this.most, ++this.active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        this.active--;
      },
      close: () => undefined,
    } as unknown as Transporter;
  }
}

describe('MailService', () => {
  it('sends at most three emails at once and still sends them all', async () => {
    const mail = new FakeMail();
    const content = { subject: 'Hi', text: 'Hi', html: '<p>Hi</p>' };
    await Promise.all(Array.from({ length: 10 }, () => mail.send({} as SmtpConfig, ['a@example.com'], content)));
    expect(mail.most).toBe(3);
    expect(mail.active).toBe(0);
  });
});
