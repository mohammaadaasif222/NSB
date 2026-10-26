import { generateKeyPairSync } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import type {
  AdminCategory,
  AdminListing,
  AdminSettings,
  Banner,
  Category,
  ListingSummary,
  LocationOption,
  Paginated,
  UploadedImage,
} from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
/** Only the storage settings: the notifications suite owns the email settings and may run in parallel. */
const STORAGE_KEYS_SQL = (statement: string) => `${statement} where key = 'imageStorage' or key like 'storage.%'`;

/** Just enough of a PNG for the header check: signature plus IHDR with the given size. */
function png(width: number, height: number): Buffer {
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4, 'latin1');
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.set([8, 6, 0, 0, 0], 16);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ihdr]);
}

describe('Admin CMS (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let cookie: string;
  /** Storage settings as they were before the run (the dev DB may hold real credentials). */
  let savedSettings: { key: string; value: unknown }[];

  const http = () => request(app.getHttpServer());
  const admin = {
    get: (url: string) => http().get(url).set('Cookie', cookie),
    post: (url: string) => http().post(url).set('Cookie', cookie),
    patch: (url: string) => http().patch(url).set('Cookie', cookie),
    put: (url: string) => http().put(url).set('Cookie', cookie),
    delete: (url: string) => http().delete(url).set('Cookie', cookie),
  };
  const upload = async (slot: string, file = png(1500, 625)) =>
    (await admin.post(`/api/admin/uploads?slot=${slot}`).attach('file', file, 'image.png').expect(201))
      .body as UploadedImage;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    const res = await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD })
      .expect(200);
    cookie = (res.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
    savedSettings = (await pool.query(STORAGE_KEYS_SQL('select key, value from settings'))).rows;
  });

  afterAll(async () => {
    await pool.query(STORAGE_KEYS_SQL('delete from settings'));
    for (const { key, value } of savedSettings) {
      await pool.query('insert into settings (key, value) values ($1, $2)', [key, JSON.stringify(value)]);
    }
    await pool.query(`delete from banners where heading like 'E2E ${run}%'`);
    await pool.query(`delete from listings where slug like 'e2e-${run}-%'`);
    await pool.query(`delete from categories where slug like 'e2e-${run}-%' and parent_id is not null`);
    await pool.query(`delete from categories where slug like 'e2e-${run}-%'`);
    await pool.end();
    await app.close();
  });

  describe('settings and uploads', () => {
    it('saves the WhatsApp button and shows it publicly only while switched on', async () => {
      const before = (await pool.query(`select value from settings where key = 'contact.whatsapp'`)).rows[0]?.value;
      try {
        await admin.patch('/api/admin/settings').send({ whatsapp: { enabled: true, number: '12345' } }).expect(400);
        const res = await admin.patch('/api/admin/settings').send({ whatsapp: { enabled: true, number: '+91 98100 12345' } }).expect(200);
        expect(res.body.whatsapp).toMatchObject({ enabled: true, number: '9810012345', message: expect.stringContaining('{listing}') });
        expect((await http().get('/api/site-settings').expect(200)).body.whatsapp).toEqual({ number: '9810012345', message: res.body.whatsapp.message });

        await admin.patch('/api/admin/settings').send({ whatsapp: { enabled: false, number: '9810012345' } }).expect(200);
        expect((await http().get('/api/site-settings').expect(200)).body.whatsapp).toBeNull();
      } finally {
        await pool.query(`delete from settings where key = 'contact.whatsapp'`);
        if (before) await pool.query(`insert into settings (key, value) values ('contact.whatsapp', $1)`, [JSON.stringify(before)]);
      }
    });

    it('switches the listing page side cards on and off', async () => {
      const before = (await pool.query(`select value from settings where key = 'site.listingSidebar'`)).rows[0]?.value;
      try {
        await pool.query(`delete from settings where key = 'site.listingSidebar'`);
        expect((await http().get('/api/site-settings').expect(200)).body.listingSidebar).toEqual({ enabled: true, budget: true, type: true });
        await admin.patch('/api/admin/settings').send({ listingSidebar: { enabled: true } }).expect(400);
        const res = await admin.patch('/api/admin/settings').send({ listingSidebar: { enabled: true, budget: false, type: true } }).expect(200);
        expect(res.body.listingSidebar).toEqual({ enabled: true, budget: false, type: true });
        expect((await http().get('/api/site-settings').expect(200)).body.listingSidebar).toEqual({ enabled: true, budget: false, type: true });
      } finally {
        await pool.query(`delete from settings where key = 'site.listingSidebar'`);
        if (before) await pool.query(`insert into settings (key, value) values ('site.listingSidebar', $1)`, [JSON.stringify(before)]);
      }
    });

    it('switches new uploads to local storage', async () => {
      await pool.query(`delete from settings where key like 'storage.%'`);
      const res = await admin.patch('/api/admin/settings').send({ imageStorage: 'local' }).expect(200);
      expect(res.body).toMatchObject({ imageStorage: 'local', maxUploadBytes: expect.any(Number) });
      await admin.patch('/api/admin/settings').send({ imageStorage: 'ftp' }).expect(400);
      const notReady = await admin.patch('/api/admin/settings').send({ imageStorage: 'firebase' }).expect(400);
      expect(notReady.body.message).toMatch(/Firebase Storage is not configured/);
    });

    it('saves Cloudinary credentials encrypted and never returns the secret', async () => {
      const secret = 'e2e-cloudinary-secret-value';
      const cloudinary = { cloudName: 'e2e-cloud', apiKey: '123456789012', apiSecret: secret, folder: 'nsb-e2e' };
      await admin.patch('/api/admin/settings').send({ cloudinary: { ...cloudinary, apiSecret: undefined } }).expect(400);
      await admin.patch('/api/admin/settings').send({ cloudinary: { ...cloudinary, apiKey: 'abc' } }).expect(400);

      const res = await admin.patch('/api/admin/settings').send({ cloudinary }).expect(200);
      expect(res.body.cloudinary).toMatchObject({ configured: true, source: 'admin', cloudName: 'e2e-cloud', apiKey: '123456789012', folder: 'nsb-e2e' });
      expect(JSON.stringify(res.body)).not.toContain(secret);
      const { rows } = await pool.query(`select value from settings where key = 'storage.cloudinary'`);
      expect(JSON.stringify(rows[0].value)).not.toContain(secret);

      // A blank secret keeps the saved one.
      const kept = await admin
        .patch('/api/admin/settings')
        .send({ cloudinary: { cloudName: 'e2e-cloud', apiKey: '123456789012', folder: 'other' } })
        .expect(200);
      expect(kept.body.cloudinary).toMatchObject({ configured: true, folder: 'other' });
    });

    it('saves a Firebase service account and guards the active provider', async () => {
      const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
      const serviceAccount = JSON.stringify({
        type: 'service_account',
        project_id: 'nsb-e2e',
        client_email: 'uploader@nsb-e2e.iam.gserviceaccount.com',
        private_key: pem,
      });
      const bucket = 'nsb-e2e.firebasestorage.app';
      await admin.patch('/api/admin/settings').send({ firebase: { bucket, serviceAccount: '{not json' } }).expect(400);
      await admin.patch('/api/admin/settings').send({ firebase: { bucket, serviceAccount: '{"type":"user"}' } }).expect(400);

      const res = await admin.patch('/api/admin/settings').send({ firebase: { bucket, serviceAccount }, imageStorage: 'firebase' }).expect(200);
      expect(res.body).toMatchObject({
        imageStorage: 'firebase',
        firebase: { configured: true, source: 'admin', bucket, projectId: 'nsb-e2e', clientEmail: 'uploader@nsb-e2e.iam.gserviceaccount.com' },
      });
      expect(JSON.stringify(res.body)).not.toContain('PRIVATE KEY');

      const blocked = await admin.patch('/api/admin/settings').send({ firebase: null }).expect(400);
      expect(blocked.body.message).toMatch(/Choose another storage/);
      await admin.patch('/api/admin/settings').send({ imageStorage: 'local', firebase: null, cloudinary: null }).expect(200);
      const cleared = (await admin.get('/api/admin/settings').expect(200)).body as AdminSettings;
      expect(cleared.firebase).toMatchObject({ configured: false, source: null });
    });

    it('tests a storage connection', async () => {
      const local = await admin.post('/api/admin/uploads/test').send({ provider: 'local' }).expect(200);
      expect(local.body).toMatchObject({ ok: true });
      const firebase = await admin.post('/api/admin/uploads/test').send({ provider: 'firebase' }).expect(200);
      expect(firebase.body).toMatchObject({ ok: false, message: expect.stringMatching(/not configured/) });
      await http().post('/api/admin/uploads/test').send({ provider: 'local' }).expect(401);
    });

    it('accepts uploads only from admins', async () => {
      await http().post('/api/admin/uploads?slot=banner').attach('file', png(1500, 625), 'a.png').expect(401);
      await http().get('/api/admin/settings').expect(401);
    });

    it('validates the file', async () => {
      await admin.post('/api/admin/uploads?slot=banner').expect(400);
      await admin.post('/api/admin/uploads?slot=nope').attach('file', png(1500, 625), 'a.png').expect(400);
      const notImage = await admin
        .post('/api/admin/uploads?slot=banner')
        .attach('file', Buffer.from('<svg/>'), { filename: 'a.png', contentType: 'image/png' })
        .expect(400);
      expect(notImage.body.message).toMatch(/JPEG, PNG or WebP/);
      const small = await admin.post('/api/admin/uploads?slot=banner').attach('file', png(300, 100), 'a.png').expect(400);
      expect(small.body.message).toMatch(/at least 640×240/);
      await admin.post('/api/admin/uploads?slot=banner').attach('file', png(9000, 3000), 'a.png').expect(400);

      const { maxUploadBytes } = (await admin.get('/api/admin/settings')).body as AdminSettings;
      const huge = Buffer.concat([png(1500, 625), Buffer.alloc(maxUploadBytes)]);
      await admin.post('/api/admin/uploads?slot=banner').attach('file', huge, 'a.png').expect(413);
    });

    it('stores a valid image locally and serves it', async () => {
      const image = await upload('banner');
      expect(image).toMatchObject({ provider: 'local', width: 1500, height: 625 });
      expect(image.url).toMatch(/^\/api\/uploads\/banners\/[0-9a-f-]{36}\.png$/);
      const file = await http().get(image.url).expect(200);
      expect(file.headers['content-type']).toBe('image/png');
      expect(file.headers['cache-control']).toMatch(/immutable/);
      await http().get('/api/uploads/../package.json').expect(404);

      // Discarding an unsaved upload deletes it.
      await admin.post('/api/admin/uploads/discard').send({ urls: [image.url] }).expect(204);
      await http().get(image.url).expect(404);
      await admin.post('/api/admin/uploads/discard').send({ urls: [] }).expect(400);
    });
  });

  describe('banners', () => {
    const create = async (body: Record<string, unknown>) =>
      (await admin.post('/api/admin/banners').send(body).expect(201)).body as Banner;

    it('appends, reorders and shows only active banners publicly', async () => {
      const a = await create({ heading: `E2E ${run} A` });
      const b = await create({ heading: `E2E ${run} B`, isActive: false });
      const c = await create({ heading: `E2E ${run} C` });
      expect(c.sortOrder).toBeGreaterThan(b.sortOrder);
      expect(b.sortOrder).toBeGreaterThan(a.sortOrder);

      const all = (await admin.get('/api/admin/banners').expect(200)).body as Banner[];
      const others = all.filter((x) => ![a.id, b.id, c.id].includes(x.id)).map((x) => x.id);
      const reordered = (await admin.put('/api/admin/banners/order').send({ ids: [c.id, a.id, b.id, ...others] }).expect(200))
        .body as Banner[];
      expect(reordered.slice(0, 3).map((x) => x.id)).toEqual([c.id, a.id, b.id]);

      const pub = ((await http().get('/api/banners').expect(200)).body as Banner[]).map((x) => x.id);
      expect(pub.slice(0, 2)).toEqual([c.id, a.id]);
      expect(pub).not.toContain(b.id);

      await admin.put('/api/admin/banners/order').send({ ids: [a.id, crypto.randomUUID()] }).expect(404);
    });

    it('toggles without touching other fields, and partial edits keep the status', async () => {
      const banner = await create({ heading: `E2E ${run} toggle`, subheading: 'Keep me' });
      const off = await admin.patch(`/api/admin/banners/${banner.id}`).send({ isActive: false }).expect(200);
      expect(off.body).toMatchObject({ isActive: false, heading: banner.heading, subheading: 'Keep me' });
      const renamed = await admin.patch(`/api/admin/banners/${banner.id}`).send({ heading: `E2E ${run} renamed` }).expect(200);
      expect(renamed.body.isActive).toBe(false);
      await admin.patch(`/api/admin/banners/${crypto.randomUUID()}`).send({ isActive: true }).expect(404);
      await admin.patch('/api/admin/banners/not-a-uuid').send({ isActive: true }).expect(400);
    });

    it('deletes replaced images, but never one another record still uses', async () => {
      const first = await upload('banner');
      const mobile = await upload('banner-mobile', png(960, 640));
      const banner = await create({ heading: `E2E ${run} images`, imageUrl: first.url, mobileImageUrl: mobile.url });
      const twin = await create({ heading: `E2E ${run} twin`, imageUrl: first.url });

      // Replace both images on `banner`: the old desktop image is still used by `twin`.
      const second = await upload('banner');
      await admin.patch(`/api/admin/banners/${banner.id}`).send({ imageUrl: second.url, mobileImageUrl: null }).expect(200);
      await http().get(first.url).expect(200);
      await http().get(mobile.url).expect(404);

      // Discard never deletes an image a record uses.
      await admin.post('/api/admin/uploads/discard').send({ urls: [first.url] }).expect(204);
      await http().get(first.url).expect(200);

      await admin.delete(`/api/admin/banners/${twin.id}`).expect(204);
      await http().get(first.url).expect(404);
      await admin.delete(`/api/admin/banners/${banner.id}`).expect(204);
      await http().get(second.url).expect(404);
      await admin.delete(`/api/admin/banners/${banner.id}`).expect(404);
    });
  });

  describe('categories and listings', () => {
    let parent: Category;
    let sub: Category;
    let listing: AdminListing;

    it('creates a category with a sub-category and a listing', async () => {
      parent = (await admin.post('/api/admin/categories').send({ name: `E2E ${run}`, slug: `e2e-${run}-top` }).expect(201))
        .body as Category;
      sub = (
        await admin
          .post('/api/admin/categories')
          .send({ name: `E2E ${run} Sub`, slug: `e2e-${run}-sub`, parentId: parent.id })
          .expect(201)
      ).body as Category;
      expect(sub).toMatchObject({ parentId: parent.id, isActive: true });
      await admin.post('/api/admin/categories').send({ name: 'Dup', slug: sub.slug }).expect(409);

      const cover = await upload('listing', png(1600, 900));
      const photo = await upload('listing', png(1600, 900));
      listing = (
        await admin
          .post('/api/admin/listings')
          .send({
            categoryId: sub.id,
            name: `E2E ${run} Vendor`,
            slug: `e2e-${run}-vendor`,
            area: 'Noida',
            locality: 'Sector 18',
            shortDescription: 'Test',
            about: 'Keep this text',
            email: 'vendor@example.com',
            coverImageUrl: cover.url,
            gallery: [photo.url],
          })
          .expect(201)
      ).body as AdminListing;

      const cats = (await admin.get('/api/admin/categories').expect(200)).body as AdminCategory[];
      expect(cats.find((c) => c.id === sub.id)?.listingCount).toBe(1);
    });

    it('filters admin listings by category, including sub-categories', async () => {
      for (const id of [parent.id, sub.id]) {
        const res = (await admin.get(`/api/admin/listings?categoryId=${id}`).expect(200)).body as Paginated<ListingSummary>;
        expect(res.items.map((l) => l.id)).toEqual([listing.id]);
      }
      await admin.get('/api/admin/listings?categoryId=nope').expect(400);
    });

    it('saves tags without case duplicates and filters public listings by tag', async () => {
      const res = await admin.patch(`/api/admin/listings/${listing.id}`).send({ tags: ['Luxury', ' Banquet Halls ', 'luxury'] }).expect(200);
      expect((res.body as AdminListing).tags).toEqual(['Luxury', 'Banquet Halls']);
      const total = async (tag: string) =>
        ((await http().get(`/api/listings?category=${sub.slug}&tag=${encodeURIComponent(tag)}`).expect(200)).body as Paginated<ListingSummary>).total;
      expect(await total('luxury')).toBe(1);
      expect(await total('Banquet Halls')).toBe(1);
      expect(await total('Hotels')).toBe(0);
      // Untouched by a later update that leaves tags out.
      await admin.patch(`/api/admin/listings/${listing.id}`).send({ about: 'Keep this text' }).expect(200);
      expect(await total('Luxury')).toBe(1);
    });

    it('filters public listings and counts by location, matching localities case-insensitively', async () => {
      await admin.patch(`/api/admin/listings/${listing.id}`).send({ area: 'Noida', locality: ' sector 18 ' }).expect(200);
      const total = async (query: string) =>
        ((await http().get(`/api/listings?category=${sub.slug}&${query}`).expect(200)).body as Paginated<ListingSummary>).total;
      expect(await total('area=Noida&locality=Sector%2018')).toBe(1);
      expect(await total('area=Noida')).toBe(1);
      expect(await total('area=Noida&locality=Sector%2062')).toBe(0);
      expect(await total('area=Greater%20Noida')).toBe(0);
      await http().get('/api/listings?area=Delhi').expect(400);

      const locations = (await http().get('/api/locations').expect(200)).body as LocationOption[];
      expect(locations.map((l) => l.area)).toEqual(['Noida', 'Greater Noida', 'Greater Noida West']);
      expect(locations[0].localities.some((l) => l.name.toLowerCase() === 'sector 18' && l.count >= 1)).toBe(true);

      const bySub = (await http().get(`/api/locations/counts?parent=${parent.slug}&area=Noida&locality=Sector%2018`).expect(200)).body;
      expect(bySub).toEqual({ [sub.slug]: 1 });
      const byTop = (await http().get('/api/locations/counts?area=Noida&locality=Sector%2018').expect(200)).body as Record<string, number>;
      expect(byTop[parent.slug]).toBe(1);
      expect(byTop[sub.slug]).toBeUndefined();
    });

    it('keeps omitted fields on a partial listing update', async () => {
      const res = await admin.patch(`/api/admin/listings/${listing.id}`).send({ name: `E2E ${run} Vendor 2` }).expect(200);
      expect(res.body).toMatchObject({ about: 'Keep this text', gallery: [{ url: listing.gallery[0].url }] });
      expect(res.body.coverImageUrl).toBe(listing.coverImageUrl);
    });

    it('hides inactive categories and their listings from the public site', async () => {
      await http().get(`/api/listings/${listing.slug}`).expect(200);
      await admin.patch(`/api/admin/categories/${sub.id}`).send({ isActive: false }).expect(200);
      await http().get(`/api/categories/${sub.slug}`).expect(404);
      await http().get(`/api/listings/${listing.slug}`).expect(404);
      expect((await http().get(`/api/categories/${parent.slug}`).expect(200)).body.children).toEqual([]);
      const listed = (await http().get(`/api/listings?category=${sub.slug}`).expect(200)).body as Paginated<ListingSummary>;
      expect(listed.total).toBe(0);
      // Still managed in the admin panel.
      expect((await admin.get(`/api/admin/listings?categoryId=${sub.id}`).expect(200)).body.total).toBe(1);

      await admin.patch(`/api/admin/categories/${sub.id}`).send({ isActive: true }).expect(200);
      await admin.patch(`/api/admin/categories/${parent.id}`).send({ isActive: false }).expect(200);
      await http().get(`/api/categories/${sub.slug}`).expect(404);
      await http().get(`/api/listings/${listing.slug}`).expect(404);
      const top = (await http().get('/api/categories').expect(200)).body as Category[];
      expect(top.some((c) => c.id === parent.id)).toBe(false);
      await admin.patch(`/api/admin/categories/${parent.id}`).send({ isActive: true }).expect(200);
      await http().get(`/api/listings/${listing.slug}`).expect(200);
    });

    it('reorders only within one sibling group', async () => {
      await admin.put('/api/admin/categories/order').send({ ids: [parent.id, sub.id] }).expect(400);
      await admin.put('/api/admin/categories/order').send({ ids: [sub.id] }).expect(200);
    });

    it('releases listing images when they are removed', async () => {
      const [photo] = listing.gallery;
      await admin.patch(`/api/admin/listings/${listing.id}`).send({ gallery: [] }).expect(200);
      await http().get(photo.url).expect(404);
      await http().get(listing.coverImageUrl!).expect(200);
    });

    it('deletes a category only when it is empty', async () => {
      const parentDelete = await admin.delete(`/api/admin/categories/${parent.id}`).expect(409);
      expect(parentDelete.body.message).toMatch(/sub-categories/);
      const subDelete = await admin.delete(`/api/admin/categories/${sub.id}`).expect(409);
      expect(subDelete.body.message).toMatch(/listings/);

      await admin.delete(`/api/admin/listings/${listing.id}`).expect(204);
      await http().get(listing.coverImageUrl!).expect(404);
      await admin.delete(`/api/admin/categories/${sub.id}`).expect(204);
      await admin.delete(`/api/admin/categories/${parent.id}`).expect(204);
      await admin.delete(`/api/admin/categories/${parent.id}`).expect(404);
    });
  });
});
