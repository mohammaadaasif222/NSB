import { z } from 'zod';
import {
  ADMIN_ROLES,
  ENQUIRY_STATUSES,
  LEAD_STATUSES,
  IMAGE_SLOT_KEYS,
  IMAGE_STORAGE_PROVIDERS,
  LISTING_STATUSES,
  LISTING_VIDEO_KINDS,
  MAX_LISTING_TAGS,
  MAX_LISTING_VIDEOS,
  MAX_SERVICE_GROUPS,
  REVIEW_SOURCES,
  SMTP_SECURITY,
} from './constants.js';
import { LISTING_AREAS, listingDetailsInputSchema } from './listing-forms.js';
import { youTubeId } from './youtube.js';

export const trimmed = (max: number) =>
  z.string().trim().min(1, 'This field is required').max(max, `Keep it under ${max} characters`);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

/** Indian mobile number: 10 digits starting 6-9, optional +91 / 0 prefix stripped. */
export const mobileSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'));

/** An absolute URL (e.g. Cloudinary) or a path on this site such as /images/x.png. */
export const imageUrlSchema = z.union([
  z.url(),
  z.string().regex(/^\/(?!\/)\S*$/, 'Use a full URL or a site path starting with /'),
]);

/** An image that can be cleared: null removes it, omitted leaves it unchanged. */
const optionalImage = imageUrlSchema.nullable().optional();

/** New display order: the ids of one list, first to last. */
export const orderSchema = z.object({
  ids: z.array(z.uuid()).min(1),
});
export type OrderInput = z.infer<typeof orderSchema>;

/** Empty query-string values (from a GET filter form) count as "not set". */
export const blankAsUndefined = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// ---------- Auth ----------

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** For new passwords only; existing ones keep working whatever their length. */
export const MIN_PASSWORD_LENGTH = 12;

/** Passwords people pick most often (and admin-panel guesses), compared ignoring case. */
const COMMON_PASSWORDS = new Set([
  '123456789012', 'password1234', 'password@123', 'qwertyuiop12', 'qwerty123456', 'iloveyou1234',
  'admin@123456', 'admin1234567', 'administrator', 'welcome@1234', 'welcome12345', 'letmein12345',
  'changeme1234', 'passw0rd1234', 'p@ssw0rd1234', 'india@123456', 'noida@123456', 'nsbadmin1234',
  'superadmin123', 'abcdefghijkl', '1q2w3e4r5t6y', 'zaq12wsxcde3', 'qwertyuiopas', 'asdfghjkl123',
]);

/** A new admin password: long, not a well-known one, and not one character over and over. */
export const newPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(200, 'Use at most 200 characters')
  .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), 'This password is too common. Choose another.')
  .refine((p) => new Set(p.toLowerCase()).size >= 4, 'Use a mix of different characters');

