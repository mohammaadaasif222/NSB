/** Name of the httpOnly cookie that carries the admin session JWT. */
export const SESSION_COOKIE = 'nsb_session';

/** Default page size for paginated list endpoints. */
export const DEFAULT_PAGE_SIZE = 24;

// ---------- Image uploads ----------

/** Formats accepted for uploads. The API checks the file's bytes, not the client's claim. */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

/** Default upload limit; the API reads UPLOAD_MAX_MB. */
export const DEFAULT_UPLOAD_MAX_MB = 5;

/** Upper bound on either side, so a tiny file cannot claim a huge canvas. */
export const IMAGE_MAX_SIDE = 8000;

/** How the SMTP connection is secured: TLS from the start (port 465), STARTTLS upgrade (587), or none. */
export const SMTP_SECURITY = ['tls', 'starttls', 'none'] as const;
export type SmtpSecurity = (typeof SMTP_SECURITY)[number];

/** A listing video is a regular YouTube video (16:9) or a YouTube Short (9:16). */
export const LISTING_VIDEO_KINDS = ['video', 'short'] as const;
export type ListingVideoKind = (typeof LISTING_VIDEO_KINDS)[number];

/** Most videos and Shorts one listing can show. */
export const MAX_LISTING_VIDEOS = 12;
/** Filter tags per listing (Admin › listing form › Tags). */
export const MAX_LISTING_TAGS = 20;

/** Choices for "Event type" on wedding enquiries. Stored as plain text, so other verticals can use their own list. */
export const WEDDING_EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Haldi & Mehendi', 'Sangeet', 'Other'] as const;

