import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import { type AdminSettings, DEFAULT_HOME_CARDS, type HomeCard, type SiteSettings } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const KEY = 'home.cards';

describe('Home page cards (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let superCookie: string;
  let saved: unknown[];
  const http = () => request(app.getHttpServer());
  const login = async (email: string, password: string) =>
    ((await http().post('/api/auth/login').send({ email, password }).expect(200)).headers['set-cookie'] as unknown as string[])[0].split(';')[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    saved = (await pool.query('select value from settings where key = $1', [KEY])).rows.map((r: { value: unknown }) => r.value);
    await pool.query('delete from settings where key = $1', [KEY]);
    superCookie = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
  });

  afterAll(async () => {
    await pool.query('delete from settings where key = $1', [KEY]);
    for (const value of saved) await pool.query('insert into settings (key, value) values ($1, $2)', [KEY, JSON.stringify(value)]);
    await pool.query('delete from admin_users where email like $1', [`e2e-${run}-%`]);
    await pool.end();
    await app.close();
  });

  it('shows the design’s four cards until an admin saves their own', async () => {
    expect(((await http().get('/api/site-settings').expect(200)).body as SiteSettings).homeCards).toEqual(DEFAULT_HOME_CARDS);
  });

  it('lets an Admin reorder the cards and tag them; the site shows them in that order', async () => {
    await http()
      .post('/api/admin/users')
      .set('Cookie', superCookie)
      .send({ name: 'E2E editor', email: `e2e-${run}-editor@example.com`, role: 'admin', password: `e2e-${run}-password` })
      .expect(201);
    const editor = await login(`e2e-${run}-editor@example.com`, `e2e-${run}-password`);

    const cards: HomeCard[] = [
      { ...DEFAULT_HOME_CARDS[3]!, tags: [{ label: 'New', tone: 'red' }, { label: 'Top', tone: 'gold' }] },
      { ...DEFAULT_HOME_CARDS[0]!, title: 'Interior design', link: '/interior', icon: 'interior', color: 'g6', imageUrl: null },
      DEFAULT_HOME_CARDS[1]!,
      DEFAULT_HOME_CARDS[2]!,
    ];
    const res = (await http().patch('/api/admin/settings').set('Cookie', editor).send({ homeCards: cards }).expect(200)).body as AdminSettings;
    expect(res.homeCards).toEqual(cards);
    const site = (await http().get('/api/site-settings').expect(200)).body as SiteSettings;
    expect(site.homeCards.map((c) => c.title)).toEqual(['Catering', 'Interior design', 'Makeup & beauty', 'Photography & films']);
    expect(site.homeCards[0]!.tags).toEqual([{ label: 'New', tone: 'red' }, { label: 'Top', tone: 'gold' }]);
  });

  it('keeps exactly four valid cards', async () => {
    const send = (homeCards: unknown) => http().patch('/api/admin/settings').set('Cookie', superCookie).send({ homeCards });
    await send(DEFAULT_HOME_CARDS.slice(0, 3)).expect(400);
    const tooManyTags = [{ ...DEFAULT_HOME_CARDS[0]!, tags: ['A', 'B', 'C', 'D'].map((label) => ({ label, tone: 'red' })) }, ...DEFAULT_HOME_CARDS.slice(1)];
    const tags = await send(tooManyTags).expect(400);
    expect(tags.body.issues.map((i: { path: string }) => i.path)).toContain('homeCards.0.tags');
    await send([{ ...DEFAULT_HOME_CARDS[0]!, link: 'javascript:alert(1)' }, ...DEFAULT_HOME_CARDS.slice(1)]).expect(400);
    await send([{ ...DEFAULT_HOME_CARDS[0]!, tags: [{ label: 'x'.repeat(17), tone: 'red' }] }, ...DEFAULT_HOME_CARDS.slice(1)]).expect(400);
  });
});
