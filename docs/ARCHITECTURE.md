# NSB architecture

Noida Super Bazaar (NSB), Phase-1 Wedding MVP. It is a mobile-first wedding vendor marketplace for Noida, Greater Noida and Noida Extension, built to generate leads.

This file is the architecture brief. Give it, together with the root `AGENTS.md`, to any developer or AI agent before they work on the codebase.

## Shape

```
                 Browser (couples · NSB team)
                            │  https://<domain>
                    ┌───────▼────────┐
                    │     Caddy      │  TLS, gzip
                    └───┬────────┬───┘
              /api/*    │        │   everything else
              ┌─────────▼──┐  ┌──▼───────────────────────────┐
              │  NestJS    │  │  Next.js (one app)           │
              │  apps/api  │◄─┤  public site  /  /wedding/…  │
              │  REST /api │  │  admin panel  /admin/…       │
              └─────┬──────┘  └──────────────────────────────┘
                    │  server components call the API over the internal network
          ┌─────────┼──────────────┬──────────────┐
     PostgreSQL   Cloudinary     Email (M4)
                  (images, M5)   Zoho / Resend
```

- **One public origin.** Caddy sends `/api/*` to NestJS and every other path to Next.js. The session cookie is first-party, and no CORS is involved. In development, a `rewrites()` entry in `next.config.ts` does the same job as Caddy.
- **The API is the only path to the database.** Next.js never talks to Postgres. Server components call `API_INTERNAL_URL`, and the browser calls `/api`.
- **The API is stateless.** Sessions are JWTs held in an httpOnly cookie. More API instances can be added behind Caddy later without code changes.

## Monorepo

npm workspaces, Node 24, TypeScript 6.

| Path | What it is |
|---|---|
| `packages/shared` (`@nsb/shared`) | Zod schemas (request contracts) and TypeScript response types, used by both apps. ESM, compiled to `dist/`. |
| `apps/api` (`@nsb/api`) | NestJS 12 (ESM), Drizzle ORM, node-postgres. |
| `apps/web` (`@nsb/web`) | Next.js 16 App Router, React 19, Tailwind 4. Serves both the public site and `/admin`. |
| `deploy/` | Production Docker Compose (postgres, api, web, caddy) and the Caddyfile. |
| `docker-compose.yml` | Development Postgres only, on host port **5434**. |

To change an API contract, edit the schema in `@nsb/shared`. The API validates requests with it through `ZodPipe`, and the web app gets the matching types from the same package.

## API (`apps/api/src`)

```
main.ts / app.setup.ts   helmet, cookie-parser, trust proxy, global prefix /api
config/env.ts            zod-validated environment; the app refuses to boot when a value is invalid
db/schema.ts             Drizzle tables, the single source of the DB schema
db/migrate.ts, seed.ts   run migrations; seed the 5 categories and the first admin
common/                  ZodPipe, Postgres error mapping (23505→409, 23503→400), pagination, reorderRows
modules/
  auth/                  login/logout/me, AdminGuard, @CurrentAdmin (global module)
  categories/            public read + admin create/update/reorder
  listings/              public list/detail + admin CRUD, gallery
  banners/               public active banners + admin CRUD and reorder
  media/                 image uploads: validation, storage providers (Cloudinary | Firebase | local), cleanup
  settings/              admin-editable settings: storage provider and its credentials (encrypted)
  enquiries/             public submit + admin list (filter by category/listing)
  notifications/         enquiry alert emails over the SMTP server set in Admin › Settings (nodemailer)
  health/                GET /api/health (checks the DB)
```

**Conventions**

