import { z } from 'zod';
import { LISTING_STATUSES, type ListingStatus } from './constants.js';
import { LISTING_AREAS } from './listing-forms.js';
import { blankAsNull, blankAsUndefined, imageUrlSchema, mobileSchema, paginationSchema, trimmed } from './schemas.js';
import { youTubeId } from './youtube.js';

/**
 * Real estate: builder projects (apartments, villas, plots), one listing and one advertiser per
 * project. The admin form's eight steps are the sections of the project page (NSB Live Demo).
 */

// ---------- Constants ----------

export const PROJECT_TYPES = ['apartments', 'villas', 'plots'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = { apartments: 'Apartments', villas: 'Villas', plots: 'Plots' };

export const POSSESSION_STATUSES = ['Under Construction', 'Ready to Move'] as const;
export type PossessionStatus = (typeof POSSESSION_STATUSES)[number];

/** Who advertises the project on NSB: the builder itself, or one broker (a broker can list many projects). */
export const ADVERTISER_TYPES = ['builder', 'broker'] as const;
export type AdvertiserType = (typeof ADVERTISER_TYPES)[number];

/** Amenities offered as tick boxes; anything else is typed in as "Other amenities". */
export const PROJECT_AMENITIES = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Kids Play Area', 'Jogging Track', '24x7 Security',
  'CCTV Surveillance', 'Power Backup', 'Landscaped Gardens', 'Indoor Games', 'Yoga Deck', 'Mini Theatre',
  'Cricket Pitch', 'Basketball Court', 'Skating Rink', 'Pet Park', 'Party Lawn', 'Senior Citizen Zone',
  'EV Charging', 'Rainwater Harvesting', 'Library', 'Co-working Space', 'Multipurpose Hall', 'Visitor Parking',
] as const;

export const NEARBY_PLACE_TYPES = ['School', 'Hospital', 'Mall', 'Metro station', 'Market', 'Park', 'Airport'] as const;

/** Suggestions for a configuration's name; any text is accepted. */
export const CONFIGURATION_SUGGESTIONS = ['1 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3 BHK+', '4 BHK', 'Villa', 'Plot'] as const;

export const PROJECT_LIMITS = { photos: 10, configurations: 6, videos: 4, nearby: 6, faqs: 6, highlights: 8 } as const;

/** Term lengths an advertiser can buy; real estate is sold by the year. */
export const PROJECT_TERM_MONTHS = [12, 6] as const;
/** Real estate plan: one project, one advertiser, one year. Shown in the admin form. */
export const PROJECT_PLAN_PRICE = 25_000;

/** "Planning to buy in?" on the View Number form. */
export const BUY_WITHIN = ['3 months', '6 months', '6+ months'] as const;

/** The button a project lead came from; "Enquiry" is the form on the project page. */
export const PROJECT_LEAD_SOURCES = ['View Number', 'Site visit', 'Callback', 'Price sheet', 'Brochure', 'Enquiry'] as const;
export type ProjectLeadSource = (typeof PROJECT_LEAD_SOURCES)[number];

/** Lead name for "Get a callback" from the NSB team, which is about no project in particular. */
export const GENERAL_PROPERTY_LEAD = 'Real estate: help choosing';

/** Slug of the Real Estate category: its leads are filed under it, and hiding it hides every project. */
export const REAL_ESTATE_SLUG = 'real-estate';

// ---------- Helpers (site, admin and alert emails) ----------

const trimZeros = (s: string) => s.replace(/\.?0+$/, '');

/** ₹ amount in crore or lakh, as Indian property sites write it: 12500000 → "1.25 Cr", 8500000 → "85 L". */
export const formatPrice = (rupees: number) =>
  rupees >= 1e7 ? `${trimZeros((rupees / 1e7).toFixed(2))} Cr` : `${trimZeros((rupees / 1e5).toFixed(2))} L`;