/** The signed-in admin changing their own password. `confirmPassword` is checked here so the form shows the error. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(200),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.confirmPassword === v.newPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a different password from your current one' });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** The signed-in admin's own name and email (Settings › Admin account). */
export const profileSchema = z.object({
  name: trimmed(80),
  email: z.email('Enter a valid email address').trim().toLowerCase(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** A Super Admin adds a teammate with a first password, which they can change in Settings. */
export const adminUserInputSchema = profileSchema.extend({
  role: z.enum(ADMIN_ROLES),
  password: newPasswordSchema,
});
export type AdminUserInput = z.infer<typeof adminUserInputSchema>;

export const adminUserUpdateSchema = z.object({ role: z.enum(ADMIN_ROLES) });
export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;

// ---------- Categories ----------

/**
 * Two levels: top-level categories (e.g. Wedding) appear on the home page, and their
 * sub-categories (e.g. Wedding Venues) hold listings.
 */
export const categoryInputSchema = z.object({
  name: trimmed(80),
  slug: slugSchema,
  parentId: z.uuid().nullable().optional(),
  description: optionalText(500),
  imageUrl: optionalImage,
  /** Inactive categories, their sub-categories and their listings are hidden from the site. */
  isActive: z.boolean().optional(),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const categoryUpdateSchema = categoryInputSchema.partial();
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

export const categoryQuerySchema = z.object({
  /** Slug of a top-level category to list its sub-categories; omit for top-level categories. */
  parent: slugSchema.optional(),
});
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

/** The ids of one sibling group: top-level categories, or the sub-categories of one parent. */
export const categoryOrderSchema = orderSchema;
export type CategoryOrderInput = OrderInput;

// ---------- Listings ----------

export const quickInfoItemSchema = z.object({
  label: trimmed(40),
  value: trimmed(120),
});
export type QuickInfoItem = z.infer<typeof quickInfoItemSchema>;

/** A YouTube video or Short shown in the listing's Videos section. */
export const listingVideoSchema = z.object({
  kind: z.enum(LISTING_VIDEO_KINDS),
  url: z
    .string()
    .trim()
    .max(300)
    .refine((url) => youTubeId(url) !== null, 'Paste a YouTube video or Shorts link'),
});
export type ListingVideo = z.infer<typeof listingVideoSchema>;

/** A headed list of services on the listing page, e.g. "Decor" → Floral mandap, Stage lighting. */
export const serviceGroupSchema = z.object({
  title: trimmed(60),
  items: z.array(trimmed(120)).min(1, 'Add at least one service under this heading').max(30),
});
export type ServiceGroup = z.infer<typeof serviceGroupSchema>;

/** Blank form values become null, so a cleared field is saved as "not set". */
export const blankAsNull = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === '' ? null : v), schema.nullable());

// Update schemas come from the default-free field sets: zod applies defaults even inside
// .partial(), which would reset omitted fields on every PATCH.
const listingFields = z.object({
  categoryId: z.uuid(),
  name: trimmed(120),
  slug: slugSchema,
  area: z.enum(LISTING_AREAS, { error: `Choose ${LISTING_AREAS.join(', ')}` }),
  /** Sector or neighbourhood, e.g. Sector 18; shown before the area. */
  locality: optionalText(120),
  address: optionalText(300),
  shortDescription: trimmed(240),
  about: z.string().trim().max(5000),
  services: z.array(trimmed(120)).max(30),
  /** Filter tags, e.g. "Luxury" or "Banquet Halls". Duplicates (ignoring case) are dropped. */
  tags: z
    .array(trimmed(40))
    .max(MAX_LISTING_TAGS)
    .transform((tags) => tags.filter((t, i) => tags.findIndex((u) => u.toLowerCase() === t.toLowerCase()) === i)),
  quickInfo: z.array(quickInfoItemSchema).max(12),
  /** Receives this vendor's enquiry alerts. Optional: blank means the vendor gets no email. */
  email: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), z.email().trim().toLowerCase().nullable()),
  phone: optionalText(20),
  /** Off: enquiries for this listing go to NSB only, never to the vendor. */
  notifyVendor: z.boolean(),
  /** Only Live listings appear on the site. */
  status: z.enum(LISTING_STATUSES),
  /** Headed service sections, shown after the plain services list. */
  serviceGroups: z.array(serviceGroupSchema).max(MAX_SERVICE_GROUPS),
  /** The vendor's Google rating as shown on Google Maps, typed in by the admin (e.g. 4.7). */
  googleRating: blankAsNull(z.coerce.number().min(1, 'Ratings run from 1 to 5').max(5, 'Ratings run from 1 to 5')),
  googleReviewCount: blankAsNull(z.coerce.number().int().min(0).max(10_000_000)),
  googleMapsUrl: blankAsNull(z.url('Paste the full Google Maps link').max(500)),
  coverImageUrl: optionalImage,
  gallery: z.array(imageUrlSchema).max(30),
  videos: z.array(listingVideoSchema).max(MAX_LISTING_VIDEOS),
  /**
   * Answers to the category's structured form (see LISTING_FORMS), checked by the API against
   * the listing's category. Omit to keep a listing on its free-form quick info.
   */
  details: listingDetailsInputSchema,
  isFeatured: z.boolean(),
});

export const listingInputSchema = listingFields.extend({
  details: listingFields.shape.details.optional(),
  about: listingFields.shape.about.default(''),
  services: listingFields.shape.services.default([]),
  tags: listingFields.shape.tags.default([]),
  quickInfo: listingFields.shape.quickInfo.default([]),
  gallery: listingFields.shape.gallery.default([]),
  videos: listingFields.shape.videos.default([]),
  email: listingFields.shape.email.default(null),
  notifyVendor: listingFields.shape.notifyVendor.default(true),
  status: listingFields.shape.status.default('live'),
  serviceGroups: listingFields.shape.serviceGroups.default([]),
  googleRating: listingFields.shape.googleRating.default(null),
  googleReviewCount: listingFields.shape.googleReviewCount.default(null),
  googleMapsUrl: listingFields.shape.googleMapsUrl.default(null),
  isFeatured: listingFields.shape.isFeatured.default(false),
});
export type ListingInput = z.infer<typeof listingInputSchema>;

export const listingUpdateSchema = listingFields.partial();
export type ListingUpdate = z.infer<typeof listingUpdateSchema>;

/**
 * The site's location filter: one of LISTING_AREAS, optionally narrowed to a locality such as
 * "Sector 18". Localities are free text on listings, so they match case-insensitively.
 */
export const locationFilterSchema = z.object({
  area: blankAsUndefined(z.enum(LISTING_AREAS)),
  locality: blankAsUndefined(z.string().trim().min(1).max(120)),
});
export type LocationFilter = z.infer<typeof locationFilterSchema>;

export const listingQuerySchema = paginationSchema.extend({
  category: slugSchema.optional(),
  /** Matches the listing name, area, locality or short description. */
  q: blankAsUndefined(z.string().trim().min(1).max(100)),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  ...locationFilterSchema.shape,
  /** One admin tag, matched ignoring case (the browse panels' "Luxury", "Hotels"…). */
  tag: blankAsUndefined(z.string().trim().min(1).max(40)),
});
export type ListingQuery = z.infer<typeof listingQuerySchema>;

/** Live listings per category in a location: top-level categories, or one parent's sub-categories. */
export const listingCountsQuerySchema = locationFilterSchema.extend({
  parent: slugSchema.optional(),
});
export type ListingCountsQuery = z.infer<typeof listingCountsQuerySchema>;

export const adminListingQuerySchema = listingQuerySchema.extend({
  /** A category id; a top-level category also matches the listings of its sub-categories. */
  categoryId: z.uuid().optional(),
  /** Added on or after / on or before these dates (India time). */
  from: blankAsUndefined(z.iso.date()),
  to: blankAsUndefined(z.iso.date()),
  status: blankAsUndefined(z.enum(LISTING_STATUSES)),
  /** Newest first (default), name A–Z, or most leads. */
  sort: blankAsUndefined(z.enum(['new', 'az', 'lead'])),
});
export type AdminListingQuery = z.infer<typeof adminListingQuerySchema>;

// ---------- Reviews ----------

const reviewFields = z.object({
  authorName: trimmed(80),
  rating: z.coerce.number().int().min(1, 'Pick 1 to 5 stars').max(5, 'Pick 1 to 5 stars'),
  text: z.string().trim().max(2000),
  /** When the review was written (from Google, or when the customer gave it). */
  reviewDate: blankAsNull(z.iso.date()),
  source: z.enum(REVIEW_SOURCES),
  /** Shows a "Verified" badge: NSB has checked the review is real. */
  isVerified: z.boolean(),
});

export const reviewInputSchema = reviewFields.extend({
  text: reviewFields.shape.text.default(''),
  reviewDate: reviewFields.shape.reviewDate.default(null),
  isVerified: reviewFields.shape.isVerified.default(true),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const reviewUpdateSchema = reviewFields.partial();
export type ReviewUpdate = z.infer<typeof reviewUpdateSchema>;

// ---------- Banners ----------

const bannerFields = z.object({
  /** Optional: without an image the banner shows on the brand colour. */
  imageUrl: optionalImage,
  /** Optional art-directed image for phones; falls back to imageUrl. */
  mobileImageUrl: optionalImage,
  heading: trimmed(120),
  subheading: optionalText(160),
  ctaLabel: optionalText(40),
  ctaLink: optionalText(300),
  isActive: z.boolean(),
  /** Omit to add the banner at the end. */
  sortOrder: z.number().int().min(0).optional(),
});

export const bannerInputSchema = bannerFields.extend({ isActive: bannerFields.shape.isActive.default(true) });
export type BannerInput = z.infer<typeof bannerInputSchema>;

export const bannerUpdateSchema = bannerFields.partial();
export type BannerUpdate = z.infer<typeof bannerUpdateSchema>;

// ---------- Uploads and settings ----------

export const uploadQuerySchema = z.object({
  /** Where the image will be shown; sets the size checks and storage folder. */
  slot: z.enum(IMAGE_SLOT_KEYS),
});
export type UploadQuery = z.infer<typeof uploadQuerySchema>;

/** Uploads a form no longer needs (replaced or cancelled before saving). Files still in use are kept. */
export const uploadDiscardSchema = z.object({
  urls: z.array(imageUrlSchema).min(1).max(50),
});
export type UploadDiscardInput = z.infer<typeof uploadDiscardSchema>;

const storageFolderSchema = z
  .string()
  .trim()
  .max(100)
  .regex(/^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/i, 'Use letters, numbers, hyphens and slashes, e.g. nsb');

/** Cloudinary console › Settings › API Keys. */
export const cloudinaryCredentialsSchema = z.object({
  cloudName: z.string().trim().regex(/^[a-z0-9_-]{1,64}$/i, 'Copy the cloud name from your Cloudinary dashboard'),
  apiKey: z.string().trim().regex(/^\d{6,32}$/, 'The API key is a number'),
  /** Omit to keep the saved secret. */
  apiSecret: z.string().trim().min(10, 'Paste the full API secret').max(128).optional(),
  folder: storageFolderSchema.default('nsb'),
});

/** Fields used from a Google service account key file. */
export const firebaseServiceAccountSchema = z.object({
  type: z.literal('service_account', { error: 'This is not a service account key file' }),
  project_id: z.string().min(1),
  client_email: z.email(),
  private_key: z.string().includes('PRIVATE KEY', { error: 'The key file has no private key' }),
});
export type FirebaseServiceAccount = z.infer<typeof firebaseServiceAccountSchema>;

/** Firebase console › Project settings › Service accounts › Generate new private key. */
export const firebaseCredentialsSchema = z.object({
  bucket: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/, 'Copy the bucket from Firebase › Storage, e.g. your-project.firebasestorage.app'),
  /** The whole JSON key file. Omit to keep the saved key. */
  serviceAccount: z
    .string()
    .trim()
    .max(20_000)
    .transform((text, ctx) => {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Paste the whole JSON key file' });
        return z.NEVER;
      }
    })
    .pipe(firebaseServiceAccountSchema)
    .optional(),
  folder: storageFolderSchema.default('nsb'),
});

/** Outgoing mail for enquiry alerts. */
export const emailSettingsSchema = z.object({
  /** Off: enquiries are still saved and shown in the admin panel, just not emailed. */
  enabled: z.boolean(),
  host: z
    .string()
    .trim()
    .min(1, 'Enter the SMTP server')
    .max(253)
    .regex(/^[a-z0-9.-]+$/i, 'Enter a host name such as smtp.zoho.in'),
  port: z.coerce.number().int().min(1).max(65535),
  security: z.enum(SMTP_SECURITY),
  /** Leave empty for servers that need no login. */
  username: z.string().trim().max(200).default(''),
  /** Omit to keep the saved password. */
  password: z.string().max(500).optional(),
  fromEmail: z.email('Enter the address emails are sent from').trim(),
  fromName: z.string().trim().max(80).default('Noida Super Bazaar'),
  /** The NSB inbox(es) that get every enquiry. */
  adminRecipients: z.array(z.email('Enter valid email addresses').trim().toLowerCase()).min(1, 'Add at least one recipient').max(10),
  /** Also email the vendor whose listing received the enquiry. */
  notifyVendor: z.boolean(),
});
export type EmailSettingsInput = z.input<typeof emailSettingsSchema>;

export const emailTestSchema = z.object({
  /** Defaults to the signed-in admin's address. */
  to: z.email().trim().optional(),
});
export type EmailTestInput = z.infer<typeof emailTestSchema>;

/** Message the WhatsApp button pre-fills; {listing} becomes the vendor's name. */
export const DEFAULT_WHATSAPP_MESSAGE = 'Hi, I found {listing} on Noida Super Bazaar and would like to know more.';

/** "Chat on WhatsApp" button on listing pages, to the NSB number. */
export const whatsappSettingsSchema = z.object({
  enabled: z.boolean(),
  number: mobileSchema,
  message: z.string().trim().max(300).default(DEFAULT_WHATSAPP_MESSAGE),
});
export type WhatsappSettingsInput = z.input<typeof whatsappSettingsSchema>;

/** The "by budget" / "by type" side cards beside the category listing page. */
export const listingSidebarSchema = z.object({
  enabled: z.boolean(),
  budget: z.boolean(),
  type: z.boolean(),
});
export type ListingSidebarSettings = z.infer<typeof listingSidebarSchema>;

/** A link on the site (/schools) or a full https:// address; blank for none. */
const siteOrWebLink = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/.test(v), 'Use a site path such as /schools or a full https:// link');