- Public routes live under `/api/<resource>`. Admin routes live under `/api/admin/<resource>` and use `@UseGuards(AdminGuard)`. Each module has a public controller and an admin controller over one service.
- Validate every body and query with `new ZodPipe(schemaFromShared)`. Return types come from `@nsb/shared`.
- Public responses never include a vendor's email or phone (`ListingDetail`). Admin responses do (`AdminListing`).
- An enquiry copies the listing name and category name when it is saved. Deleting the listing sets `listing_id` to null, and the lead keeps its source.
- A failed notification must never fail the enquiry request or lose the lead. The lead is saved first.
- A listing's vendor email is optional, and each listing has `notify_vendor` (default on). The vendor is emailed only when Settings › "Also email the vendor" is on, the listing's switch is on, and it has an email; otherwise the lead reaches NSB only.
- Listings have a `status` (live | draft | hidden, default live); public routes show live listings only, and admin lists filter by `status`.
- Ratings are never invented: a card shows the Google rating the admin typed in (`google_rating`, `google_review_count`, `google_maps_url`; not synced from Google), else the average of the listing's `listing_reviews` (added by hand in admin: author, 1–5 stars, text, date, source google|customer, verified). Admin routes: `GET/POST /api/admin/listings/:id/reviews`, `PATCH/DELETE /api/admin/reviews/:id`.
- `service_groups` jsonb holds headed service sections, shown after the plain `services` on the listing page; cards' chips use both.
- Admin › Settings › Listing page sidebar (`site.listingSidebar`: enabled, budget, type) controls the category page's side cards; the site reads it from `GET /api/site-settings`.
- The cover photo upload opens a cropper (react-easy-crop: 16:9, 4:3, square, 3:4, or "Use whole photo") and uploads the cropped JPEG.
- Admin listings support `q`, `categoryId` and `from`/`to` (date added, India time). Listing photos accept any orientation (min 480×320 either way round, `imageTooSmall` in `@nsb/shared`). Numbers in listing details are not comma-grouped below 10,000, and a calendar year typed into "Years in business" shows as "Since 2005".
- The NSB alert email carries the listing context (category path, area, quick info, services, the vendor's private phone and email) plus Call, WhatsApp, View listing and admin links. The vendor email carries only the lead and Call/WhatsApp links.
- Login is rate-limited to 5 per minute per IP (`@nestjs/throttler`, with Caddy trusted as the proxy).

### Endpoints (Milestone 1)

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | – |
| POST | `/api/auth/login` · `/api/auth/logout` | – |
| GET | `/api/auth/me` | admin |
| POST | `/api/auth/password` `{ currentPassword, newPassword, confirmPassword }` (wrong current password → 400 on `currentPassword`, not 401) | admin |
| GET | `/api/categories` (top-level) · `?parent=<slug>` (sub-categories) · `/api/categories/:slug` (with parent + children) | – |
| GET | `/api/listings?category=&q=&featured=&page=&pageSize=` (`q` matches name, area or short description) · `/api/listings/:slug` | – |
| GET | `/api/banners` (active only) | – |
| POST | `/api/enquiries` | – |
| GET, POST | `/api/admin/categories` | admin |
| PATCH | `/api/admin/categories/:id` | admin |
| PUT | `/api/admin/categories/order` `{ ids: [...] }` | admin |
| GET, POST | `/api/admin/listings?categoryId=` (a top-level id includes its sub-categories) | admin |
| GET, PATCH, DELETE | `/api/admin/listings/:id` (PATCH with `gallery` replaces the gallery) | admin |
| DELETE | `/api/admin/categories/:id` (empty categories only, else 409) | admin |
| GET, POST | `/api/admin/banners` | admin |
| PUT | `/api/admin/banners/order` `{ ids: [...] }` | admin |
| PATCH, DELETE | `/api/admin/banners/:id` | admin |
| POST | `/api/admin/uploads?slot=<banner\|banner-mobile\|category-icon\|category\|listing>` (multipart `file`) → `{ url }` | admin |
| POST | `/api/admin/uploads/discard` `{ urls }` (deletes uploads no record uses) | admin |
| GET, PATCH | `/api/admin/settings` (`imageStorage`, `cloudinary`, `firebase` credentials; secrets are write-only) | admin |
| POST | `/api/admin/uploads/test` `{ provider }` (uploads and deletes a 1×1 image) | admin |
| GET | `/api/uploads/*` (locally stored images) | – |
| GET | `/api/admin/enquiries?q=&categoryId=&listingId=&status=unread\|read&from=&to=&page=&pageSize=` | admin |
| GET | `/api/admin/enquiries/export` with the same filters (CSV download; Name, Mobile and Email in separate columns) | admin |
| GET | `/api/admin/enquiries/unread-count` (polled by the admin bell) | admin |
| PATCH | `/api/admin/enquiries/:id` `{ read }` · POST `/api/admin/enquiries/read-all` | admin |
| POST | `/api/admin/notifications/test-email` `{ to? }` | admin |

## Data model

```
admin_users   id, email (unique), name, password_hash (bcrypt), created_at
categories    id, parent_id → categories (restrict, 2 levels), name, slug (unique), description,
              image_url (URL or /images/... path), is_active, sort_order, timestamps
listings      id, category_id → categories (restrict), name, slug (unique), area, locality, address,
              short_description, about, services text[], quick_info jsonb [{label,value}],
              details jsonb {fieldKey: value} (structured form answers, {} for older listings),
              email (vendor alerts, private), phone (private), cover_image_url,
              videos jsonb [{kind: video|short, url}] (YouTube links only),
              is_featured, timestamps
listing_images id, listing_id → listings (cascade), url, sort_order
banners       id, image_url, mobile_image_url (both optional), heading, subheading, cta_label,
              cta_link, is_active, sort_order, timestamps
media         id, url (unique), provider (cloudinary|firebase|local), storage_key, account
              (cloud name or bucket), mime_type, bytes, width, height, created_at
settings      key (pk), value jsonb, updated_at
enquiries     id, listing_id → listings (set null), listing_name, category_id → categories
              (set null), category_name, name, mobile, message, preferred_date, budget, event_type (optional), created_at,
              read_at (null = unread)
```

**Images.** Admins upload through `POST /api/admin/uploads`, then save the returned URL on the record (records keep plain URL columns). The API checks the file's bytes (JPEG, PNG or WebP only), size (`UPLOAD_MAX_MB`, default 5) and dimensions per slot (`IMAGE_SLOTS` in `@nsb/shared`, which also holds the recommended sizes shown in the admin). The provider for new uploads is an admin setting: Cloudinary (signed REST API), Firebase Storage (Google Cloud Storage JSON API with a service-account JWT; files get a Firebase download-token URL) or local disk (`UPLOAD_DIR`, served at `/api/uploads/`, a Docker volume in production). No SDKs are used. Cloudinary and Firebase credentials are entered in Admin › Settings and stored in `settings` with the secret parts encrypted (AES-256-GCM, key from `SETTINGS_ENCRYPTION_KEY` or else `JWT_SECRET`); the API never returns them. `CLOUDINARY_*` env vars still work as a fallback. Each upload gets a `media` row recording its provider and account (cloud name or bucket), so existing images keep working after the setting changes, and a file is never deleted with a different account's credentials (it is kept and logged instead). When a record drops an image (replaced, removed or deleted), `MediaService.release()` deletes the file only if no banner, category, listing or gallery row still uses that URL. URLs without a `media` row (seeded `/images/...`, demo Unsplash photos) are never deleted. A new image column must be added to the `inUse` check in `media.service.ts`.

**Enquiry alerts.** When an enquiry is saved, `NotificationsService` emails the NSB recipients and, if enabled, the vendor, using the SMTP settings saved in Admin › Settings (password encrypted like the storage secrets). Sending happens after the response; a failed email is logged and never loses the lead. `SITE_URL` adds an "Open in the admin panel" link. The admin panel shows the unread count in a bell and the nav, polling `unread-count` every 30 seconds while visible; opening an enquiry marks it read.

**Visibility.** Inactive categories stay in the admin panel but disappear from the public site together with their sub-categories and listings. Inactive banners are likewise admin-only.

**Structured listing forms.** `LISTING_FORMS` in `@nsb/shared` (`listing-forms.ts`) defines the add-listing form: basic details for every listing, then fields per top-level category, then fields per sub-category (keyed by slug). Field types: text, number (with unit), price (₹, optional suffix), select, multi, bool. Only Wedding and its five sub-categories have forms for now, and the admin offers only categories that have one. The API checks `details` against the listing's form (`listingDetailsSchema`; errors come back as `details.<key>`) and drops keys the form does not ask for. The admin panel no longer adds categories or sub-categories, and it locks the slug and parent of any category that has a form, because forms are found by slug. `POST /api/admin/categories` still exists; a sub-category created there without a form entry gets only its category's fields. Field keys are storage keys: never rename one, change its label instead.

**Key info.** A listing with non-empty `details` shows key info built from them (`listingDetailsToQuickInfo`: highlighted fields first, then form order; only "yes" switches). A listing with empty `details` (everything added before the forms) shows its saved free-form `quick_info` unchanged. The admin keeps that editor for such listings until someone chooses "Fill in the form instead". Saving a form listing never touches its saved `quick_info`. The first four items are the card's key info; the first is the enquiry card's headline price. `listingPlace()` shows "locality, area".

Migrations are SQL files generated into `apps/api/drizzle/` and committed. The API container applies pending migrations each time it starts.

## Web (`apps/web/src`)

```
proxy.ts                    optimistic /admin gate (cookie present?), formerly "middleware"
lib/api.ts                  server-only fetch helpers: api (public) and adminApi (forwards the cookie)
app/(site)/                 public site (M2 adds /wedding, M3 adds /wedding/[category]/[slug])
app/admin/login/            sign-in page (client form → POST /api/auth/login)
app/admin/logout/route.ts   clears the cookie (POST from the button; GET when a session expires)
app/admin/(panel)/          authenticated layout; it verifies the session via /api/auth/me
components/admin/           nav, table, page header
```

Next 16 rules apply: `params`, `searchParams` and `cookies()` are async, `fetch` is uncached by default, and `proxy.ts` replaces `middleware.ts`. Read `node_modules/next/dist/docs/` before using any Next API.

**Categories are two levels.** Top-level categories (Wedding first, plus the other verticals from the home design) fill the home grid. Wedding's sub-categories (Wedding Venues, Makeup & Beauty, …) hold listings. Opening a top-level category (e.g. `/wedding`) redirects to its first sub-category in admin order (e.g. `/wedding/wedding-venues`), whose page shows the sibling sub-categories as chips across the top. A top-level category with no sub-categories shows a "Coming soon" landing.

**Listing and detail pages:** the listing page defaults to list view (`?view=list`; use `?view=grid` for grid), with a `?q=` search box and numbered `?page=` pagination; the vendor profile uses only roadmap fields. In list view only, desktop shows static "by budget" / "by type" side cards (`lib/browse-panels.ts`); they do not filter yet and use Unsplash placeholder photos. A card shows key info as two label/value pairs plus two chips (the first four quick-info items). The detail page shows a Videos section when the listing has YouTube links: Videos (16:9) then Shorts (9:16); each loads the youtube-nocookie player only when tapped. The enquiry card follows the ezweddingz booking card: headline price (first quick-info item), event type (wedding vertical) and date, a big Enquire now button that opens name, mobile, budget and requirement, and the WhatsApp button. It sits in a sticky side card (stacked under the content on mobile, with a fixed Enquire bar). Demo vendors and three photo hero banners: `npm run db:seed:demo`; remove both before launch with `npm run db:seed:demo -- --remove` (vendors all use @example.com emails; banners are matched by their image URL; photos are hotlinked from Unsplash).

**URLs:** `/` (home), `/[vertical]` (one landing template, e.g. `/wedding`), `/[vertical]/[category]` (M3), `/[vertical]/[category]/[vendor-slug]` (M3), `/admin/…`.

**Layout:** `container-page` is up to 1536px wide (matching kalasquare.com). On phones the site follows an app layout: sticky header, swipeable `ScrollRow` card rows (arrows on desktop), a 4-column category icon grid, and `MobileTabBar` (Home, Categories, Wedding, WhatsApp) on every page except vendor pages, which keep their own Enquire bar.

**WhatsApp button:** set in Admin › Settings (stored as the `contact.whatsapp` setting) and read by the site from the public `GET /api/site-settings`. It shows on vendor pages and in the phone tab bar only while switched on; `{listing}` in the message becomes the vendor's name.

**Home page:** hero slides show the banner image only (no text or button), with rounded corners, at 200px tall on phones up to 370px on wide desktops (the side tiles match). The whole slide links to the banner's link, and a banner without an image shows its name on a teal backdrop. The slide dots fill over the 6-second autoplay interval, which pauses on hover or focus and is off with reduced motion; phones can swipe between slides. Only the hero slider (admin banners) and the category grid are dynamic. The other sections (side tiles, markets, highlights, top picks, brand stores, promo strip, deals) and the header's search, location, cart and login are static design content. Design source: `index.html` at the repo root; images live in `apps/web/public/images`.

## Environments

| | Development | Staging / production |
|---|---|---|
| Postgres | `docker compose up -d postgres`, port 5434 | `deploy/` compose service, not exposed |
| API | `npm run dev` on :4000, reads `apps/api/.env` | container, env from `deploy/.env` |
| Web | `npm run dev` on :3000, `/api` rewritten to :4000 | standalone container |
| HTTPS | none (`COOKIE_SECURE=false`) | Caddy auto-TLS |

## Phase-1 scope guard

Build only what the roadmap lists. Vendor and customer logins, OTP, CRM, WhatsApp, filters (a simple name/area search box was added on request), reviews, a "list your business" form, a blog, and category-specific layouts are all **Phase-2**. Flag them as change requests and do not build them. Each module is self-contained, so Phase-2 can add, for example, a `vendors` auth module or a CRM module without rewriting existing ones.

## Milestones

| | Deliverable | Status |
|---|---|---|
| M1 | Schema, REST APIs, admin login and panel skeleton, staging with the 5 categories | ✅ code complete; staging deploy pending a server |
| M2 | Visual style, home page with hero banner, wedding landing | ✅ code complete; awaiting design review |
| M3 | Category listing and vendor detail templates, sticky Enquire button | ✅ code complete; listing styled after WedMeGood, detail after ezweddingz (roadmap fields only) |
| M4 | Enquiry form, mobile check and spam guard, email to vendor and NSB | |
| M5 | Admin CMS forms: listings, Cloudinary uploads, categories, banner, enquiries filters | |
| M6 | Device QA, SEO basics, content entry, domain, SSL, launch | |
