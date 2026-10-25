import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { type DashboardStats, LISTING_AREAS } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

describe('Admin dashboard (e2e)', () => {
  let app: NestExpressApplication;
  let cookie: string;
  const http = () => request(app.getHttpServer());
  const get = async (days: number) => (await http().get(`/api/admin/dashboard?days=${days}`).set('Cookie', cookie).expect(200)).body as DashboardStats;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    const res = await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD })
      .expect(200);
    cookie = (res.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('is for admins only and takes 7, 30 or 90 days', async () => {
    await http().get('/api/admin/dashboard').expect(401);
    await http().get('/api/admin/dashboard?days=5').set('Cookie', cookie).expect(400);
  });

  it('draws a bar per day, or per week for 90 days, that add up to the lead totals', async () => {
    for (const [days, bars] of [
      [7, 7],
      [30, 30],
      [90, 13],
    ] as const) {
      const stats = await get(days);
      expect(stats.days).toBe(days);
      expect(stats.series).toHaveLength(bars);
      expect(stats.series.map((b) => b.end)).toEqual([...stats.series.map((b) => b.end)].sort());
      expect(stats.leads.realEstate).toBe(stats.series.reduce((a, b) => a + b.realEstate, 0));
      expect(stats.leads.wedding).toBe(stats.series.reduce((a, b) => a + b.wedding, 0));
      expect(stats.leads.inRange).toBe(stats.leads.realEstate + stats.leads.wedding);
      expect(stats.leads.inRange).toBeLessThanOrEqual(stats.leads.total);
      expect(stats.byCategory.reduce((a, c) => a + c.count, 0)).toBe(stats.leads.inRange);
    }
  });

  it('counts listings and projects, with the site areas first', async () => {
    const stats = await get(7);
    expect(stats.listings.live + stats.listings.draft + stats.listings.hidden).toBe(stats.listings.total);
    expect(stats.projects.live + stats.projects.draft + stats.projects.hidden).toBe(stats.projects.total);
    expect(stats.projects.activeTerms).toBeLessThanOrEqual(stats.projects.live);
    expect(stats.byArea.slice(0, LISTING_AREAS.length).map((a) => a.area)).toEqual([...LISTING_AREAS]);
    const live = stats.byArea.reduce((a, b) => a + b.listings + b.projects, 0);
    expect(live).toBe(stats.listings.live + stats.projects.live);
    expect(stats.expiring.every((p) => p.daysLeft <= 30)).toBe(true);
  });
});
