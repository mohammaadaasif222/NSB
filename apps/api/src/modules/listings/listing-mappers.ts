import { getTableColumns } from 'drizzle-orm';
import {
  type GalleryImage,
  type ListingDetail,
  listingDetailsToQuickInfo,
  listingFormFor,
  type ListingRating,
  type ListingReview,
  type ListingSummary,
  type QuickInfoItem,
} from '@nsb/shared';
import { without } from '../../common/columns.js';
import { listingReviews, listings } from '../../db/schema.js';

/** Number of quick-info items shown as "key info" on a vendor card. */
const KEY_INFO_COUNT = 4;

/** Number of gallery thumbnails shown on a list-view vendor card. */
export const GALLERY_PREVIEW_COUNT = 4;

type Row = typeof listings.$inferSelect;
type CategoryRef = ListingSummary['category'];

/** Columns a card has no use for: long text, and the vendor's private contacts. */
const NOT_ON_CARDS = ['about', 'address', 'email', 'phone', 'videos', 'googleMapsUrl'] as const;
export const cardColumns = without(getTableColumns(listings), NOT_ON_CARDS);
type CardRow = Omit<Row, (typeof NOT_ON_CARDS)[number]>;
/** The parent of the listing's category; null for a top-level category. */
type ParentRef = { slug: string | null } | null;

/**
 * Key info as the site shows it: built from the structured details when the listing has them,
 * otherwise the free-form quick info it was saved with (listings added before the forms).
 */
export function shownQuickInfo(l: CardRow, categorySlug: string, parent: ParentRef): QuickInfoItem[] {
  const form = listingFormFor(categorySlug, parent?.slug);
  return form && Object.keys(l.details).length ? listingDetailsToQuickInfo(form.fields, l.details) : l.quickInfo;
}

type ReviewRow = typeof listingReviews.$inferSelect;
/** Average and count of a listing's NSB reviews. */
export type ReviewStats = { average: number; count: number };

const oneDecimal = (n: number) => Math.round(n * 10) / 10;

/**
 * The rating shown for a listing: the Google rating the admin typed in when there is one,
 * else the average of its reviews. Never made up: no rating and no reviews means null.
 */
export function ratingOf(l: CardRow, stats: ReviewStats | undefined): ListingRating | null {
  if (l.googleRating !== null) return { average: oneDecimal(l.googleRating), count: l.googleReviewCount ?? 0, source: 'google' };
  return stats && stats.count > 0 ? { average: oneDecimal(stats.average), count: stats.count, source: 'reviews' } : null;
}

export const toReview = (r: ReviewRow): ListingReview => ({
  id: r.id,
  authorName: r.authorName,
  rating: r.rating,
  text: r.text,
  reviewDate: r.reviewDate,
  source: r.source,
  isVerified: r.isVerified,
  createdAt: r.createdAt.toISOString(),
});

export const toSummary = (l: CardRow, category: CategoryRef, parent: ParentRef, galleryPreview: string[], rating: ListingRating | null): ListingSummary => ({
  id: l.id,
  name: l.name,
  slug: l.slug,
  area: l.area,
  locality: l.locality,
  shortDescription: l.shortDescription,
  coverImageUrl: l.coverImageUrl,
  galleryPreview,
  keyInfo: shownQuickInfo(l, category.slug, parent).slice(0, KEY_INFO_COUNT),
  // Cards show a few services as chips: the plain list first, then the sectioned ones.
  services: [...l.services, ...l.serviceGroups.flatMap((g) => g.items)],
  isFeatured: l.isFeatured,
  topRank: l.topRank,
  isElite: l.isElite,
  category,
  createdAt: l.createdAt.toISOString(),
  status: l.status,
  rating,
});

export const toDetail = (l: Row, category: CategoryRef, parent: ParentRef, gallery: GalleryImage[], reviews: ListingReview[]): ListingDetail => {
  const stats = reviews.length ? { average: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length, count: reviews.length } : undefined;
  return {
    ...toSummary(l, category, parent, gallery.slice(0, GALLERY_PREVIEW_COUNT).map((g) => g.url), ratingOf(l, stats)),
    // The detail page lists plain services and sections separately.
    services: l.services,
    serviceGroups: l.serviceGroups,
    tags: l.tags,
    address: l.address,
    about: l.about,
    quickInfo: shownQuickInfo(l, category.slug, parent),
    gallery,
    videos: l.videos,
    googleRating: l.googleRating === null ? null : oneDecimal(l.googleRating),
    googleReviewCount: l.googleReviewCount,
    googleMapsUrl: l.googleMapsUrl,
    reviews,
  };
};
