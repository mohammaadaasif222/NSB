import { PASSWORD_RESET_MINUTES } from '@nsb/shared';
import { type EmailContent, render } from './enquiry-email.js';

export function passwordResetEmail(name: string, link: string): EmailContent {
  return {
    subject: 'Reset your Noida Super Bazaar admin password',
    ...render(
      'Reset your password',
      [{ text: `Hi ${name}, use the button below to choose a new password for the admin panel. The link works once, for ${PASSWORD_RESET_MINUTES} minutes.` }],
      [{ href: link, label: 'Reset password' }],
      'If you did not ask for this, ignore this email. Your password stays the same.',
    ),
  };
}