/** Monthly EMI on 80% of the price at 8.5% for 20 years (the figure the project page shows). */
export function monthlyEmi(price: number): number {
  const loan = price * 0.8;
  const rate = 0.085 / 12;
  const months = 240;
  return (loan * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
}

/** Bedrooms in a configuration's name: "3 BHK+" → 3; "Villa" or "Plot 150 sq yd" → null. */
export function bedroomsOf(title: string): number | null {
  const n = Number.parseInt(title, 10);
  return Number.isFinite(n) && n > 0 && n < 20 ? n : null;
}

/** Non-blank lines of a multi-line field (highlights, specifications, chapters). */
export const textLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

/** A specification line "Bedrooms: Laminated wooden" as label and value; no colon means no label. */
export function specLine(line: string): { label: string | null; value: string } {
  const i = line.indexOf(':');
  return i > 0 ? { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : { label: null, value: line };
}

export interface VideoChapter {
  /** As typed, e.g. "2:10". */
  time: string;
  title: string;
  seconds: number;
}

/** Chapters from lines such as "2:10 Clubhouse and pool" (or "1:02:10 …"). Other lines are ignored. */
export function parseChapters(text: string): VideoChapter[] {
  return textLines(text).flatMap((line) => {
    const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+(.+)$/.exec(line);
    if (!m) return [];
    const [, h, mm, ss, title] = m;
    return [{ time: h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`, title: title!.trim(), seconds: (Number(h ?? 0) * 60 + Number(mm)) * 60 + Number(ss) }];
  });
}

/** The project page address: /real-estate/<name and area>, e.g. /real-estate/skyline-heights-noida. */
export const projectSlug = (name: string, area: string) =>
  `${name} ${area}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

/** The same project typed twice ("Skyline Heights" and "skyline-heights") has the same key. */
export const projectNameKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

/** "Sector 150, Noida". */
export const projectPlace = (p: { locality: string; area: string }) => [p.locality, p.area].filter(Boolean).join(', ');

// ---------- Request schemas ----------

const count = (max: number) => blankAsNull(z.coerce.number().int('Use a whole number').min(0).max(max));
const lines = (max: number) => z.string().trim().max(max);
/** Rupees, without commas. 10 lakh crore is far above any project. */
const rupees = blankAsNull(z.coerce.number().int('Enter the price in rupees, without decimals').min(1).max(10_000_000_000_000));
const sqft = blankAsNull(z.coerce.number().int('Enter the area in whole sq ft').min(1).max(10_000_000));
const youTubeUrl = z
  .string()
  .trim()
  .max(300)
  .refine((url) => youTubeId(url) !== null, 'Paste a YouTube video link');

export const projectConfigurationSchema = z.object({
  /** e.g. 2 BHK, 3 BHK+, Villa, Plot 150 sq yd. */
  title: trimmed(40),
  price: rupees,
  superArea: sqft,
  carpetArea: sqft,
  plan2dUrl: imageUrlSchema.nullable(),
  plan3dUrl: imageUrlSchema.nullable(),
});
export type ProjectConfiguration = z.infer<typeof projectConfigurationSchema>;

/** An extra video under the main one; chapters are lines such as "1:20 Swimming pool". */
export const projectVideoSchema = z.object({
  title: z.string().trim().max(80),
  url: youTubeUrl,
  chapters: lines(2000),
});
export type ProjectVideo = z.infer<typeof projectVideoSchema>;

export const nearbyPlaceSchema = z.object({
  name: trimmed(80),
  type: z.enum(NEARBY_PLACE_TYPES),
  minutes: count(600),
  km: blankAsNull(z.coerce.number().min(0).max(500)),
});
export type NearbyPlace = z.infer<typeof nearbyPlaceSchema>;

export const projectFaqSchema = z.object({
  question: trimmed(200),
  answer: trimmed(1000),
});
export type ProjectFaq = z.infer<typeof projectFaqSchema>;

/** "Listed by" on the project page. A builder advertiser is the project's builder. */
export const advertiserSchema = z.object({
  type: z.enum(ADVERTISER_TYPES),
  /** The broker's name; for a builder the API saves the builder name. */
  name: z.string().trim().max(120),
  firm: z.string().trim().max(120),
  experienceYears: count(80),
  reraId: z.string().trim().max(60),
  established: blankAsNull(z.coerce.number().int().min(1900).max(2100)),
  projectsDelivered: count(10_000),
  about: z.string().trim().max(1000),
});
export type Advertiser = z.infer<typeof advertiserSchema>;

/** Lines of "Label: value", one group per heading on the page. */
export const specificationsSchema = z.object({
  flooring: lines(1000),
  fittings: lines(1000),
  walls: lines(1000),
});
export type ProjectSpecifications = z.infer<typeof specificationsSchema>;

const projectFields = z.object({
  type: z.enum(PROJECT_TYPES),
  area: z.enum(LISTING_AREAS),
  name: trimmed(120),
  builder: trimmed(120),
  /** Sector or address, e.g. Sector 150. */
  locality: trimmed(120),
  reraId: z.string().trim().max(60),
  possessionStatus: z.enum(POSSESSION_STATUSES),
  /** Free text, e.g. "Dec 2028" or "Immediate". */
  possessionDate: z.string().trim().max(40),
  launchDate: z.string().trim().max(40),
  /** Shown first on the listing page, with a Premium badge. */
  isPremium: z.boolean(),
  units: count(100_000),
  /** e.g. "6.5 Acres". */
  landArea: z.string().trim().max(40),
  towers: count(1000),
  /** Paragraphs separated by a blank line. */
  about: z.string().trim().max(5000),
  highlights: z.array(trimmed(160)).max(PROJECT_LIMITS.highlights, `Up to ${PROJECT_LIMITS.highlights} highlights`),
  configurations: z.array(projectConfigurationSchema).min(1, 'Add at least one configuration').max(PROJECT_LIMITS.configurations),
  /** Ticked and typed amenities together, in order. Duplicates (ignoring case) are dropped. */
  amenities: z
    .array(trimmed(60))
    .max(60)
    .transform((list) => list.filter((a, i) => list.findIndex((b) => b.toLowerCase() === a.toLowerCase()) === i)),
  specifications: specificationsSchema,
  nearby: z.array(nearbyPlaceSchema).max(PROJECT_LIMITS.nearby),
  advertiser: advertiserSchema,
  /** Extra questions; price, possession, RERA and builder questions are written automatically. */
  faqs: z.array(projectFaqSchema).max(PROJECT_LIMITS.faqs),
  /** First photo is the cover. */
  photos: z.array(imageUrlSchema).max(PROJECT_LIMITS.photos, `Up to ${PROJECT_LIMITS.photos} photos`),
  /** The main video (project reel or walkthrough); plays first. */
  videoUrl: blankAsNull(youTubeUrl),
  videoChapters: lines(2000),
  videos: z.array(projectVideoSchema).max(PROJECT_LIMITS.videos, `Up to ${PROJECT_LIMITS.videos} more videos`),
  /** PDF link, given to visitors after they share their number. */
  brochureUrl: blankAsNull(z.url('Paste the full link to the PDF').max(500)),
  /** The advertiser's number, shown to a visitor after View Number. Private otherwise. */
  phone: blankAsNull(mobileSchema),
  termStart: z.iso.date(),
  termMonths: z.coerce.number().pipe(z.union([z.literal(12), z.literal(6)], { error: 'Choose 12 or 6 months' })),
  status: z.enum(LISTING_STATUSES),
  metaTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(170),
});

type ProjectFieldsShape = Partial<z.infer<typeof projectFields>>;

/** Checks that need more than one field. Runs on PATCH too, for the fields sent. */
function checkProject(p: ProjectFieldsShape, ctx: z.RefinementCtx) {
  if (p.configurations && !p.configurations.some((c) => c.price && c.superArea)) {
    ctx.addIssue({ code: 'custom', path: ['configurations'], message: 'Add at least one configuration with price and super area' });
  }
  if (p.advertiser?.type === 'broker' && !p.advertiser.name) {
    ctx.addIssue({ code: 'custom', path: ['advertiser', 'name'], message: 'Enter the broker name' });
  }
}

export const projectInputSchema = projectFields.superRefine(checkProject);
export type ProjectInput = z.infer<typeof projectInputSchema>;
/** What the admin form sends, before numbers are parsed. */
export type ProjectFormInput = z.input<typeof projectInputSchema>;

export const projectUpdateSchema = projectFields.partial().superRefine(checkProject);
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const PROJECT_SORTS = ['rel', 'lo', 'hi'] as const;

/** The public listing page: a location, bedroom and possession chips, sort and search. */
export const projectQuerySchema = paginationSchema.extend({
  area: blankAsUndefined(z.enum(LISTING_AREAS)),
  /** A sector, matched ignoring case. */
  locality: blankAsUndefined(z.string().trim().min(1).max(120)),
  /** Matches the project, builder, advertiser or sector. */
  q: blankAsUndefined(z.string().trim().min(1).max(100)),
  /** 2 or 3 bedrooms, or 4 for "4 BHK+". */
  bhk: blankAsUndefined(z.enum(['2', '3', '4'])),
  possession: blankAsUndefined(z.enum(POSSESSION_STATUSES)),
  sort: blankAsUndefined(z.enum(PROJECT_SORTS)),
});
export type ProjectQuery = z.infer<typeof projectQuerySchema>;

export const ADMIN_PROJECT_SORTS = ['new', 'exp', 'lead', 'az'] as const;

export const adminProjectQuerySchema = paginationSchema.extend({
  q: blankAsUndefined(z.string().trim().min(1).max(100)),
  type: blankAsUndefined(z.enum(PROJECT_TYPES)),
  area: blankAsUndefined(z.enum(LISTING_AREAS)),
  /** A status, or "expired" for projects whose term has ended. */
  status: blankAsUndefined(z.enum([...LISTING_STATUSES, 'expired'] as const)),
  sort: blankAsUndefined(z.enum(ADMIN_PROJECT_SORTS)),
});
export type AdminProjectQuery = z.infer<typeof adminProjectQuerySchema>;

/** Live check while typing a project name: one project can be listed only once. */
export const projectDuplicateQuerySchema = z.object({
  name: z.string().trim().min(1).max(120),
  area: z.enum(LISTING_AREAS),
  /** The project being edited. */
  exclude: blankAsUndefined(z.uuid()),
});
export type ProjectDuplicateQuery = z.infer<typeof projectDuplicateQuerySchema>;

/** The View Number form (also Site visit, Callback, Price sheet, Brochure and the project page's enquiry form). */
export const projectEnquiryInputSchema = z.object({
  /** Omit for "Get a callback" from the NSB team. */
  projectId: z.uuid().optional(),
  name: trimmed(80),
  mobile: mobileSchema,
  isDealer: z.boolean().default(false),
  buyWithin: blankAsUndefined(z.enum(BUY_WITHIN)),
  homeLoan: z.boolean().default(false),
  siteVisit: z.boolean().default(false),
  /** The enquiry form's optional question for the advertiser. */
  message: blankAsUndefined(z.string().trim().max(1000, 'Keep your message under 1000 characters')),
  agreed: z.literal(true, { error: 'Please accept the Terms and Privacy Policy.' }),
  source: z.enum(PROJECT_LEAD_SOURCES).default('View Number'),
});
export type ProjectEnquiryInput = z.infer<typeof projectEnquiryInputSchema>;

// ---------- Response types ----------

/** A project card on the listing page. */
export interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  builder: string;
  /** The builder, or the broker who lists the project. */
  advertiserName: string;
  advertiserType: AdvertiserType;
  type: ProjectType;
  area: string;
  locality: string;
  isPremium: boolean;
  possessionStatus: PossessionStatus;
  possessionDate: string;
  reraId: string;
  /** Lowest configuration price in rupees; null when every price is on request. */
  minPrice: number | null;
  /** The first three priced configurations, for the card. */
  keyConfigurations: { title: string; superArea: number | null }[];
  coverImageUrl: string | null;
  status: ListingStatus;
  createdAt: string;
}

/** The public project page. The advertiser's phone and the brochure link come only with a lead. */
export interface ProjectDetail extends ProjectSummary {
  launchDate: string;
  units: number | null;
  landArea: string;
  towers: number | null;
  about: string;
  highlights: string[];
  configurations: ProjectConfiguration[];
  amenities: string[];
  specifications: ProjectSpecifications;
  nearby: NearbyPlace[];
  advertiser: Advertiser;
  faqs: ProjectFaq[];
  photos: string[];
  videoUrl: string | null;
  videoChapters: string;
  videos: ProjectVideo[];
  hasBrochure: boolean;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string;
  /** Up to three other live projects in the same area. */
  similar: ProjectSummary[];
}

/** A row in Admin › Real Estate. */
export interface AdminProjectRow extends ProjectSummary {
  termStart: string;
  termMonths: number;
  leadCount: number;
}

/** The admin form's project, with the private fields. */
export interface AdminProject extends Omit<ProjectDetail, 'similar' | 'hasBrochure'> {
  brochureUrl: string | null;
  phone: string | null;
  termStart: string;
  termMonths: number;
  leadCount: number;
}

export interface ProjectStats {
  total: number;
  live: number;
  draft: number;
  hidden: number;
  /** Distinct builders and brokers advertising. */
  advertisers: number;
  /** Leads on every project. */
  leads: number;
  /** Live projects whose term ends within 30 days (the admin bell). */
  expiringSoon: number;
}

/** A project already listed under this name and area. */
export interface ProjectDuplicate {
  id: string;
  name: string;
  area: string;
  advertiserName: string;
  status: ListingStatus;
}

/** Sectors with live projects in an area, most projects first (the "Popular localities" card). */
export interface ProjectLocality {
  name: string;
  count: number;
}

/** After a lead is saved: who to call. Null phone means the NSB team calls back. */
export interface ProjectEnquiryResult {
  id: string;
  advertiserName: string | null;
  phone: string | null;
  brochureUrl: string | null;
}
