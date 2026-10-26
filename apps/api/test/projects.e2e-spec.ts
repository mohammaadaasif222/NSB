import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import type {
  AdminProject,
  AdminProjectRow,
  AdminSettings,
  Enquiry,
  Paginated,
  ProjectDetail,
  ProjectDuplicate,
  ProjectEnquiryResult,
  ProjectFormInput,
  ProjectLocality,
  ProjectStats,
  ProjectSummary,
  SiteSettings,
} from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';
import type { EnquiryNotice } from '../src/modules/notifications/notifications.service.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const AD_KEY = 'realEstate.projectSideAd';

/** A complete project as the admin form sends it (numbers as typed text). */
const projectBody = (overrides: Partial<ProjectFormInput> = {}): ProjectFormInput => ({
  type: 'apartments',
  area: 'Greater Noida',
  name: `E2E ${run} Heights`,
  builder: 'E2E Builders',
  locality: `E2E Sector ${run}`,
  reraId: 'UPRERAPRJ999999',
  possessionStatus: 'Under Construction',
  possessionDate: 'Dec 2029',
  launchDate: 'Jan 2026',
  isPremium: false,
  units: '400',
  landArea: '5 Acres',
  towers: '',
  about: 'First paragraph.\n\nSecond paragraph.',
  highlights: ['Near the metro'],
  configurations: [
    { title: '2 BHK', price: '9500000', superArea: '1050', carpetArea: '780', plan2dUrl: null, plan3dUrl: null },
    { title: '4 BHK+', price: '21000000', superArea: '2400', carpetArea: '', plan2dUrl: null, plan3dUrl: null },
    { title: 'Penthouse', price: '', superArea: '', carpetArea: '', plan2dUrl: null, plan3dUrl: null },
  ],
  amenities: ['Swimming Pool', 'Gymnasium', 'swimming pool', 'Rooftop lounge'],
  specifications: { flooring: 'Living: Vitrified tiles', fittings: '', walls: '' },
  nearby: [{ name: 'Metro', type: 'Metro station', minutes: '5', km: '1.5' }],
  advertiser: { type: 'builder', name: 'ignored', firm: 'ignored', experienceYears: '3', reraId: 'x', established: '2005', projectsDelivered: '9', about: '' },
  faqs: [{ question: 'Home loan?', answer: 'Yes.' }],
  photos: ['/images/real-estate/project-1.jpg'],
  videoUrl: 'https://youtu.be/5HxYhLOrtyU',
  videoChapters: '0:00 Entrance\n2:10 Pool',
  videos: [],
  brochureUrl: 'https://example.com/brochure.pdf',
  phone: '+91 98100 12345',
  termStart: '2026-01-01',
  termMonths: 12,
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
  ...overrides,
});