/** Sponsored card in the real estate project page sidebar, below the callback box. Sponsors only, never another project. */
export const projectSideAdSchema = z.object({
  enabled: z.boolean(),
  title: trimmed(80),
  text: z.string().trim().max(240),
  buttonLabel: z.string().trim().max(30),
  link: siteOrWebLink,
  imageUrl: imageUrlSchema.nullable(),
});
export type ProjectSideAd = z.infer<typeof projectSideAdSchema>;

// ---------- Home page: the four cards beside the hero ----------

/** Card colours from the demo (used when the card has no image of its own). */
export const HOME_CARD_COLORS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;
export const HOME_CARD_COLOR_LABELS: Record<(typeof HOME_CARD_COLORS)[number], string> = {
  g1: 'Indigo',
  g2: 'Navy',
  g3: 'Lavender',
  g4: 'Slate',
  g5: 'Soft red',
  g6: 'Brand red',
};
/** Icons a card can show; the site draws them. */
export const HOME_CARD_ICONS = [
  'venue', 'makeup', 'camera', 'catering', 'wedding', 'interior', 'brand-store', 'school', 'real-estate', 'loan', 'premium', 'new-launch', 'services', 'hotel',
] as const;
export const HOME_CARD_ICON_LABELS: Record<(typeof HOME_CARD_ICONS)[number], string> = {
  venue: 'Venue', makeup: 'Makeup', camera: 'Camera', catering: 'Catering', wedding: 'Wedding', interior: 'Interior', 'brand-store': 'Brand store',
  school: 'School', 'real-estate': 'Real estate', loan: 'Loan', premium: 'Premium star', 'new-launch': 'New launch', services: 'Services', hotel: 'Hotel',
};
/** Tag colours, e.g. a red "New" or a gold "Top". */
export const HOME_CARD_TAG_TONES = ['red', 'blue', 'gold', 'green', 'dark'] as const;
export const HOME_CARD_TAG_SUGGESTIONS = ['New', 'Top', 'Trending', 'Offer', 'Hot', 'Featured'] as const;
export const HOME_CARD_COUNT = 4;
export const HOME_CARD_MAX_TAGS = 3;

