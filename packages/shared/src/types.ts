import type { AdminRole, ImageStorageProvider, LeadStatus, ListingStatus, ReviewSource, SmtpSecurity } from './constants.js';
import type { ListingDetails } from './listing-forms.js';
import type { ProjectType } from './projects.js';
import type { EliteBanners, FooterSettings, HomeCard, ListingSidebarSettings, ListingVideo, Pricing, ProjectSideAd, QuickInfoItem, RealEstateAd, ServiceGroup } from './schemas.js';

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
  role: AdminRole;
}

/** A row in Settings › Users and roles. */
export interface AdminUserRow extends AdminUser {
  createdAt: string;
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
  /** Place 1–10 at the top of its sub-category; null for every other listing. */
  topRank: number | null;
  /** Shows the blue premium card. Only a listing with a top place can be Elite. */
  isElite: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  /** When the listing was added (ISO timestamp). */
  createdAt: string;
  /** Always "live" on public pages; the admin list shows every status. */
  status: ListingStatus;
  /** Real rating only: the Google rating the admin entered, else the average of its reviews; null when neither. */
  rating: ListingRating | null;
  /** Leads received; admin lists only. */
  leadCount?: number;
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
  /** Real estate leads: the project's type, while the project exists. */
  projectType: ProjectType | null;
  categoryId: string | null;
  categoryName: string;
  createdAt: string;
  /** When an admin first opened it; null while unread. */
  readAt: string | null;
  /** Follow-up stage set in Admin › Leads. */
  leadStatus: LeadStatus;
}

export interface UnreadCount {
  unread: number;
}

/** Per Leads tab: leads still at "new", and leads nobody has opened. */
export interface LeadSectionCounts {
  realEstate: { new: number; unread: number };
  wedding: { new: number; unread: number };
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
  /** Null until an admin saves the real estate ad banner (the demo banner shows until then). */
  realEstateAd: RealEstateAd | null;
  /** Slot and plan prices; sub-categories without a saved price use DEFAULT_SLOT_PRICE. */
  pricing: Pricing;
  /** Elite banners saved so far, by sub-category slug. */
  eliteBanners: EliteBanners;
  /** The four home page cards (DEFAULT_HOME_CARDS until saved). */
  homeCards: HomeCard[];
  /** The site footer (DEFAULT_FOOTER until saved). */
  footer: FooterSettings;
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
  /** Elite banners saved so far, by sub-category slug; the others use defaultEliteBanner. */
  eliteBanners: EliteBanners;
  /** The saved ad banner, switched on or off; null until saved, when the demo banner shows. */
  realEstateAd: RealEstateAd | null;
  /** The four cards beside the home hero, in order. */
  homeCards: HomeCard[];
  footer: FooterSettings;
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

/** Admin dashboard (GET /api/admin/dashboard?days=7|30|90). Real estate leads are the ones with a source. */
export interface DashboardStats {
  days: number;
  /** The real estate plan price from Settings › Slot pricing. */
  realEstatePlanPrice: number;
  listings: { total: number; live: number; draft: number; hidden: number; featured: number };
  projects: { total: number; live: number; draft: number; hidden: number; activeTerms: number };
  leads: {
    /** In the chosen range. */
    inRange: number;
    realEstate: number;
    wedding: number;
    /** All time. */
    total: number;
    unread: number;
    /** Received today (India time). */
    today: number;
  };
  /** Oldest first: one bar per day (7, 30 days) or per week (90 days); `end` is the bar's last day. */
  series: { end: string; realEstate: number; wedding: number }[];
  /** Listings and projects with the most leads in the range. */
  topSources: { name: string; kind: 'listing' | 'project'; id: string | null; count: number }[];
  /** Leads in the range per category (sub-category for vendors, Real Estate for projects). */
  byCategory: { name: string; count: number }[];
  /** Live vendor listings and projects per area. */
  byArea: { area: string; listings: number; projects: number }[];
  /** Live projects whose term ends within 30 days or has ended, soonest first. */
  expiring: { id: string; name: string; advertiserName: string; termEnd: string; daysLeft: number }[];
}
