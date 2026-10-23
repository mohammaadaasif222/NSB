import type { ImageStorageProvider, ListingStatus, ReviewSource, SmtpSecurity } from './constants.js';
import type { ListingDetails } from './listing-forms.js';
import type { ListingSidebarSettings, ListingVideo, ProjectSideAd, QuickInfoItem, ServiceGroup } from './schemas.js';

/** API response shapes shared by the API (producer) and web (consumer). Dates are ISO strings. */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** One area on the location filter, with the localities that have live listings (most listings first). */
export interface LocationOption {
  area: string;
  /** Live listings in the whole area, with or without a locality. */
  count: number;
  localities: { name: string; count: number }[];
}

/** Live listings per category slug for a location (see listingCountsQuerySchema). */
export type ListingCounts = Record<string, number>;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface Category {
  id: string;
  /** Null for a top-level category. */
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

/** Admin view: every category, active or not, with the number of listings filed directly under it. */
export interface AdminCategory extends Category {
  listingCount: number;
}

export type CategoryRef = Pick<Category, 'id' | 'name' | 'slug'>;

/** A category page: its parent (for sub-categories) and its sub-categories (for top-level ones). */
export interface CategoryDetail extends Category {
  parent: CategoryRef | null;
  children: Category[];
}

/** Vendor card on the category listing page. */
export interface ListingSummary {
  id: string;
  name: string;
  slug: string;
  area: string;
  /** e.g. Sector 18; show it with the area via listingPlace(). */
  locality: string | null;
  shortDescription: string;
  coverImageUrl: string | null;
  /** URLs of the first few gallery images, shown as thumbnails on the list-view card. */
  galleryPreview: string[];
  /** First four quick-info items, shown as "key info" on the card. Listings saved with a
   *  structured form get these from their details. */
  keyInfo: QuickInfoItem[];
  /** What the vendor offers; the card shows a few as chips and the rest under "+N more". */
  services: string[];
  isFeatured: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  /** When the listing was added (ISO timestamp). */
  createdAt: string;
  /** Always "live" on public pages; the admin list shows every status. */
  status: ListingStatus;
  /** Real rating only: the Google rating the admin entered, else the average of its reviews; null when neither. */
  rating: ListingRating | null;
}

export interface ListingRating {
  /** 1–5, one decimal. */
  average: number;
  count: number;
  source: 'google' | 'reviews';
}

export interface ListingReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  reviewDate: string | null;
  source: ReviewSource;
  isVerified: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  sortOrder: number;
}

/** Public vendor profile. Vendor email/phone are deliberately not exposed. */
export interface ListingDetail extends ListingSummary {
  address: string | null;
  about: string;
  quickInfo: QuickInfoItem[];
  gallery: GalleryImage[];
  /** YouTube videos and Shorts, in the order the admin set. */
  videos: ListingVideo[];
  /** Headed service sections, after the plain services list. */
  serviceGroups: ServiceGroup[];
  /** Admin filter tags, e.g. "Luxury" or "Banquet Halls". */
  tags: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUrl: string | null;
  /** Reviews added in the admin panel, newest first. */
  reviews: ListingReview[];
}

/** Admin view of a listing, including the private contact fields. */
export interface AdminListing extends ListingDetail {
  /** Structured form answers; empty for listings that still use free-form quick info. */
  details: ListingDetails;
  /** The quick info as saved (ListingDetail.quickInfo may be derived from details). */
  savedQuickInfo: QuickInfoItem[];
  /** Null when the vendor has no email for leads. */
  email: string | null;
  phone: string | null;
  /** Off: this vendor's enquiries go to NSB only. */
  notifyVendor: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  heading: string;
  subheading: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Enquiry {
  id: string;
  name: string;
  mobile: string;
  message: string;
  /** The event date on vendor enquiries; null on real estate leads. */
  preferredDate: string | null;
  budget: string | null;
  eventType: string | null;
  email: string | null;
  listingId: string | null;
  /** Set on real estate leads (null once the project is deleted). */
  projectId: string | null;
  /** Vendor listing or project name, kept when it is deleted. */
  listingName: string;
  /** Real estate leads: the button used, e.g. View Number or Site visit. */
  source: string | null;
  categoryId: string | null;
  categoryName: string;
  createdAt: string;
  /** When an admin first opened it; null while unread. */
  readAt: string | null;
}

export interface UnreadCount {
  unread: number;
}

/** Result of POST /api/admin/uploads; save `url` on the record that uses the image. */
export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  provider: ImageStorageProvider;
}

export interface StorageProviderStatus {
  /** Whether new uploads can go to this provider. */
  configured: boolean;
  /** Where the credentials come from: saved in the admin panel, or the server's environment. */
  source: 'admin' | 'env' | null;
  /** Why saved credentials cannot be used, e.g. they were encrypted with a different key. */
  problem?: string;
  folder: string;
}

/** Settings as the admin panel sees them. Secrets are never included. */
export interface AdminSettings {
  imageStorage: ImageStorageProvider;
  maxUploadBytes: number;
  cloudinary: StorageProviderStatus & { cloudName: string | null; apiKey: string | null };
  firebase: StorageProviderStatus & { bucket: string | null; projectId: string | null; clientEmail: string | null };
  email: EmailSettings;
  /** Null until an admin saves a WhatsApp number. */
  whatsapp: WhatsappSettings | null;
  listingSidebar: ListingSidebarSettings;
  /** Null until an admin saves the project page sidebar ad. */
  projectSideAd: ProjectSideAd | null;
}

export interface WhatsappSettings {
  enabled: boolean;
  /** 10-digit Indian mobile number, without +91. */
  number: string;
  /** Pre-filled chat text; {listing} becomes the vendor's name. */
  message: string;
}

/** Public site settings for the website (GET /api/site-settings). */
export interface SiteSettings {
  /** Present only while the WhatsApp button is switched on. */
  whatsapp: Pick<WhatsappSettings, 'number' | 'message'> | null;
  listingSidebar: ListingSidebarSettings;
  /** Present only while the ad is switched on. */
  projectSideAd: ProjectSideAd | null;
}

/** SMTP settings without the password. */
export interface EmailSettings {
  /** Saved and switched on, so enquiry alerts are sent. */
  active: boolean;
  enabled: boolean;
  host: string | null;
  port: number;
  security: SmtpSecurity;
  username: string;
  hasPassword: boolean;
  fromEmail: string | null;
  fromName: string;
  adminRecipients: string[];
  notifyVendor: boolean;
  problem?: string;
}

/** Result of a storage connection test or a test email. */
export interface StorageTestResult {
  ok: boolean;
  message: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  issues?: { path: string; message: string }[];
}
