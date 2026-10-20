import type { ConfigService } from '@nestjs/config';
import type { Enquiry } from '@nsb/shared';
import type { Env } from '../../config/env.js';
import type { SettingsService, SmtpConfig } from '../settings/settings.service.js';
import { adminEnquiryEmail, type EnquiryListing, vendorEnquiryEmail } from './enquiry-email.js';
import type { MailService } from './mail.service.js';
import { NotificationsService } from './notifications.service.js';

const enquiry: Enquiry = {
  id: '7f9c2c1e-3b4a-4c5d-9e8f-0a1b2c3d4e5f',
  name: 'Asha <script>\r\nBcc: x@evil.test',
  mobile: '9876543210',
  message: 'Need a quote for 300 guests & <b>decor</b>',
  preferredDate: '2027-02-14',
  budget: null,
  eventType: 'Reception',
  email: 'asha@example.com',
  listingId: null,
  listingName: 'Royal Banquet',
  categoryId: null,
  categoryName: 'Wedding Venues',
  createdAt: '2026-10-09T10:00:00.000Z',
  readAt: null,
};

const listing: EnquiryListing = {
  id: '0b6f3c2a-1d4e-4f5a-8b9c-7d6e5f4a3b2c',
  slug: 'royal-banquet',
  area: 'Sector 18, Noida',
  quickInfo: [
    { label: 'Veg', value: '₹1,200 per plate' },
    { label: 'Capacity', value: '100–800 guests' },
  ],
  services: ['Banquet hall', 'Lawn', 'In-house decor', 'DJ', 'Valet', 'Rooms', 'Catering', 'Bar', 'Generator', 'Parking'],
  vendorEmail: 'vendor@example.com',
  vendorPhone: '9811111111',
  notifyVendor: true,
  categorySlug: 'wedding-venues',
  parent: { name: 'Wedding', slug: 'wedding' },
};

const smtp: SmtpConfig = {
  enabled: true,
  host: 'smtp.example.com',
  port: 465,
  security: 'tls',
  username: 'alerts@example.com',
  password: 'pw',
  fromEmail: 'alerts@example.com',
  fromName: 'NSB',
  adminRecipients: ['team@example.com', 'owner@example.com'],
  notifyVendor: true,
};

describe('enquiry emails', () => {
  it('escapes visitor input and keeps the subject on one line', () => {
    const email = adminEnquiryEmail(enquiry, listing, 'https://nsb.example.com');
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.subject).toBe('New enquiry: Royal Banquet - Wedding Venues (Asha <script> Bcc: x@evil.test)');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;b&gt;decor&lt;/b&gt;');
    expect(email.html).toContain('href="https://nsb.example.com/admin/enquiries?status=unread"');
    expect(email.text).toContain('Mobile: +91 9876543210');
    expect(email.text).toContain('Budget: Not given');
    expect(email.text).toContain('Preferred date: 14 Feb 2027');
    expect(email.text).toContain('Event: Reception');
    expect(email.text).toContain('Email: asha@example.com');
  });

  it('tells the NSB team which listing the lead is for, with the vendor contact and reply links', () => {
    const { text, html } = adminEnquiryEmail(enquiry, listing, 'https://nsb.example.com');
    expect(text).toContain('Category: Wedding › Wedding Venues');
    expect(text).toContain('Area: Sector 18, Noida');
    expect(text).toContain('Veg: ₹1,200 per plate');
    expect(text).toContain('Services: Banquet hall, Lawn, In-house decor, DJ, Valet, Rooms, Catering, Bar +2 more');
    expect(text).toContain('Phone: 9811111111');
    expect(html).toContain('href="tel:+919876543210"');
    expect(html).toContain('href="https://wa.me/919876543210?text=');
    expect(html).toContain('href="https://nsb.example.com/wedding/wedding-venues/royal-banquet"');
  });

  it('still sends the admin email without the site address or listing details', () => {
    const { text, html } = adminEnquiryEmail(enquiry, null);
    expect(text).toContain('Category: Wedding Venues');
    expect(html).not.toContain('/admin/enquiries');
    expect(text).not.toContain('Vendor contact');
  });

  it('gives the vendor the lead and a WhatsApp link, without admin links', () => {
    const email = vendorEnquiryEmail(enquiry);
    expect(email.text).toContain('+91 9876543210');
    expect(email.text).not.toContain('/admin');
    expect(email.html).toContain('href="https://wa.me/919876543210?text=');
  });
});

describe('NotificationsService', () => {
  const setup = (config: SmtpConfig | null, fail: string[] = []) => {
    const sent: { to: string[]; subject: string }[] = [];
    const mail = {
      send: (_: SmtpConfig, to: string[], content: { subject: string }) => {
        if (to.some((t) => fail.includes(t))) return Promise.reject(new Error('550 mailbox unavailable'));
        sent.push({ to, subject: content.subject });
        return Promise.resolve();
      },
    } as unknown as MailService;
    const settings = { smtpConfig: () => Promise.resolve(config) } as unknown as SettingsService;
    const env = { get: () => undefined } as unknown as ConfigService<Env, true>;
    return { service: new NotificationsService(settings, mail, env), sent };
  };

  it('emails the NSB recipients and the vendor', async () => {
    const { service, sent } = setup(smtp);
    await service.enquiryReceived({ enquiry, listing });
    expect(sent.map((s) => s.to)).toEqual([['team@example.com', 'owner@example.com'], ['vendor@example.com']]);
  });

  it('skips the vendor whose listing has leads switched off, or who has no email', async () => {
    for (const vendor of [{ notifyVendor: false }, { vendorEmail: null }]) {
      const { service, sent } = setup(smtp);
      await service.enquiryReceived({ enquiry, listing: { ...listing, ...vendor } });
      expect(sent.map((s) => s.to)).toEqual([['team@example.com', 'owner@example.com']]);
    }
    const { text } = adminEnquiryEmail(enquiry, { ...listing, notifyVendor: false }, 'https://nsb.example.com');
    expect(text).toContain('Leads to vendor: Not sent (NSB only)');
  });

  it('skips the vendor when that option is off, and everything when alerts are off', async () => {
    const vendorOff = setup({ ...smtp, notifyVendor: false });
    await vendorOff.service.enquiryReceived({ enquiry, listing });
    expect(vendorOff.sent).toHaveLength(1);

    for (const config of [{ ...smtp, enabled: false }, null]) {
      const off = setup(config);
      await off.service.enquiryReceived({ enquiry, listing });
      expect(off.sent).toHaveLength(0);
    }
  });

  it('still sends the other email when one fails, then reports the failure', async () => {
    const { service, sent } = setup(smtp, ['vendor@example.com']);
    await expect(service.enquiryReceived({ enquiry, listing })).rejects.toThrow(/vendor: 550/);
    expect(sent).toHaveLength(1);
  });

  it('reports test email results', async () => {
    expect(await setup(null).service.sendTest('a@b.co')).toMatchObject({ ok: false, message: 'Save the SMTP settings first.' });
    expect(await setup(smtp).service.sendTest('a@b.co')).toMatchObject({ ok: true });
    expect(await setup(smtp, ['a@b.co']).service.sendTest('a@b.co')).toMatchObject({ ok: false, message: /550/ });
  });
});