/** Live: on the site. Draft: being prepared. Hidden: taken off the site for now. Only Live listings are public. */
export const LISTING_STATUSES = ['live', 'draft', 'hidden'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

/** Where a review came from: copied from the vendor's Google profile, or given by a customer to NSB. */
export const REVIEW_SOURCES = ['google', 'customer'] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

/** Limits for a listing's service sections ("Food", "Decor", …). */
export const MAX_SERVICE_GROUPS = 8;

export const ENQUIRY_STATUSES = ['unread', 'read'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** Follow-up stage of a lead, set by the team in Admin › Leads. New leads start at "new". */
export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// ---------- Admin users and roles ----------

/** Super Admin also manages users, roles, pricing and site settings; View only cannot see lead numbers. */
export const ADMIN_ROLES = ['super', 'admin', 'analyst', 'view'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = { super: 'Super Admin', admin: 'Admin', analyst: 'Analyst', view: 'View only' };

/** What a role may do. The API enforces these; the admin panel hides what a role cannot use. */
export const ADMIN_PERMISSIONS = {
  /** Dashboard, listings and leads (read). */
  view: ['super', 'admin', 'analyst', 'view'],
  /** Lead phone numbers and email addresses, and the CSV export. */
  leadContacts: ['super', 'admin', 'analyst'],
  /** Create, edit, publish and delete listings; the home page and sponsor slots; lead follow-up. */
  edit: ['super', 'admin'],
  /** Users, roles, pricing and site settings. */
  manage: ['super'],
} as const satisfies Record<string, readonly AdminRole[]>;
export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export const canDo = (role: AdminRole, permission: AdminPermission) => (ADMIN_PERMISSIONS[permission] as readonly AdminRole[]).includes(role);

/** The permission table shown in Settings › Users and roles. */
export const ROLE_TABLE: [label: string, permission: AdminPermission][] = [
  ['View dashboard and reports', 'view'],
  ['View listings and leads', 'view'],
  ['See and export lead numbers', 'leadContacts'],
  ['Create and edit listings', 'edit'],
  ['Publish and delete listings', 'edit'],
  ['Manage the homepage and sponsor slots', 'edit'],
  ['Manage users, roles and pricing', 'manage'],
];

/** Advertising price of a wedding slot (6-month season) when Settings › Slot pricing has none for it. */
export const DEFAULT_SLOT_PRICE = 10_000;

export const IMAGE_STORAGE_PROVIDERS = ['cloudinary', 'firebase', 'local'] as const;
export type ImageStorageProvider = (typeof IMAGE_STORAGE_PROVIDERS)[number];

interface Size {
  width: number;
  height: number;
}

export interface ImageSlot {
  label: string;
  /** Shown next to the upload field. Larger images are fine; the site resizes them. */
  recommended: Size & { ratio: string };
  /** Smaller images are rejected because they would look blurry in this slot. */
  min: Size;
  /** Portrait photos are fine too: `min` then applies to the long and short sides, not width and height. */
  anyOrientation?: boolean;
  /** Storage folder. */
  folder: string;
}

/**
 * Where each uploaded image is shown, sized from the site's layout. The site crops to fill
 * each slot (object-cover), so keep important content near the centre.
 */
export const IMAGE_SLOTS = {
  /** Hero slider on tablets and desktops: up to 1000×370 on screen (wide desktops). */
  banner: {
    label: 'Banner (desktop and tablet)',
    recommended: { width: 1600, height: 600, ratio: '8:3' },
    min: { width: 640, height: 240 },
    folder: 'banners',
  },
  /** Hero slider on phones: full width × 200px. Optional; the desktop image is used without it. */
  'banner-mobile': {
    label: 'Banner (mobile)',
    recommended: { width: 960, height: 540, ratio: '16:9' },
    min: { width: 480, height: 270 },
    folder: 'banners',
  },
  /** Top-level category icon on the home grid, shown at 20–40px. */
  'category-icon': {
    label: 'Category icon',
    recommended: { width: 256, height: 256, ratio: '1:1, transparent PNG or WebP' },
    min: { width: 64, height: 64 },
    folder: 'categories',
  },
  /** Sub-category card on the vertical landing page: about 380×176. */
  category: {
    label: 'Sub-category image',
    recommended: { width: 1200, height: 550, ratio: '2.2:1' },
    min: { width: 400, height: 180 },
    folder: 'categories',
  },
  /** Listing cover and gallery: 380×214 cards and the full-width gallery. */
  listing: {
    label: 'Listing photo',
    recommended: { width: 1600, height: 900, ratio: 'any shape; wide 16:9 fills the cards best' },
    min: { width: 480, height: 320 },
    anyOrientation: true,
    folder: 'listings',
  },
  /** 2D or 3D floor plan on a real estate project page; shown whole (object-contain), never cropped. */
  'floor-plan': {
    label: 'Floor plan',
    recommended: { width: 1600, height: 1200, ratio: 'any shape; the whole plan is shown' },
    min: { width: 400, height: 300 },
    anyOrientation: true,
    folder: 'floor-plans',
  },
  /** One of the four cards beside the home hero: about 300×180 on screen. */
  'home-card': {
    label: 'Home page card',
    recommended: { width: 700, height: 460, ratio: '3:2' },
    min: { width: 350, height: 230 },
    folder: 'home',
  },
  /** Logo in the site footer, shown about 180 px wide. */
  'footer-logo': {
    label: 'Footer logo',
    recommended: { width: 560, height: 280, ratio: '2:1, transparent PNG or WebP' },
    min: { width: 180, height: 60 },
    anyOrientation: true,
    folder: 'site',
  },
  /** Sponsored card in the real estate project page sidebar: about 290×96. */
  ad: {
    label: 'Sidebar ad image',
    recommended: { width: 700, height: 240, ratio: '3:1' },
    min: { width: 300, height: 100 },
    folder: 'ads',
  },
} as const satisfies Record<string, ImageSlot>;

export type ImageSlotKey = keyof typeof IMAGE_SLOTS;

/**
 * Null when a width×height image is large enough for the slot, otherwise the reason. Shared by
 * the upload form and the API so both give the same answer.
 */
export function imageTooSmall(slotKey: ImageSlotKey, width: number, height: number): string | null {
  const slot: ImageSlot = IMAGE_SLOTS[slotKey];
  const { min } = slot;
  const fits = slot.anyOrientation
    ? Math.max(width, height) >= Math.max(min.width, min.height) && Math.min(width, height) >= Math.min(min.width, min.height)
    : width >= min.width && height >= min.height;
  if (fits) return null;
  const need = slot.anyOrientation ? `${min.width}×${min.height} px (either way round)` : `${min.width}×${min.height} px`;
  return `This image is ${width}×${height} px. ${slot.label} images must be at least ${need}.`;
}
export const IMAGE_SLOT_KEYS = Object.keys(IMAGE_SLOTS) as [ImageSlotKey, ...ImageSlotKey[]];