export const homeCardTagSchema = z.object({
  label: trimmed(16),
  tone: z.enum(HOME_CARD_TAG_TONES),
});
export type HomeCardTag = z.infer<typeof homeCardTagSchema>;

export const homeCardSchema = z.object({
  title: trimmed(28),
  link: siteOrWebLink,
  color: z.enum(HOME_CARD_COLORS),
  icon: z.enum(HOME_CARD_ICONS),
  /** Own image; without one the card shows its colour and icon. */
  imageUrl: imageUrlSchema.nullable(),
  /** With an image: also draw the icon on it (the title always shows). */
  showIcon: z.boolean(),
  /** Shown on the card, e.g. "New" or "Top". */
  tags: z.array(homeCardTagSchema).max(HOME_CARD_MAX_TAGS, `Up to ${HOME_CARD_MAX_TAGS} tags per card`),
});
export type HomeCard = z.infer<typeof homeCardSchema>;

/** In display order: first is top left, then top right, bottom left, bottom right. */
export const homeCardsSchema = z.array(homeCardSchema).length(HOME_CARD_COUNT, `Keep exactly ${HOME_CARD_COUNT} cards`);

/** The cards the home page shows until an admin saves their own (the design's four). */
export const DEFAULT_HOME_CARDS: HomeCard[] = [
  { title: 'Wedding venues', link: '/wedding/wedding-venues', color: 'g1', icon: 'venue', imageUrl: '/images/nsb-home/tile-venue.jpg', showIcon: true, tags: [] },
  { title: 'Makeup & beauty', link: '/wedding/makeup-beauty', color: 'g5', icon: 'makeup', imageUrl: '/images/nsb-home/tile-makeup.jpg', showIcon: true, tags: [] },
  { title: 'Photography & films', link: '/wedding/photography-films', color: 'g2', icon: 'camera', imageUrl: '/images/nsb-home/tile-photo.jpg', showIcon: true, tags: [] },
  { title: 'Catering', link: '/wedding', color: 'g3', icon: 'catering', imageUrl: '/images/nsb-home/tile-catering.jpg', showIcon: true, tags: [] },
];

