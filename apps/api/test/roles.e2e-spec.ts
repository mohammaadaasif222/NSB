import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import type { AdminRole, AdminSettings, AdminUser, AdminUserRow, Enquiry, LeadSectionCounts, Paginated, ProjectEnquiryResult, ProjectSummary } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const PASSWORD = `e2e-${run}-password`;
const email = (role: string) => `e2e-${run}-${role}@example.com`;

describe('Admin roles, users, profile and lead follow-up (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let superCookie: string;
  let savedPricing: unknown[];
  const cookies: Partial<Record<AdminRole, string>> = {};
  const users: Partial<Record<AdminRole, AdminUserRow>> = {};
  let leadId: string;

  const http = () => request(app.getHttpServer());
  const as = (cookie: string) => ({
    get: (url: string) => http().get(url).set('Cookie', cookie),
    post: (url: string) => http().post(url).set('Cookie', cookie),
    patch: (url: string) => http().patch(url).set('Cookie', cookie),
    delete: (url: string) => http().delete(url).set('Cookie', cookie),
  });
  const login = async (address: string, password: string) =>
    ((await http().post('/api/auth/login').send({ email: address, password }).expect(200)).headers['set-cookie'] as unknown as string[])[0].split(';')[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(NotificationsService)
      .useValue({ enquiryReceived: async () => {} })
      .compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    savedPricing = (await pool.query(`select value from settings where key = 'site.pricing'`)).rows.map((r: { value: unknown }) => r.value);
    superCookie = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);

    // One live project lead to follow up.
    const projects = (await http().get('/api/projects?pageSize=1').expect(200)).body as Paginated<ProjectSummary>;
    const lead = (await http()
      .post('/api/enquiries/project')
      .send({ projectId: projects.items[0]?.id, name: `Lead ${run}`, mobile: '9876512345', agreed: true })
      .expect(201)).body as ProjectEnquiryResult;
    leadId = lead.id;
  });

  afterAll(async () => {
    await pool.query(`delete from settings where key = 'site.pricing'`);
    for (const value of savedPricing) await pool.query(`insert into settings (key, value) values ('site.pricing', $1)`, [JSON.stringify(value)]);
    await pool.query('delete from enquiries where name like $1', [`%${run}%`]);
    await pool.query('delete from admin_users where email like $1', [`e2e-${run}-%`]);
    await pool.end();
    await app.close();
  });

  it('lets a Super Admin add users, but not twice or without a valid password', async () => {
    const me = (await as(superCookie).get('/api/auth/me').expect(200)).body as AdminUser;
    expect(me.role).toBe('super');
    for (const role of ['admin', 'analyst', 'view'] as const) {
      users[role] = (await as(superCookie).post('/api/admin/users').send({ name: `E2E ${role}`, email: email(role), role, password: PASSWORD }).expect(201))
        .body as AdminUserRow;
    }
    const dup = await as(superCookie).post('/api/admin/users').send({ name: 'Again', email: email('admin'), role: 'view', password: PASSWORD }).expect(409);
    expect(dup.body.issues[0].path).toBe('email');
    await as(superCookie).post('/api/admin/users').send({ name: 'Short', email: email('short'), role: 'view', password: 'x' }).expect(400);
    const list = (await as(superCookie).get('/api/admin/users').expect(200)).body as AdminUserRow[];
    expect(list.filter((u) => u.email.startsWith(`e2e-${run}`)).map((u) => u.role).sort()).toEqual(['admin', 'analyst', 'view']);
    for (const role of ['admin', 'analyst', 'view'] as const) cookies[role] = await login(email(role), PASSWORD);
  });

  it('keeps View only to reading, without lead numbers', async () => {
    const view = as(cookies.view!);
    expect(((await view.get('/api/auth/me').expect(200)).body as AdminUser).role).toBe('view');
    await view.get('/api/admin/listings').expect(200);
    await view.get('/api/admin/dashboard').expect(200);
    await view.post('/api/admin/projects').send({}).expect(403);
    await view.get('/api/admin/settings').expect(403);
    await view.get('/api/admin/users').expect(403);
    await view.get('/api/admin/enquiries/export').expect(403);
    const leads = ((await view.get(`/api/admin/enquiries?q=${run}`).expect(200)).body as Paginated<Enquiry>).items;
    expect(leads[0]?.mobile).toBe('98XXXXXX45');
    // Searching by digits would reveal the number one digit at a time, so it does not match for this role.
    expect(((await view.get('/api/admin/enquiries?q=9876512345').expect(200)).body as Paginated<Enquiry>).items).toEqual([]);
    // Opening a lead marks it read; following it up is for editors.
    await view.patch(`/api/admin/enquiries/${leadId}`).send({ read: true }).expect(200);
    await view.patch(`/api/admin/enquiries/${leadId}`).send({ leadStatus: 'won' }).expect(403);
  });

  it('lets an Analyst see and export lead numbers, but not edit', async () => {
    const analyst = as(cookies.analyst!);
    const leads = ((await analyst.get(`/api/admin/enquiries?q=${run}`).expect(200)).body as Paginated<Enquiry>).items;
    expect(leads[0]?.mobile).toBe('9876512345');
    await analyst.get(`/api/admin/enquiries/export?q=${run}`).expect(200);
    await analyst.patch(`/api/admin/enquiries/${leadId}`).send({ leadStatus: 'contacted' }).expect(403);
    await analyst.delete('/api/admin/listings/00000000-0000-4000-8000-000000000000').expect(403);
  });

  it('lets an Admin edit and follow up leads, but not manage pricing or users', async () => {
    const admin = as(cookies.admin!);
    const updated = (await admin.patch(`/api/admin/enquiries/${leadId}`).send({ leadStatus: 'contacted' }).expect(200)).body as Enquiry;
    expect(updated.leadStatus).toBe('contacted');
    expect(updated.projectType).not.toBeNull();
    const contacted = ((await admin.get(`/api/admin/enquiries?section=real-estate&leadStatus=contacted&q=${run}`).expect(200)).body as Paginated<Enquiry>).items;
    expect(contacted.map((e) => e.id)).toEqual([leadId]);
    expect(((await admin.get(`/api/admin/enquiries?section=wedding&q=${run}`).expect(200)).body as Paginated<Enquiry>).items).toEqual([]);
    const sections = (await admin.get('/api/admin/enquiries/sections').expect(200)).body as LeadSectionCounts;
    expect(sections.realEstate.new).toBeGreaterThanOrEqual(0);
    await admin.get('/api/admin/settings').expect(200);
    await admin.patch('/api/admin/settings').send({ pricing: { categories: {}, realEstate: 1 } }).expect(403);
    await admin.get('/api/admin/users').expect(403);
    await admin.post('/api/admin/notifications/test-email').send({}).expect(403);
  });

  it('saves slot pricing (Super Admin)', async () => {
    const pricing = { categories: { 'wedding-venues': 30000 }, realEstate: 30000 };
    const saved = (await as(superCookie).patch('/api/admin/settings').send({ pricing }).expect(200)).body as AdminSettings;
    expect(saved.pricing).toEqual(pricing);
    expect((await as(superCookie).get('/api/admin/dashboard').expect(200)).body.realEstatePlanPrice).toBe(30000);
  });

  it('lets each admin edit their own profile, and guards roles', async () => {
    const view = as(cookies.view!);
    const renamed = (await view.patch('/api/auth/profile').send({ name: 'Renamed', email: email('view') }).expect(200)).body as AdminUser;
    expect(renamed.name).toBe('Renamed');
    await view.patch('/api/auth/profile').send({ name: 'Taken', email: email('admin') }).expect(409);

    const me = (await as(superCookie).get('/api/auth/me').expect(200)).body as AdminUser;
    await as(superCookie).patch(`/api/admin/users/${me.id}`).send({ role: 'view' }).expect(400);
    await as(superCookie).delete(`/api/admin/users/${me.id}`).expect(400);

    // A role change applies on the next request, without signing in again.
    await as(superCookie).patch(`/api/admin/users/${users.view!.id}`).send({ role: 'admin' }).expect(200);
    await view.get('/api/admin/settings').expect(200);

    // A removed user is signed out at once.
    await as(superCookie).delete(`/api/admin/users/${users.view!.id}`).expect(204);
    await view.get('/api/auth/me').expect(401);
  });
});
