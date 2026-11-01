import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { type CategoryDetail, REAL_ESTATE_SLUG, type SitemapEntry, type SitemapListing } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

loadEnvFile();

describe('Public input and the sitemap (e2e)', () => {
  let app: NestExpressApplication;
  let cookie: string;
  const http = () => request(app.getHttpServer());

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

  it('answers bad text with a 400, not a database error', async () => {
    await http().get('/api/listings/bad%00slug').expect(400);
    await http().get('/api/listings?q=a%00b').expect(400);
    const lead = { listingId: '00000000-0000-4000-8000-000000000000', name: 'A\u0000B', mobile: '9876543210', message: 'Hi', preferredDate: '2027-02-14' };
    await http().post('/api/enquiries').send(lead).expect(400);
    await http().post('/api/enquiries').send({ ...lead, name: 'Asha', preferredDate: '0000-01-01' }).expect(400);
  });

  it('lists only addresses and dates for the sitemap', async () => {
    const listings = (await http().get('/api/listings/sitemap').expect(200)).body as SitemapListing[];
    for (const listing of listings) expect(Object.keys(listing).sort()).toEqual(['category', 'slug', 'updatedAt', 'vertical']);
    const projects = (await http().get('/api/projects/sitemap').expect(200)).body as SitemapEntry[];
    for (const project of projects) expect(Object.keys(project).sort()).toEqual(['slug', 'updatedAt']);
  });

  it('keeps the address of a category that pages depend on', async () => {
    const realEstate = (await http().get(`/api/categories/${REAL_ESTATE_SLUG}`).expect(200)).body as CategoryDetail;
    const patch = (body: object) => http().patch(`/api/admin/categories/${realEstate.id}`).set('Cookie', cookie).send(body);
    await patch({ slug: 'homes' }).expect(400);
    await patch({ slug: REAL_ESTATE_SLUG }).expect(200);
  });
});
