import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import { type AdminSettings, DEFAULT_FOOTER, type FooterSettings, type SiteSettings } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const KEY = 'home.footer';

describe('Site footer (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let cookie: string;
  let saved: unknown[];
  const http = () => request(app.getHttpServer());
  const send = (footer: unknown) => http().patch('/api/admin/settings').set('Cookie', cookie).send({ footer });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    saved = (await pool.query('select value from settings where key = $1', [KEY])).rows.map((r: { value: unknown }) => r.value);
    await pool.query('delete from settings where key = $1', [KEY]);
    const login = await http().post('/api/auth/login').send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD }).expect(200);
    cookie = (login.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
  });

  afterAll(async () => {
    await pool.query('delete from settings where key = $1', [KEY]);
    for (const value of saved) await pool.query('insert into settings (key, value) values ($1, $2)', [KEY, JSON.stringify(value)]);
    await pool.end();
    await app.close();
  });

  it('shows the design’s footer until an admin saves their own', async () => {
    expect(((await http().get('/api/site-settings').expect(200)).body as SiteSettings).footer).toEqual(DEFAULT_FOOTER);
  });

  it('saves the links, phone and social pages, and the site shows them', async () => {
    const footer: FooterSettings = {
      ...DEFAULT_FOOTER,
      phone: '+91 98100 12345',
      showBadge: false,
      quickLinks: [
        { label: 'Real estate', link: '/real-estate', visible: true },
        { label: 'Contact us', link: 'mailto:hello@example.com', visible: false },
      ],
      bottomLinks: [{ label: 'Terms', link: 'https://example.com/terms', visible: true }],
      socials: { ...DEFAULT_FOOTER.socials, x: { url: '', visible: true }, youtube: { url: 'https://www.youtube.com/@nsb', visible: false } },
    };
    expect(((await send(footer).expect(200)).body as AdminSettings).footer).toEqual(footer);
    expect(((await http().get('/api/site-settings').expect(200)).body as SiteSettings).footer).toEqual(footer);
  });

  it('reads a footer saved before the show/hide switches as all shown', async () => {
    const old = {
      logoUrl: null,
      about: 'Old text',
      phone: '',
      quickLinks: [{ label: 'About us', link: '/about' }],
      bottomLinks: [],
      socials: { facebook: 'https://www.facebook.com/nsb', instagram: '', linkedin: '', x: '', youtube: '' },
    };
    await pool.query('update settings set value = $2 where key = $1', [KEY, JSON.stringify(old)]);
    const { footer } = (await http().get('/api/site-settings').expect(200)).body as SiteSettings;
    expect(footer).toMatchObject({ about: 'Old text', showLogo: true, showAbout: true, showPhone: true, showBadge: true });
    expect(footer.quickLinks).toEqual([{ label: 'About us', link: '/about', visible: true }]);
    expect(footer.socials.facebook).toEqual({ url: 'https://www.facebook.com/nsb', visible: true });
  });

  it('refuses unsafe or malformed values', async () => {
    const bad = await send({
      ...DEFAULT_FOOTER,
      quickLinks: [{ label: 'X', link: 'javascript:alert(1)', visible: true }],
      socials: { ...DEFAULT_FOOTER.socials, facebook: { url: 'facebook.com/nsb', visible: true } },
    }).expect(400);
    expect(bad.body.issues.map((i: { path: string }) => i.path)).toEqual(expect.arrayContaining(['footer.quickLinks.0.link', 'footer.socials.facebook.url']));
    await send({ ...DEFAULT_FOOTER, phone: 'call us' }).expect(400);
    await send({ ...DEFAULT_FOOTER, quickLinks: Array.from({ length: 11 }, () => ({ label: 'A', link: '' })) }).expect(400);
  });
});
