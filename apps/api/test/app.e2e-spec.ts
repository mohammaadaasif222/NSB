import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import pg from 'pg';
import request from 'supertest';
import type { AdminListing, Category, CategoryDetail, Enquiry, ListingDetail, ListingSummary, Paginated } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const slug = `e2e-vendor-${run}`;

describe('NSB API (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let cookie: string;
  let category: Category;
  let listing: AdminListing;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  });

  afterAll(async () => {
    await pool.query(`delete from enquiries where listing_name = 'E2E Test Vendor'`);
    await pool.query(`delete from listings where slug = $1`, [slug]);
    await pool.end();
    await app.close();
  });

  it('reports health', async () => {
    await http().get('/api/health').expect(200, { status: 'ok' });
  });

  it('lists top-level categories with Wedding first', async () => {
    const res = await http().get('/api/categories').expect(200);
    const cats = res.body as Category[];
    expect(cats[0]).toMatchObject({ slug: 'wedding', parentId: null });
    expect(cats.every((c) => c.parentId === null)).toBe(true);
  });

  it('serves the wedding landing data with its sub-categories', async () => {
    const res = await http().get('/api/categories/wedding').expect(200);
    const wedding = res.body as CategoryDetail;
    expect(wedding.parent).toBeNull();
    expect(wedding.children.map((c) => c.slug)).toEqual(
      expect.arrayContaining(['wedding-venues', 'makeup-beauty', 'catering-halwai']),
    );
    category = wedding.children[0];

    const sub = await http().get(`/api/categories/${category.slug}`).expect(200);
    expect(sub.body).toMatchObject({ parent: { slug: 'wedding' }, children: [] });

    const children = await http().get('/api/categories?parent=wedding').expect(200);
    expect(children.body).toHaveLength(wedding.children.length);
    await http().get('/api/categories/no-such-category').expect(404);
  });

  it('protects admin routes', async () => {
    await http().get('/api/admin/listings').expect(401);
    await http().get('/api/auth/me').expect(401);
  });

  it('rejects a wrong password and accepts the seeded admin', async () => {
    await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);

    const res = await http()
      .post('/api/auth/login')
      .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD })
      .expect(200);
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie[0]).toMatch(/^nsb_session=.+HttpOnly/);
    cookie = setCookie[0].split(';')[0];

    await http().get('/api/auth/me').set('Cookie', cookie).expect(200);
  });

  it('lets the signed-in admin change their password', async () => {
    const email = process.env.SEED_ADMIN_EMAIL;
    const current = process.env.SEED_ADMIN_PASSWORD!;
    const next = `e2e-${run}-password`;
    const change = (body: object, session = cookie) => http().post('/api/auth/password').set('Cookie', session).send(body);

    await http().post('/api/auth/password').send({ currentPassword: current, newPassword: next, confirmPassword: next }).expect(401);
    const mismatch = await change({ currentPassword: current, newPassword: next, confirmPassword: 'other-password' }).expect(400);
    expect(mismatch.body.issues).toEqual([{ path: 'confirmPassword', message: 'Passwords do not match' }]);
    const wrong = await change({ currentPassword: 'wrong-password', newPassword: next, confirmPassword: next }).expect(400);
    expect(wrong.body.issues).toEqual([{ path: 'currentPassword', message: 'Current password is incorrect' }]);

    await change({ currentPassword: current, newPassword: next, confirmPassword: next }).expect(204);
    try {
      await http().post('/api/auth/login').send({ email, password: current }).expect(401);
      await http().post('/api/auth/login').send({ email, password: next }).expect(200);
    } finally {
      // Restore the seeded password so later runs (and the dev login) keep working.
      await change({ currentPassword: next, newPassword: current, confirmPassword: current }).expect(204);
    }
  });

  it('creates a listing with a gallery', async () => {
    const res = await http()
      .post('/api/admin/listings')
      .set('Cookie', cookie)
      .send({
        categoryId: category.id,
        name: 'E2E Test Vendor',
        slug,
        area: 'Sector 18, Noida',
        shortDescription: 'Test vendor',
        services: ['Service A'],
        quickInfo: [{ label: 'Starting price', value: '₹50,000' }],
        email: 'vendor@example.com',
        gallery: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
        videos: [
          { kind: 'video', url: 'https://youtu.be/dQw4w9WgXcQ' },
          { kind: 'short', url: ' https://www.youtube.com/shorts/aqz-KE-bpKQ ' },
        ],
      })
      .expect(201);
    listing = res.body as AdminListing;
    expect(listing.gallery.map((g) => g.url)).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    expect(listing.keyInfo).toHaveLength(1);
    expect(listing.videos).toEqual([
      { kind: 'video', url: 'https://youtu.be/dQw4w9WgXcQ' },
      { kind: 'short', url: 'https://www.youtube.com/shorts/aqz-KE-bpKQ' },
    ]);
  });

  it('keeps the vendor email optional and the lead switch on by default', async () => {
    expect(listing).toMatchObject({ email: 'vendor@example.com', notifyVendor: true, createdAt: expect.any(String) });
    const res = await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ email: '', notifyVendor: false }).expect(200);
    expect(res.body).toMatchObject({ email: null, notifyVendor: false });
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ email: 'not-an-email' }).expect(400);
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ email: 'Vendor@Example.com', notifyVendor: true }).expect(200);
    expect((await http().get(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).expect(200)).body.email).toBe('vendor@example.com');
  });

  it('shows only Live listings on the site, and filters by status in admin', async () => {
    const publicSlugs = async () =>
      ((await http().get(`/api/listings?category=${category.slug}`).expect(200)).body as Paginated<ListingDetail>).items.map((l) => l.slug);
    expect(listing.status).toBe('live');
    for (const status of ['draft', 'hidden'] as const) {
      await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ status }).expect(200);
      await http().get(`/api/listings/${slug}`).expect(404);
      expect(await publicSlugs()).not.toContain(slug);
      const admin = (await http().get(`/api/admin/listings?status=${status}&q=e2e test vendor`).set('Cookie', cookie).expect(200)).body as Paginated<ListingDetail>;
      expect(admin.items.map((l) => [l.slug, l.status])).toContainEqual([slug, status]);
    }
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ status: 'archived' }).expect(400);
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ status: 'live' }).expect(200);
    expect(await publicSlugs()).toContain(slug);
  });

  it('shows real ratings only: the Google rating, else the reviews average', async () => {
    const card = async () =>
      ((await http().get(`/api/listings?category=${category.slug}`).expect(200)).body as Paginated<ListingDetail>).items.find((l) => l.slug === slug)!;
    expect((await card()).rating).toBeNull(); // nothing entered: no made-up stars

    // Reviews, added by hand.
    const add = (body: object) => http().post(`/api/admin/listings/${listing.id}/reviews`).set('Cookie', cookie).send(body);
    await add({ authorName: 'Bad', rating: 6, source: 'google' }).expect(400);
    await add({ authorName: 'Bad', rating: 4, source: 'twitter' }).expect(400);
    const first = (await add({ authorName: 'Priya S.', rating: 5, text: 'Lovely venue', reviewDate: '2026-09-01', source: 'google' }).expect(201)).body;
    expect(first).toMatchObject({ authorName: 'Priya S.', rating: 5, isVerified: true, source: 'google' });
    await add({ authorName: 'Rohit', rating: 4, source: 'customer', isVerified: false }).expect(201);
    expect((await card()).rating).toEqual({ average: 4.5, count: 2, source: 'reviews' });

    const edited = await http().patch(`/api/admin/reviews/${first.id}`).set('Cookie', cookie).send({ rating: 3 }).expect(200);
    expect(edited.body.rating).toBe(3);
    const detail = (await http().get(`/api/listings/${slug}`).expect(200)).body as ListingDetail;
    expect(detail.reviews.map((r) => r.authorName)).toEqual(['Priya S.', 'Rohit']); // dated reviews first
    expect(detail.rating).toEqual({ average: 3.5, count: 2, source: 'reviews' });

    // A Google rating, typed in, takes over the cards.
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ googleRating: 6 }).expect(400);
    await http()
      .patch(`/api/admin/listings/${listing.id}`)
      .set('Cookie', cookie)
      .send({ googleRating: '4.7', googleReviewCount: '128', googleMapsUrl: 'https://maps.app.goo.gl/abc' })
      .expect(200);
    expect((await card()).rating).toEqual({ average: 4.7, count: 128, source: 'google' });

    await http().delete(`/api/admin/reviews/${first.id}`).set('Cookie', cookie).expect(204);
    await http().delete(`/api/admin/reviews/${first.id}`).set('Cookie', cookie).expect(404);
    await http().get(`/api/admin/listings/${listing.id}/reviews`).expect(401);
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ googleRating: '', googleReviewCount: '', googleMapsUrl: '' }).expect(200);
    expect((await card()).rating).toEqual({ average: 4, count: 1, source: 'reviews' });
  });

  it('saves headed service sections and shows their services on the card', async () => {
    const serviceGroups = [
      { title: 'Food', items: ['Live counters', 'Mithai'] },
      { title: 'Decor', items: ['Floral mandap'] },
    ];
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ serviceGroups: [{ title: 'Empty', items: [] }] }).expect(400);
    await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ serviceGroups }).expect(200);
    const detail = (await http().get(`/api/listings/${slug}`).expect(200)).body as ListingDetail;
    expect(detail.serviceGroups).toEqual(serviceGroups);
    expect(detail.services).toEqual(['Service A']); // the plain list stays separate on the page
    const card = ((await http().get(`/api/listings?category=${category.slug}`).expect(200)).body as Paginated<ListingDetail>).items.find((l) => l.slug === slug)!;
    expect(card.services).toEqual(['Service A', 'Live counters', 'Mithai', 'Floral mandap']);
  });

  it('finds listings in the admin panel by search and date added', async () => {
    const find = async (qs: string) =>
      ((await http().get(`/api/admin/listings?${qs}`).set('Cookie', cookie).expect(200)).body as Paginated<ListingDetail>).items.map((l) => l.slug);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    expect(await find('q=e2e test vendor')).toContain(slug);
    expect(await find(`q=e2e test vendor&from=${today}&to=${today}`)).toContain(slug);
    expect(await find('q=e2e test vendor&to=2000-01-01')).not.toContain(slug);
    expect(await find('q=e2e test vendor&from=&to=')).toContain(slug); // blank form values are ignored
    await http().get('/api/admin/listings?from=yesterday').set('Cookie', cookie).expect(400);
  });

  it('accepts only YouTube links as listing videos', async () => {
    const res = await http()
      .patch(`/api/admin/listings/${listing.id}`)
      .set('Cookie', cookie)
      .send({ videos: [{ kind: 'video', url: 'https://vimeo.com/123456' }] })
      .expect(400);
    expect(JSON.stringify(res.body.issues)).toContain('videos');
    // The failed update left the saved videos alone.
    expect((await http().get(`/api/listings/${slug}`).expect(200)).body.videos).toHaveLength(2);
  });

  it('checks structured details against the sub-category form and builds key info from them', async () => {
    // Details are checked against the form; a listing without them keeps its own quick info.
    const bad = await http().patch(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).send({ details: {} }).expect(400);
    expect(bad.body.issues).toContainEqual({ path: 'details.startingPrice', message: 'This field is required' });
    expect((await http().get(`/api/listings/${slug}`).expect(200)).body.keyInfo).toEqual([{ label: 'Starting price', value: '₹50,000' }]);

    const venues = (await http().get('/api/categories/wedding-venues').expect(200)).body as Category;
    const formSlug = `${slug}-form`;
    try {
      const res = await http()
        .post('/api/admin/listings')
        .set('Cookie', cookie)
        .send({
          categoryId: venues.id,
          name: 'E2E Form Venue',
          slug: formSlug,
          area: 'Noida',
          locality: 'Sector 62',
          shortDescription: 'Test venue',
          email: 'venue@example.com',
          quickInfo: [{ label: 'Ignored', value: 'Saved but not shown' }],
          details: { startingPrice: 150000, venueType: 'Lawn', maxGuests: 800, parking: true, bridalMakeupPrice: 1 },
        })
        .expect(201);
      const created = res.body as AdminListing;
      // Answers the venue form does not ask for are dropped.
      expect(created.details).toEqual({ startingPrice: 150000, venueType: 'Lawn', maxGuests: 800, parking: true });
      expect(created.savedQuickInfo).toEqual([{ label: 'Ignored', value: 'Saved but not shown' }]);
      expect(created.keyInfo).toEqual([
        { label: 'Starting price', value: '₹1,50,000' },
        { label: 'Venue type', value: 'Lawn' },
        { label: 'Max guests', value: '800 guests' },
        { label: 'Parking available', value: 'Yes' },
      ]);
      expect(created.locality).toBe('Sector 62');

      const wrong = await http()
        .patch(`/api/admin/listings/${created.id}`)
        .set('Cookie', cookie)
        .send({ details: { ...created.details, venueType: 'Castle' } })
        .expect(400);
      expect(wrong.body.issues.map((i: { path: string }) => i.path)).toEqual(['details.venueType']);
    } finally {
      await pool.query(`delete from listings where slug = $1`, [formSlug]);
    }
  });

  it('rejects a duplicate slug and invalid input', async () => {
    await http()
      .post('/api/admin/listings')
      .set('Cookie', cookie)
      .send({ categoryId: category.id, name: 'Dup', slug, area: 'X', shortDescription: 'X', email: 'a@b.co' })
      .expect(409);
    const res = await http().post('/api/admin/listings').set('Cookie', cookie).send({ slug: 'Bad Slug' }).expect(400);
    expect(res.body.issues.length).toBeGreaterThan(0);
  });

  it('serves the listing publicly without vendor contact details', async () => {
    const list = await http().get(`/api/listings?category=${category.slug}`).expect(200);
    const card = (list.body as Paginated<ListingSummary>).items.find((l) => l.slug === slug);
    expect(card?.galleryPreview).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);

    const detail = await http().get(`/api/listings/${slug}`).expect(200);
    expect(detail.body.name).toBe('E2E Test Vendor');
    expect(detail.body).not.toHaveProperty('email');
    expect(detail.body).not.toHaveProperty('phone');
  });

  it('searches a category by listing name, ignoring case', async () => {
    const search = async (q: string) =>
      ((await http().get(`/api/listings?category=${category.slug}&q=${encodeURIComponent(q)}`).expect(200)).body as Paginated<ListingDetail>).items;
    expect((await search('e2e test')).some((l) => l.slug === slug)).toBe(true);
    expect(await search('no-such-vendor-xyz')).toHaveLength(0);
    // LIKE wildcards are matched literally, not as "anything".
    expect(await search('%')).toHaveLength(0);
  });

  it('saves an enquiry tagged with its source', async () => {
    const base = { listingId: listing.id, name: 'Asha', message: 'Need a quote', preferredDate: '2027-02-14' };
    await http().post('/api/enquiries').send({ ...base, mobile: '12345' }).expect(400);
    await http().post('/api/enquiries').send({ ...base, mobile: '+91 98765 43210' }).expect(201);

    const res = await http().get(`/api/admin/enquiries?listingId=${listing.id}`).set('Cookie', cookie).expect(200);
    const [lead] = (res.body as Paginated<Enquiry>).items;
    expect(lead).toMatchObject({
      mobile: '9876543210',
      listingName: 'E2E Test Vendor',
      categoryId: category.id,
      categoryName: category.name,
    });
  });

  it('updates the gallery and deletes the listing, keeping the lead', async () => {
    const res = await http()
      .patch(`/api/admin/listings/${listing.id}`)
      .set('Cookie', cookie)
      .send({ gallery: ['https://example.com/c.jpg'] })
      .expect(200);
    expect(res.body.gallery).toHaveLength(1);

    await http().delete(`/api/admin/listings/${listing.id}`).set('Cookie', cookie).expect(204);
    await http().get(`/api/listings/${slug}`).expect(404);

    const { rows } = await pool.query(`select listing_id from enquiries where listing_name = 'E2E Test Vendor'`);
    expect(rows).toEqual([{ listing_id: null }]);
  });

  it('keeps categories to two levels', async () => {
    // `category` is a wedding sub-category, so it cannot be a parent.
    await http()
      .post('/api/admin/categories')
      .set('Cookie', cookie)
      .send({ name: 'E2E Grandchild', slug: `e2e-grandchild-${run}`, parentId: category.id })
      .expect(400);
    await http()
      .patch(`/api/admin/categories/${category.id}`)
      .set('Cookie', cookie)
      .send({ parentId: category.id })
      .expect(400);
  });

  it('manages hero banners', async () => {
    const created = await http()
      .post('/api/admin/banners')
      .set('Cookie', cookie)
      .send({ heading: 'E2E banner', subheading: 'No image needed', isActive: false })
      .expect(201);
    expect(created.body).toMatchObject({ imageUrl: null, subheading: 'No image needed' });
    const pub = await http().get('/api/banners').expect(200);
    expect(pub.body.some((b: { id: string }) => b.id === created.body.id)).toBe(false);
    await http().delete(`/api/admin/banners/${created.body.id}`).set('Cookie', cookie).expect(204);
  });
});