// ---------- Footer (every page) ----------

/** Social networks the footer has icons for, in the order it shows them. */
export const FOOTER_SOCIALS = ['facebook', 'instagram', 'linkedin', 'x', 'youtube'] as const;
export type FooterSocial = (typeof FOOTER_SOCIALS)[number];
export const FOOTER_SOCIAL_LABELS: Record<FooterSocial, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', youtube: 'YouTube' };
export const FOOTER_MAX_LINKS = 10;

/** A footer link: a site path, a full https:// address, mailto: or tel:; blank shows the text without a link. */
const footerHref = z
  .string()
  .trim()
  .max(300)
  .refine(
    (v) => v === '' || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/.test(v) || /^(mailto|tel):\S+$/.test(v),
    'Use a site path such as /about, a full https:// link, mailto: or tel:',
  );

export const footerLinkSchema = z.object({
  label: trimmed(40),
  link: footerHref,
  /** Off: kept in the admin but not shown on the site. */
  visible: z.boolean().default(true),
});
export type FooterLink = z.infer<typeof footerLinkSchema>;

const footerLinks = z.array(footerLinkSchema).max(FOOTER_MAX_LINKS, `Up to ${FOOTER_MAX_LINKS} links`);
/** One network's page. Footers saved before the show/hide switch stored just the URL. */
const footerSocialSchema = z.preprocess(
  (v) => (typeof v === 'string' ? { url: v, visible: true } : v),
  z.object({
    url: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'Paste the full https:// link to the page'),
    visible: z.boolean().default(true),
  }),
);

