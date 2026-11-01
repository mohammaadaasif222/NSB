import { canDo, type Enquiry } from '@nsb/shared';
import type { CurrentAdminInfo } from '../auth/auth.service.js';

/** "9876543210" → "98XXXXXX10", for roles that may not see lead numbers. */
const maskMobile = (mobile: string) => `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;

/** Phone numbers a visitor typed into a message ("call me on 98765 43210"). */
const NUMBER_IN_TEXT = /(?:\+?91[\s.-]?)?[6-9](?:[\s.-]?\d){9}/g;

/** Email addresses a visitor typed into a message. */
const EMAIL_IN_TEXT = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** View only accounts see leads without their numbers or email addresses, in the fields or the message. */
export const forRole = (admin: CurrentAdminInfo, e: Enquiry): Enquiry =>
  canDo(admin.role, 'leadContacts')
    ? e
    : {
        ...e,
        mobile: maskMobile(e.mobile),
        email: null,
        message: e.message.replace(EMAIL_IN_TEXT, '[email hidden]').replace(NUMBER_IN_TEXT, (n) => maskMobile(n.replace(/\D/g, '').slice(-10))),
      };
