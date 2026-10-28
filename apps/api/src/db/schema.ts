import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type {
  AdminRole,
  Advertiser,
  AdvertiserType,
  ImageStorageProvider,
  LeadStatus,
  ListingDetails,
  ListingStatus,
  ListingVideo,
  NearbyPlace,
  PossessionStatus,
  ProjectConfiguration,
  ProjectFaq,
  ProjectSpecifications,
  ProjectType,
  ProjectVideo,
  QuickInfoItem,
  ReviewSource,
  ServiceGroup,
} from '@nsb/shared';

const id = () => uuid('id').primaryKey().defaultRandom();
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const adminUsers = pgTable('admin_users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  /** What this admin may do (ADMIN_PERMISSIONS). Admins from before roles are Super Admins. */
  role: text('role').$type<AdminRole>().notNull().default('super'),
  /** In every session token; raising it (on a password change) signs out the other sessions. */
  sessionVersion: integer('session_version').notNull().default(0),
  /** Wrong passwords in a row, counted while they come less than LOCK_WINDOW apart. */
  failedLogins: integer('failed_logins').notNull().default(0),
  lastFailedAt: timestamp('last_failed_at', { withTimezone: true }),
  /** Sign-in refused until then, after too many wrong passwords. */
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: createdAt(),
});

export const categories = pgTable(
  'categories',
  {
    id: id(),
    /** Null for top-level categories (shown on the home page). Two levels only. */
    parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, {
      onDelete: 'restrict',
    }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    imageUrl: text('image_url'),
    /** Inactive categories (and everything under them) are hidden from the public site. */
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('categories_parent_idx').on(t.parentId)],
);