/** The site footer (Admin › Home page › Footer). Categories are listed by the site itself. */
export const footerSettingsSchema = z.object({
  /** Own logo; null shows the NSB logo. */
  logoUrl: imageUrlSchema.nullable(),
  /** Show/hide switches; footers saved before them show everything. */
  showLogo: z.boolean().default(true),
  about: z.string().trim().max(300),
  showAbout: z.boolean().default(true),
  /** Shown with a call link; blank hides it. */
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === '' || /^\+?[\d\s-]{8,}$/.test(v), 'Enter a phone number, e.g. +91 98115 90088'),
  showPhone: z.boolean().default(true),
  /** The "Trusted by local businesses" badge with stars. */
  showBadge: z.boolean().default(true),
  quickLinks: footerLinks,
  /** The small links after the copyright line, e.g. Terms and Privacy. */
  bottomLinks: footerLinks,
  /** Page per network; blank or switched off hides its icon. */
  socials: z.object(Object.fromEntries(FOOTER_SOCIALS.map((s) => [s, footerSocialSchema])) as Record<FooterSocial, typeof footerSocialSchema>),
});
export type FooterSettings = z.infer<typeof footerSettingsSchema>;
export type FooterSocialPage = FooterSettings['socials'][FooterSocial];

/** The footer until an admin saves their own (the design's). */
export const DEFAULT_FOOTER: FooterSettings = {
  logoUrl: null,
  showLogo: true,
  showAbout: true,
  showPhone: true,
  showBadge: true,
  about: 'Your trusted hyperlocal discovery platform for Noida. Connecting you with verified local businesses and services.',
  phone: '+91 98115 90088',
  quickLinks: ['About us', 'How it works', 'Partner with us', 'Become NSB Verified', 'Contact us'].map((label) => ({ label, link: '', visible: true })),
  bottomLinks: [
    { label: 'Terms', link: '', visible: true },
    { label: 'Privacy', link: '', visible: true },
  ],
  socials: {
    facebook: { url: 'https://www.facebook.com/noidasuperbazaar', visible: true },
    instagram: { url: 'https://www.instagram.com/noidasuperbazaar', visible: true },
    linkedin: { url: 'https://www.linkedin.com/company/noidasuperbazaar', visible: true },
    x: { url: 'https://x.com/noidasuperbazaar', visible: true },
    youtube: { url: 'https://www.youtube.com/@noidasuperbazaar', visible: true },
  },
};

const price = z.coerce.number().int('Use whole rupees').min(0).max(100_000_000);

