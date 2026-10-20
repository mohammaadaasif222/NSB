import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import type { AdminSettings, CategoryDetail, Enquiry, Paginated, UnreadCount } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';
import { startFakeSmtp } from './helpers/fake-smtp.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const yesterday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(Date.now() - 86_400_000));

describe('Enquiries and email alerts (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let cookie: string;
  let smtp: Awaited<ReturnType<typeof startFakeSmtp>>;
  let savedEmail: unknown[];
  let unreadBefore: string[];
  let wedding: CategoryDetail;
  let listingId: string;
  const created: Enquiry[] = [];

  const http = () => request(app.getHttpServer());
  const admin = {
    get: (url: string) => http().get(url).set('Cookie', cookie),
    post: (url: string) => http().post(url).set('Cookie', cookie),
    patch: (url: string) => http().patch(url).set('Cookie', cookie),
  };
  const list = async (qs: string) => ((await admin.get(`/api/admin/enquiries?${qs}`).expect(200)).body as Paginated<Enquiry>).items;
  const mine = (items: Enquiry[]) => items.filter((e) => e.name.includes(run)).map((e) => e.name);
  const smtpSettings = (overrides: object = {}) => ({
    email: {
      enabled: true,
      host: '127.0.0.1',
      port: smtp.port,
      security: 'none',
      fromEmail: 'alerts@nsb.test',
      fromName: 'NSB Alerts',
      adminRecipients: ['team@nsb.test'],
      notifyVendor: true,
      ...overrides,
    },
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    smtp = await startFakeSmtp();

    const res = await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD })
      .expect(200);
    cookie = (res.headers['set-cookie'] as unknown as string[])[0].split(';')[0];

    // The dev database may hold real SMTP settings and unread leads; put them back afterwards.
    savedEmail = (await pool.query(`select value from settings where key = 'email.smtp'`)).rows.map((r) => r.value);
    unreadBefore = (await pool.query('select id from enquiries where read_at is null')).rows.map((r) => r.id);

    wedding = (await http().get('/api/categories/wedding').expect(200)).body as CategoryDetail;
    const listing = await admin
      .post('/api/admin/listings')
      .send({
        categoryId: wedding.children[0].id,
        name: `E2E ${run} Hall`,
        slug: `e2e-${run}-hall`,
        area: 'Sector 50',
        shortDescription: 'Test',
        email: 'vendor@nsb.test',
      })
      .expect(201);
    listingId = listing.body.id;
  });

  afterAll(async () => {
    await pool.query(`delete from settings where key = 'email.smtp'`);
    for (const value of savedEmail) {
      await pool.query(`insert into settings (key, value) values ('email.smtp', $1)`, [JSON.stringify(value)]);
    }
    if (unreadBefore.length) await pool.query('update enquiries set read_at = null where id = any($1)', [unreadBefore]);
    await pool.query(`delete from enquiries where name like $1`, [`%${run}%`]);
    await pool.query(`delete from listings where slug = $1`, [`e2e-${run}-hall`]);
    await smtp.close();
    await pool.end();
    await app.close();
  });

  it('saves SMTP settings without ever returning the password', async () => {
    await admin.patch('/api/admin/settings').send(smtpSettings({ username: 'alerts@nsb.test' })).expect(400); // login needs a password
    await admin.patch('/api/admin/settings').send(smtpSettings({ adminRecipients: [] })).expect(400);

    const res = await admin.patch('/api/admin/settings').send(smtpSettings({ username: 'alerts@nsb.test', password: 'smtp-pass-e2e' })).expect(200);
    expect((res.body as AdminSettings).email).toMatchObject({ active: true, host: '127.0.0.1', username: 'alerts@nsb.test', hasPassword: true });
    expect(JSON.stringify(res.body)).not.toContain('smtp-pass-e2e');
    const { rows } = await pool.query(`select value from settings where key = 'email.smtp'`);
    expect(JSON.stringify(rows[0].value)).not.toContain('smtp-pass-e2e');

    // The fake server needs no login.
    await admin.patch('/api/admin/settings').send(smtpSettings()).expect(200);
  });

  it('sends a test email to the signed-in admin', async () => {
    const res = await admin.post('/api/admin/notifications/test-email').send({}).expect(200);
    expect(res.body).toMatchObject({ ok: true });
    const [mail] = await smtp.waitFor(1);
    expect(mail.to).toEqual([process.env.SEED_ADMIN_EMAIL]);
    expect(mail.data).toContain('Subject: Test email from Noida Super Bazaar');
    smtp.mails.length = 0;
    await http().post('/api/admin/notifications/test-email').send({}).expect(401);
  });

  it('emails the team and the vendor when an enquiry arrives', async () => {
    const res = await http()
      .post('/api/enquiries')
      .send({ listingId, name: `Asha ${run}`, mobile: '9876543210', message: 'Need <b>300</b> covers', preferredDate: '2027-02-14', eventType: 'Reception' })
      .expect(201);
    const mails = await smtp.waitFor(2);
    const team = mails.find((m) => m.to.includes('team@nsb.test'))!;
    const vendor = mails.find((m) => m.to.includes('vendor@nsb.test'))!;
    expect(team.data).toContain('Event: Reception');
    expect(vendor.data).toContain('Event: Reception');
    const [saved] = (await pool.query('select event_type from enquiries where id = $1', [res.body.id])).rows;
    expect(saved.event_type).toBe('Reception');
    expect(team.data).toContain(`Subject: New enquiry: E2E ${run} Hall - ${wedding.children[0].name} (Asha ${run})`);
    expect(team.data).toContain('Area: Sector 50');
    expect(team.data).toContain('Email: vendor@nsb.test');
    expect(team.data).toContain('From: NSB Alerts <alerts@nsb.test>');
    expect(team.data).toContain('&lt;b&gt;300&lt;/b&gt;');
    expect(vendor.data).toContain('+91 9876543210');
    created.push({ id: res.body.id } as Enquiry);
  });

  it('does not email when alerts are switched off, but still saves the lead', async () => {
    smtp.mails.length = 0;
    await admin.patch('/api/admin/settings').send(smtpSettings({ enabled: false })).expect(200);
    await http()
      .post('/api/enquiries')
      .send({ listingId, name: `Ravi ${run}`, mobile: '9123456780', message: 'Hello', preferredDate: '2027-03-01' })
      .expect(201);
    await new Promise((r) => setTimeout(r, 500));
    expect(smtp.mails).toHaveLength(0);
    expect(mine(await list(`q=${run}`))).toEqual([`Ravi ${run}`, `Asha ${run}`]);
  });

  it('filters by search, category, status and received date', async () => {
    expect(mine(await list(`q=asha ${run}`))).toEqual([`Asha ${run}`]);
    expect(mine(await list(`q=9123456780`))).toEqual([`Ravi ${run}`]);
    expect(mine(await list(`q=${run}&categoryId=${wedding.id}`))).toHaveLength(2); // parent includes sub-categories
    expect(mine(await list(`q=${run}&from=${today}&to=${today}`))).toHaveLength(2);
    expect(mine(await list(`q=${run}&to=${yesterday}`))).toHaveLength(0);
    expect(mine(await list(`q=${run}&status=read`))).toHaveLength(0);
    expect(await list('q=100%25 sure')).toEqual([]); // LIKE wildcards are literal
    await admin.get('/api/admin/enquiries?status=archived').expect(400);
    // Blank values from the filter form are ignored.
    expect(mine(await list(`q=${run}&status=&from=&categoryId=`))).toHaveLength(2);
  });

  it('tracks read state and the unread count', async () => {
    const count = async () => ((await admin.get('/api/admin/enquiries/unread-count').expect(200)).body as UnreadCount).unread;
    const before = await count();
    const [asha] = await list(`q=asha ${run}`);
    expect(asha.readAt).toBeNull();

    const read = await admin.patch(`/api/admin/enquiries/${asha.id}`).send({ read: true }).expect(200);
    expect(read.body.readAt).toEqual(expect.any(String));
    expect(await count()).toBe(before - 1);
    expect(mine(await list(`q=${run}&status=read`))).toEqual([`Asha ${run}`]);

    await admin.patch(`/api/admin/enquiries/${asha.id}`).send({ read: false }).expect(200);
    expect(await count()).toBe(before);
    await admin.post('/api/admin/enquiries/read-all').expect(201);
    expect(await count()).toBe(0);
    await admin.patch(`/api/admin/enquiries/${crypto.randomUUID()}`).send({ read: true }).expect(404);
    await http().get('/api/admin/enquiries/unread-count').expect(401);
  });

  it("saves the lead's email and keeps leads from a vendor whose switch is off", async () => {
    await admin.patch('/api/admin/settings').send(smtpSettings()).expect(200);
    await admin.patch(`/api/admin/listings/${listingId}`).send({ notifyVendor: false }).expect(200);
    smtp.mails.length = 0;
    await http()
      .post('/api/enquiries')
      .send({ listingId, name: 'X', mobile: '9876543210', message: 'Hi', preferredDate: '2027-02-14', email: 'not-an-email' })
      .expect(400);
    const res = await http()
      .post('/api/enquiries')
      .send({ listingId, name: `Meera ${run}`, mobile: '9988776655', message: 'Hi', preferredDate: '2027-04-01', email: 'Meera@Example.com' })
      .expect(201);
    created.push({ id: res.body.id } as Enquiry);

    const [team] = await smtp.waitFor(1);
    await new Promise((r) => setTimeout(r, 500));
    expect(smtp.mails).toHaveLength(1); // NSB only
    expect(team.to).toContain('team@nsb.test');
    expect(team.data).toContain('Leads to vendor: Not sent (NSB only)');
    const [meera] = await list(`q=meera@example.com`);
    expect(meera.email).toBe('meera@example.com');
    await admin.patch(`/api/admin/listings/${listingId}`).send({ notifyVendor: true }).expect(200);
  });

  it('exports the filtered leads as CSV with Name, Mobile and Email in separate columns', async () => {
    const res = await admin.get(`/api/admin/enquiries/export?q=${run}`).expect(200);
    expect(res.headers['content-type']).toMatch(/^text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="nsb-enquiries-\d{4}-\d{2}-\d{2}\.csv"/);
    const lines = (res.text as string).replace(/^﻿/, '').trim().split('\r\n');
    expect(lines[0]).toBe('"Received","Name","Mobile","Email","Event","Preferred date","Budget","Message","Listing","Category","Status"');
    expect(lines.slice(1)).toHaveLength(3); // Asha, Ravi and Meera from this run
    expect(lines.find((l) => l.includes(`Meera ${run}`))).toContain(`"Meera ${run}","9988776655","meera@example.com"`);
    await http().get('/api/admin/enquiries/export').expect(401);
  });
});