export const listings = pgTable(
  'listings',
  {
    id: id(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    area: text('area').notNull(),
    locality: text('locality'),
    address: text('address'),
    shortDescription: text('short_description').notNull(),
    about: text('about').notNull().default(''),
    services: text('services')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Admin tags such as "Luxury" or "Banquet Halls"; the browse panels on category pages filter by them. */
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    quickInfo: jsonb('quick_info')
      .$type<QuickInfoItem[]>()
      .notNull()
      .default([]),
    /** Answers to the category's structured form (LISTING_FORMS in @nsb/shared). Empty for
     *  listings that use free-form quick_info; non-empty ones show key info built from it. */
    details: jsonb('details')
      .$type<ListingDetails>()
      .notNull()
      .default({}),
    /** YouTube videos and Shorts for the listing's Videos section. */
    videos: jsonb('videos')
      .$type<ListingVideo[]>()
      .notNull()
      .default([]),
    /** Vendor's email for enquiry alerts; null when the vendor has none. Never exposed publicly. */
    email: text('email'),
    phone: text('phone'),
    /** Off: enquiries for this listing go to NSB only. Existing listings keep getting leads. */
    notifyVendor: boolean('notify_vendor').notNull().default(true),
    coverImageUrl: text('cover_image_url'),
    isFeatured: boolean('is_featured').notNull().default(false),
    /** live | draft | hidden; only live listings are public. Existing listings stay live. */
    status: text('status').$type<ListingStatus>().notNull().default('live'),
    /** Headed service sections, shown after the plain services list. */
    serviceGroups: jsonb('service_groups').$type<ServiceGroup[]>().notNull().default([]),
    /** The vendor's Google rating as typed in by the admin; not synced from Google. */
    googleRating: real('google_rating'),
    googleReviewCount: integer('google_review_count'),
    googleMapsUrl: text('google_maps_url'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('listings_category_idx').on(t.categoryId)],
);

/** Reviews the NSB team adds to a listing: copied from Google or given by customers. */
export const listingReviews = pgTable(
  'listing_reviews',
  {
    id: id(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    text: text('text').notNull().default(''),
    reviewDate: date('review_date', { mode: 'string' }),
    source: text('source').$type<ReviewSource>().notNull(),
    isVerified: boolean('is_verified').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index('listing_reviews_listing_idx').on(t.listingId)],
);

export const listingImages = pgTable(
  'listing_images',
  {
    id: id(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('listing_images_listing_idx').on(t.listingId)],
);

export const banners = pgTable(
  'banners',
  {
    id: id(),
    imageUrl: text('image_url'),
    /** Optional phone-sized image; the site falls back to image_url. */
    mobileImageUrl: text('mobile_image_url'),
    heading: text('heading').notNull(),
    subheading: text('subheading'),
    ctaLabel: text('cta_label'),
    ctaLink: text('cta_link'),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('banners_active_order_idx').on(t.isActive, t.sortOrder)],
);

/**
 * Real estate projects: one listing and one advertiser (the builder or a broker) per project.
 * Nested parts of the project page are jsonb; min_price and bedrooms are derived on save for the
 * listing page's sort and filters.
 */
export const projects = pgTable(
  'projects',
  {
    id: id(),
    type: text('type').$type<ProjectType>().notNull(),
    /** One of LISTING_AREAS. */
    area: text('area').notNull(),
    /** Sector or address, e.g. Sector 150. */
    locality: text('locality').notNull(),
    name: text('name').notNull(),
    /** From the name and area (projectSlug), so one project cannot be listed twice in an area. */
    slug: text('slug').notNull().unique(),
    builder: text('builder').notNull(),
    reraId: text('rera_id').notNull().default(''),
    possessionStatus: text('possession_status').$type<PossessionStatus>().notNull(),
    possessionDate: text('possession_date').notNull().default(''),
    launchDate: text('launch_date').notNull().default(''),
    isPremium: boolean('is_premium').notNull().default(false),
    /** Featured badge only; it does not change the listing order. */
    isFeatured: boolean('is_featured').notNull().default(false),
    /** Admin tags such as "Luxury" or "Near Metro"; the listing page's search matches them. */
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    units: integer('units'),
    landArea: text('land_area').notNull().default(''),
    towers: integer('towers'),
    about: text('about').notNull().default(''),
    highlights: text('highlights').array().notNull().default(sql`'{}'::text[]`),
    configurations: jsonb('configurations').$type<ProjectConfiguration[]>().notNull().default([]),
    amenities: text('amenities').array().notNull().default(sql`'{}'::text[]`),
    specifications: jsonb('specifications').$type<ProjectSpecifications>().notNull(),
    nearby: jsonb('nearby').$type<NearbyPlace[]>().notNull().default([]),
    advertiser: jsonb('advertiser').$type<Advertiser>().notNull(),
    /** advertiser.name and type, as columns for search and the admin's advertiser count. */
    advertiserName: text('advertiser_name').notNull(),
    advertiserType: text('advertiser_type').$type<AdvertiserType>().notNull(),
    faqs: jsonb('faqs').$type<ProjectFaq[]>().notNull().default([]),
    /** First photo is the cover. */
    photos: text('photos').array().notNull().default(sql`'{}'::text[]`),
    videoUrl: text('video_url'),
    videoChapters: text('video_chapters').notNull().default(''),
    videos: jsonb('videos').$type<ProjectVideo[]>().notNull().default([]),
    /** Given to a visitor only after they share their number. */
    brochureUrl: text('brochure_url'),
    /** The advertiser's number: private, shown to a visitor only after View Number. */
    phone: text('phone'),
    /** Lowest configuration price (rupees); null when every price is on request. */
    minPrice: bigint('min_price', { mode: 'number' }),
    /** Bedroom counts of the configurations, for the 2/3/4+ BHK chips. */
    bedrooms: integer('bedrooms').array().notNull().default(sql`'{}'::integer[]`),
    termStart: date('term_start', { mode: 'string' }).notNull(),
    termMonths: integer('term_months').notNull().default(12),
    status: text('status').$type<ListingStatus>().notNull().default('draft'),
    metaTitle: text('meta_title').notNull().default(''),
    metaDescription: text('meta_description').notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('projects_status_area_idx').on(t.status, t.area)],
);

/**
 * Images uploaded through the admin panel, keyed by the URL that records store. Tells the API
 * which provider holds each file so it can delete it once no record uses it. URLs not in this
 * table (seeded /images paths, pasted links) are never deleted.
 */
export const media = pgTable('media', {
  id: id(),
  url: text('url').notNull().unique(),
  provider: text('provider').$type<ImageStorageProvider>().notNull(),
  /** Cloudinary public_id, Firebase object name, or the path under UPLOAD_DIR. */
  storageKey: text('storage_key').notNull(),
  /** Cloudinary cloud name or Firebase bucket holding the file (null for local), so it is
   *  never deleted with another account's credentials. */
  account: text('account'),
  mimeType: text('mime_type').notNull(),
  bytes: integer('bytes').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  createdAt: createdAt(),
});

/** Admin-editable site settings, one row per key. */
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: updatedAt(),
});

/**
 * Leads. Listing and category names are copied at submission time so the lead
 * keeps its source even if the listing is later edited or deleted.
 */
export const enquiries = pgTable(
  'enquiries',
  {
    id: id(),
    listingId: uuid('listing_id').references(() => listings.id, {
      onDelete: 'set null',
    }),
    /** Real estate leads; set to null when the project is deleted (the lead keeps its name). */
    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    listingName: text('listing_name').notNull(),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    categoryName: text('category_name').notNull(),
    name: text('name').notNull(),
    mobile: text('mobile').notNull(),
    message: text('message').notNull(),
    /** Event date on vendor enquiries; null on real estate leads. */
    preferredDate: date('preferred_date', { mode: 'string' }),
    budget: text('budget'),
    /** e.g. Wedding, Engagement; optional. */
    eventType: text('event_type'),
    /** The lead's email, if they gave one. */
    email: text('email'),
    /** Real estate leads: the button used (View Number, Site visit, …). */
    source: text('source'),
    createdAt: createdAt(),
    /** First opened by an admin; null while unread (drives the unread badge). */
    readAt: timestamp('read_at', { withTimezone: true }),
    /** Follow-up stage: new, contacted, won or lost. */
    leadStatus: text('lead_status').$type<LeadStatus>().notNull().default('new'),
  },
  (t) => [
    index('enquiries_created_idx').on(t.createdAt),
    index('enquiries_unread_idx').on(t.createdAt).where(sql`${t.readAt} is null`),
    index('enquiries_category_idx').on(t.categoryId),
    index('enquiries_listing_idx').on(t.listingId),
    index('enquiries_project_idx').on(t.projectId),
  ],
);