/** Advertising prices: per wedding sub-category (6-month slot, by slug) and the real estate year. */
export const pricingSchema = z.object({
  categories: z.record(slugSchema, price),
  realEstate: price,
});
export type Pricing = z.infer<typeof pricingSchema>;

export const settingsUpdateSchema = z.object({
  /** Where new uploads go. Existing images keep working from wherever they were stored. */
  imageStorage: z.enum(IMAGE_STORAGE_PROVIDERS).optional(),
  /** Credentials saved in the admin panel; null removes them. */
  cloudinary: cloudinaryCredentialsSchema.nullable().optional(),
  firebase: firebaseCredentialsSchema.nullable().optional(),
  /** SMTP settings; null removes them. */
  email: emailSettingsSchema.nullable().optional(),
  /** WhatsApp button; null removes it. */
  whatsapp: whatsappSettingsSchema.nullable().optional(),
  /** Which side cards the category listing page shows (list view, desktop). */
  listingSidebar: listingSidebarSchema.optional(),
  /** Real estate project page sidebar ad; null removes it. */
  projectSideAd: projectSideAdSchema.nullable().optional(),
  /** Slot and plan prices (Settings › Slot pricing). */
  pricing: pricingSchema.optional(),
  /** The four cards beside the home hero (Admin › Home page). */
  homeCards: homeCardsSchema.optional(),
  /** The site footer (Admin › Home page). */
  footer: footerSettingsSchema.optional(),
});
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
/** What the browser sends (the Firebase key file as text). */
export type SettingsUpdateInput = z.input<typeof settingsUpdateSchema>;

export const storageTestSchema = z.object({
  provider: z.enum(IMAGE_STORAGE_PROVIDERS),
});
export type StorageTestInput = z.infer<typeof storageTestSchema>;

// ---------- Enquiries ----------

export const enquiryInputSchema = z.object({
  listingId: z.uuid(),
  name: trimmed(80),
  mobile: mobileSchema,
  message: trimmed(1000),
  preferredDate: z.iso.date({ error: 'Pick a date' }),
  budget: optionalText(60),
  /** e.g. Wedding, Engagement. Optional. */
  eventType: optionalText(60),
  /** Optional, so the lead can also be reached by email. */
  email: blankAsUndefined(z.email('Enter a valid email address').trim().toLowerCase().max(200)),
});
export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

export const enquiryQuerySchema = paginationSchema.extend({
  /** A top-level category also matches enquiries for its sub-categories. */
  categoryId: blankAsUndefined(z.uuid()),
  listingId: blankAsUndefined(z.uuid()),
  /** Leads for one real estate project. */
  projectId: blankAsUndefined(z.uuid()),
  /** Real estate leads (they carry a source) or wedding enquiries. */
  section: blankAsUndefined(z.enum(['real-estate', 'wedding'])),
  leadStatus: blankAsUndefined(z.enum(LEAD_STATUSES)),
  /** The real estate button the lead came from, e.g. View Number. */
  source: blankAsUndefined(z.string().trim().min(1).max(40)),
  /** Real estate leads for projects of one type. */
  projectType: blankAsUndefined(z.string().trim().min(1).max(40)),
  status: blankAsUndefined(z.enum(ENQUIRY_STATUSES)),
  /** Received on or after / on or before these dates (India time). */
  from: blankAsUndefined(z.iso.date()),
  to: blankAsUndefined(z.iso.date()),
  /** Matches the lead's name or mobile, or the listing name. */
  q: blankAsUndefined(z.string().trim().min(1).max(100)),
});
export type EnquiryQuery = z.infer<typeof enquiryQuerySchema>;

/** Mark read or unread, and/or move the lead to another follow-up stage. */
export const enquiryUpdateSchema = z
  .object({
    read: z.boolean().optional(),
    leadStatus: z.enum(LEAD_STATUSES).optional(),
  })
  .refine((v) => v.read !== undefined || v.leadStatus !== undefined, { message: 'Nothing to update' });
export type EnquiryUpdate = z.infer<typeof enquiryUpdateSchema>;

// ---------- Dashboard ----------

/** The dashboard's lead range: 7 or 30 days by day, 90 days by week (as in the demo). */
export const DASHBOARD_RANGES = [7, 30, 90] as const;
export const dashboardQuerySchema = z.object({
  days: z.coerce.number().pipe(z.union([z.literal(7), z.literal(30), z.literal(90)])).default(7),
});
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