describe('Real estate projects (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let cookie: string;
  let savedAd: unknown[];
  const notices: EnquiryNotice[] = [];
  let project: AdminProject;

  const http = () => request(app.getHttpServer());
  const admin = {
    get: (url: string) => http().get(url).set('Cookie', cookie),
    post: (url: string) => http().post(url).set('Cookie', cookie),
    patch: (url: string) => http().patch(url).set('Cookie', cookie),
    delete: (url: string) => http().delete(url).set('Cookie', cookie),
  };
  const lead = (body: object) => http().post('/api/enquiries/project').send({ name: `Buyer ${run}`, mobile: '9876543210', agreed: true, ...body });

  beforeAll(async () => {
    // Alerts are recorded, never emailed.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(NotificationsService)
      .useValue({ enquiryReceived: async (notice: EnquiryNotice) => void notices.push(notice) })
      .compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const res = await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD })
      .expect(200);
    cookie = (res.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
    savedAd = (await pool.query('select value from settings where key = $1', [AD_KEY])).rows.map((r: { value: unknown }) => r.value);
  });

  afterAll(async () => {
    await pool.query('delete from settings where key = $1', [AD_KEY]);
    for (const value of savedAd) await pool.query('insert into settings (key, value) values ($1, $2)', [AD_KEY, JSON.stringify(value)]);
    await pool.query('delete from enquiries where name like $1', [`%${run}%`]);
    await pool.query('delete from projects where slug like $1', [`e2e-${run}-%`]);
    await pool.end();
    await app.close();
  });

  it('keeps the admin routes private', async () => {
    await http().get('/api/admin/projects').expect(401);
    await http().post('/api/admin/projects').send(projectBody()).expect(401);
  });

  it('creates a project and derives its slug, price, bedrooms and advertiser', async () => {
    project = (await admin.post('/api/admin/projects').send(projectBody()).expect(201)).body as AdminProject;
    expect(project.slug).toBe(`e2e-${run}-heights-greater-noida`);
    expect(project.minPrice).toBe(9_500_000);
    expect(project.units).toBe(400);
    expect(project.towers).toBeNull();
    expect(project.phone).toBe('9810012345');
    expect(project.amenities).toEqual(['Swimming Pool', 'Gymnasium', 'Rooftop lounge']);
    // A builder advertises as itself, without broker fields.
    expect(project.advertiser).toMatchObject({ type: 'builder', name: 'E2E Builders', firm: '', experienceYears: null, established: 2005 });
    expect(project.advertiserName).toBe('E2E Builders');
    expect(project.keyConfigurations).toEqual([
      { title: '2 BHK', superArea: 1050 },
      { title: '4 BHK+', superArea: 2400 },
    ]);
    const { rows } = await pool.query('select bedrooms from projects where id = $1', [project.id]);
    expect(rows[0].bedrooms.sort()).toEqual([2, 4]);
  });

  it('refuses a second listing of the same project in the same area', async () => {
    const dup = (await admin.get(`/api/admin/projects/duplicate?${new URLSearchParams({ name: `e2e ${run} HEIGHTS`, area: 'Greater Noida' })}`).expect(200))
      .body.duplicate as ProjectDuplicate;
    expect(dup).toMatchObject({ id: project.id, advertiserName: 'E2E Builders' });
    const none = await admin.get(`/api/admin/projects/duplicate?${new URLSearchParams({ name: `E2E ${run} Heights`, area: 'Greater Noida', exclude: project.id })}`).expect(200);
    expect(none.body).toEqual({ duplicate: null });
    const res = await admin.post('/api/admin/projects').send(projectBody({ name: `e2e-${run} heights` })).expect(409);
    expect(res.body.issues[0].path).toBe('name');
  });

  it('checks configurations and the broker name', async () => {
    const noPrice = await admin
      .post('/api/admin/projects')
      .send(projectBody({ name: `E2E ${run} Unpriced`, configurations: [{ title: '2 BHK', price: '', superArea: '900', carpetArea: '', plan2dUrl: null, plan3dUrl: null }] }))
      .expect(400);
    expect(noPrice.body.issues.map((i: { path: string }) => i.path)).toContain('configurations');
    const broker = await admin
      .patch(`/api/admin/projects/${project.id}`)
      .send({ advertiser: { ...projectBody().advertiser, type: 'broker', name: '' } })
      .expect(400);
    expect(broker.body.issues.map((i: { path: string }) => i.path)).toContain('advertiser.name');
    await admin.post('/api/admin/projects').send(projectBody({ name: `E2E ${run} Video`, videoUrl: 'https://vimeo.com/1' })).expect(400);
  });

  it('shows only live projects on the site, without the phone or brochure link', async () => {
    await http().get(`/api/projects/${project.slug}`).expect(404);
    await admin.patch(`/api/admin/projects/${project.id}`).send({ status: 'live' }).expect(200);

    const detail = (await http().get(`/api/projects/${project.slug}`).expect(200)).body as ProjectDetail;
    expect(detail.name).toBe(`E2E ${run} Heights`);
    expect(detail.hasBrochure).toBe(true);
    expect(detail).not.toHaveProperty('phone');
    expect(detail).not.toHaveProperty('brochureUrl');
    expect(detail.similar.every((s) => s.area === 'Greater Noida' && s.id !== project.id)).toBe(true);

    const mine = (qs: string) =>
      http()
        .get(`/api/projects?area=Greater%20Noida&q=${encodeURIComponent(`E2E Sector ${run}`)}&${qs}`)
        .expect(200)
        .then((r) => (r.body as Paginated<ProjectSummary>).items.map((p) => p.id));
    expect(await mine('')).toEqual([project.id]);
    expect(await mine('bhk=2')).toEqual([project.id]);
    expect(await mine('bhk=4')).toEqual([project.id]);
    expect(await mine('bhk=3')).toEqual([]);
    expect(await mine('possession=Ready%20to%20Move')).toEqual([]);
    expect(await mine('sort=lo')).toEqual([project.id]);

    const localities = (await http().get('/api/projects/localities?area=Greater%20Noida').expect(200)).body as ProjectLocality[];
    expect(Array.isArray(localities)).toBe(true);
  });

  it('saves a View Number lead under Real Estate and returns the number', async () => {
    const res = (await lead({ projectId: project.id, source: 'Brochure', buyWithin: '3 months', homeLoan: true }).expect(201)).body as ProjectEnquiryResult;
    expect(res).toMatchObject({ advertiserName: 'E2E Builders', phone: '9810012345', brochureUrl: 'https://example.com/brochure.pdf' });

    const items = ((await admin.get(`/api/admin/enquiries?projectId=${project.id}`).expect(200)).body as Paginated<Enquiry>).items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ listingName: `E2E ${run} Heights`, categoryName: 'Real Estate', source: 'Brochure', preferredDate: null, listingId: null });
    expect(items[0].message).toContain('Planning to buy in: 3 months');
    expect(items[0].message).toContain('Interested in a home loan: Yes');

    const notice = notices.find((n) => n.enquiry.id === res.id);
    expect(notice?.listing).toMatchObject({ path: `/real-estate/${project.slug}`, vendorPhone: '9810012345', notifyVendor: false });

    const rows = ((await admin.get(`/api/admin/projects?q=${encodeURIComponent(`E2E ${run}`)}`).expect(200)).body as Paginated<AdminProjectRow>).items;
    expect(rows.find((r) => r.id === project.id)?.leadCount).toBe(1);
    const stats = (await admin.get('/api/admin/projects/stats').expect(200)).body as ProjectStats;
    expect(stats.leads).toBeGreaterThanOrEqual(1);
    expect(stats.total).toBeGreaterThanOrEqual(stats.live);
  });

  it('takes a general callback and checks the form', async () => {
    const res = (await lead({ source: 'Callback' }).expect(201)).body as ProjectEnquiryResult;
    expect(res).toMatchObject({ phone: null, advertiserName: null });
    // The enquiry form on the project page adds the visitor's message to the lead.
    const asked = (await lead({ projectId: project.id, source: 'Enquiry', message: 'Is a 3 BHK on a high floor left?' }).expect(201)).body as ProjectEnquiryResult;
    const { rows } = await pool.query('select source, message from enquiries where id = $1', [asked.id]);
    expect(rows[0].source).toBe('Enquiry');
    expect(rows[0].message).toContain('Message: Is a 3 BHK on a high floor left?');
    const bad = await lead({ projectId: project.id, agreed: false, mobile: '12345' }).expect(400);
    expect(bad.body.issues.map((i: { path: string }) => i.path)).toEqual(expect.arrayContaining(['agreed', 'mobile']));
    await admin.patch(`/api/admin/projects/${project.id}`).send({ status: 'draft' }).expect(200);
    await lead({ projectId: project.id }).expect(404);
  });

  it('keeps the leads when a project is deleted', async () => {
    await admin.delete(`/api/admin/projects/${project.id}`).expect(204);
    await admin.get(`/api/admin/projects/${project.id}`).expect(404);
    const { rows } = await pool.query('select project_id, listing_name from enquiries where name = $1 and source = $2', [`Buyer ${run}`, 'Brochure']);
    expect(rows).toEqual([{ project_id: null, listing_name: `E2E ${run} Heights` }]);
  });

  it('shows the project page sidebar ad only while it is switched on', async () => {
    const ad = { enabled: true, title: `E2E ${run} school`, text: 'Admissions open', buttonLabel: 'Know more', link: '/schools', imageUrl: null };
    const saved = (await admin.patch('/api/admin/settings').send({ projectSideAd: ad }).expect(200)).body as AdminSettings;
    expect(saved.projectSideAd).toEqual(ad);
    expect(((await http().get('/api/site-settings').expect(200)).body as SiteSettings).projectSideAd).toEqual(ad);
    await admin.patch('/api/admin/settings').send({ projectSideAd: { ...ad, enabled: false } }).expect(200);
    expect(((await http().get('/api/site-settings').expect(200)).body as SiteSettings).projectSideAd).toBeNull();
    await admin.patch('/api/admin/settings').send({ projectSideAd: { ...ad, link: 'javascript:alert(1)' } }).expect(400);
  });
});
