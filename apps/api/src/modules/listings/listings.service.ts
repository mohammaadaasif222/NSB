import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lt, or, type SQL, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  type AdminListing,
  type AdminListingQuery,
  type GalleryImage,
  type ListingDetail,
  type ListingDetails,
  listingDetailsSchema,
  listingDetailsToQuickInfo,
  listingFormFor,
  type ListingInput,
  type ListingQuery,
  type ListingRating,
  type ListingReview,
  type ListingSummary,
  type ListingUpdate,
  type Paginated,
  type QuickInfoItem,
} from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, listingImages, listingReviews, listings } from '../../db/schema.js';
import { rethrowDbError } from '../../common/db-errors.js';
import { istDayStart } from '../../common/dates.js';
import { likeTerm } from '../../common/like.js';
import { pageWindow } from '../../common/pagination.js';
import { MediaService } from '../media/media.service.js';

/** Number of quick-info items shown as "key info" on a vendor card. */
const KEY_INFO_COUNT = 4;

/** Number of gallery thumbnails shown on a list-view vendor card. */
const GALLERY_PREVIEW_COUNT = 4;

type Row = typeof listings.$inferSelect;
type CategoryRef = ListingSummary['category'];
type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];
/** The parent of the listing's category; null for a top-level category. */
type ParentRef = { slug: string | null } | null;

/**
 * Key info as the site shows it: built from the structured details when the listing has them,
 * otherwise the free-form quick info it was saved with (listings added before the forms).
 */
export function shownQuickInfo(l: Row, categorySlug: string, parent: ParentRef): QuickInfoItem[] {
  const form = listingFormFor(categorySlug, parent?.slug);
  return form && Object.keys(l.details).length ? listingDetailsToQuickInfo(form.fields, l.details) : l.quickInfo;
}

type ReviewRow = typeof listingReviews.$inferSelect;
/** Average and count of a listing's NSB reviews. */
type ReviewStats = { average: number; count: number };

const oneDecimal = (n: number) => Math.round(n * 10) / 10;

/**
 * The rating shown for a listing: the Google rating the admin typed in when there is one,
 * else the average of its reviews. Never made up: no rating and no reviews means null.
 */
function ratingOf(l: Row, stats: ReviewStats | undefined): ListingRating | null {
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

const toSummary = (l: Row, category: CategoryRef, parent: ParentRef, galleryPreview: string[], rating: ListingRating | null): ListingSummary => ({
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
  category,
  createdAt: l.createdAt.toISOString(),
  status: l.status,
  rating,
});

const toDetail = (l: Row, category: CategoryRef, parent: ParentRef, gallery: GalleryImage[], reviews: ListingReview[]): ListingDetail => {
  const stats = reviews.length ? { average: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length, count: reviews.length } : undefined;
  return {
    ...toSummary(l, category, parent, gallery.slice(0, GALLERY_PREVIEW_COUNT).map((g) => g.url), ratingOf(l, stats)),
    // The detail page lists plain services and sections separately.
    services: l.services,
    serviceGroups: l.serviceGroups,
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

const categoryRef = { id: categories.id, name: categories.name, slug: categories.slug };

/** The parent of the listing's category, for visibility checks and parent filters. */
const parentCategory = alias(categories, 'parent_category');

/** Public pages show a listing only while it is Live and its category, and that category's parent, are active. */
const visible = and(
  eq(listings.status, 'live'),
  eq(categories.isActive, true),
  or(isNull(parentCategory.id), eq(parentCategory.isActive, true)),
)!;

@Injectable()
export class ListingsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly media: MediaService,
  ) {}

  /** Public list: only listings in active categories. */
  list(query: ListingQuery): Promise<Paginated<ListingSummary>> {
    return this.page(query, [visible]);
  }

  /** Admin list: every listing, optionally in one category (a top-level one includes its sub-categories). */
  listAdmin(query: AdminListingQuery): Promise<Paginated<ListingSummary>> {
    const { categoryId, from, to, status } = query;
    const filters: SQL[] = [];
    if (status) filters.push(eq(listings.status, status));
    if (categoryId) filters.push(or(eq(listings.categoryId, categoryId), eq(categories.parentId, categoryId))!);
    if (from) filters.push(gte(listings.createdAt, istDayStart(from)));
    if (to) filters.push(lt(listings.createdAt, sql`${istDayStart(to)} + interval '1 day'`));
    return this.page(query, filters);
  }

  async getBySlug(slug: string): Promise<ListingDetail> {
    const { listing, category, parent } = await this.findOne(and(eq(listings.slug, slug), visible)!);
    const [gallery, reviews] = await Promise.all([this.gallery(listing.id), this.reviews(listing.id)]);
    return toDetail(listing, category, parent, gallery, reviews);
  }

  async getAdmin(id: string): Promise<AdminListing> {
    const { listing, category, parent } = await this.findOne(eq(listings.id, id));
    const [gallery, reviews] = await Promise.all([this.gallery(listing.id), this.reviews(listing.id)]);
    return {
      ...toDetail(listing, category, parent, gallery, reviews),
      status: listing.status,
      details: listing.details,
      savedQuickInfo: listing.quickInfo,
      email: listing.email,
      phone: listing.phone,
      notifyVendor: listing.notifyVendor,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }

  /** Lookup used when recording an enquiry: the listing, its category, that category's parent and the key info the site shows. */
  async getSource(id: string) {
    const { listing, category, parent } = await this.findOne(eq(listings.id, id));
    return { listing, category, parent, quickInfo: shownQuickInfo(listing, category.slug, parent) };
  }

  async create(input: ListingInput): Promise<AdminListing> {
    const { gallery, ...fields } = input;
    if (fields.details) fields.details = await this.checkDetails(fields.categoryId, fields.details);
    try {
      const id = await this.db.transaction(async (tx) => {
        const [row] = await tx.insert(listings).values(fields).returning({ id: listings.id });
        await this.replaceGallery(tx, row.id, gallery);
        return row.id;
      });
      return this.getAdmin(id);
    } catch (err) {
      rethrowDbError(err, 'Listing');
    }
  }

  async update(id: string, input: ListingUpdate): Promise<AdminListing> {
    const { gallery, ...fields } = input;
    if (fields.details) {
      const categoryId = fields.categoryId ?? (await this.db.select({ id: listings.categoryId }).from(listings).where(eq(listings.id, id)))[0]?.id;
      if (!categoryId) throw new NotFoundException('Listing not found');
      fields.details = await this.checkDetails(categoryId, fields.details);
    }
    const before = await this.imageUrls(id);
    try {
      await this.db.transaction(async (tx) => {
        const [row] = Object.keys(fields).length
          ? await tx.update(listings).set(fields).where(eq(listings.id, id)).returning({ id: listings.id })
          : await tx.select({ id: listings.id }).from(listings).where(eq(listings.id, id));
        if (!row) throw new NotFoundException('Listing not found');
        if (gallery) await this.replaceGallery(tx, id, gallery);
      });
    } catch (err) {
      rethrowDbError(err, 'Listing');
    }
    await this.media.release(before);
    return this.getAdmin(id);
  }

  async remove(id: string): Promise<void> {
    const images = await this.imageUrls(id);
    const [row] = await this.db.delete(listings).where(eq(listings.id, id)).returning({ id: listings.id });
    if (!row) throw new NotFoundException('Listing not found');
    await this.media.release(images);
  }

  private async page(query: ListingQuery, extra: SQL[]): Promise<Paginated<ListingSummary>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const filters = [...extra];
    if (query.category) filters.push(eq(categories.slug, query.category));
    if (query.featured !== undefined) filters.push(eq(listings.isFeatured, query.featured));
    if (query.q) {
      const term = likeTerm(query.q);
      filters.push(
        or(ilike(listings.name, term), ilike(listings.area, term), ilike(listings.locality, term), ilike(listings.shortDescription, term))!,
      );
    }
    const where = filters.length ? and(...filters) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({ listing: listings, category: categoryRef, parent: { slug: parentCategory.slug } })
        .from(listings)
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
        .where(where)
        .orderBy(desc(listings.isFeatured), desc(listings.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(listings)
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
        .where(where),
    ]);

    const previews = await this.galleryPreviews(rows.map((r) => r.listing.id));
    const stats = await this.reviewStats(rows.map((r) => r.listing.id));
    return {
      items: rows.map((r) => toSummary(r.listing, r.category, r.parent, previews.get(r.listing.id) ?? [], ratingOf(r.listing, stats.get(r.listing.id)))),
      total,
      page,
      pageSize,
    };
  }

  /** The first few gallery URLs of each listing, in one query for a whole page of cards. */
  /** A listing's reviews, newest first (by review date, then when they were added). */
  private async reviews(listingId: string): Promise<ListingReview[]> {
    const rows = await this.db
      .select()
      .from(listingReviews)
      .where(eq(listingReviews.listingId, listingId))
      .orderBy(sql`${listingReviews.reviewDate} desc nulls last`, desc(listingReviews.createdAt));
    return rows.map(toReview);
  }

  /** Review average and count per listing, for the cards' rating. */
  private async reviewStats(listingIds: string[]): Promise<Map<string, ReviewStats>> {
    const stats = new Map<string, ReviewStats>();
    if (listingIds.length === 0) return stats;
    const rows = await this.db
      .select({ listingId: listingReviews.listingId, average: sql<number>`avg(${listingReviews.rating})::float`, count: count() })
      .from(listingReviews)
      .where(inArray(listingReviews.listingId, listingIds))
      .groupBy(listingReviews.listingId);
    for (const r of rows) stats.set(r.listingId, { average: Number(r.average), count: r.count });
    return stats;
  }

  private async galleryPreviews(listingIds: string[]): Promise<Map<string, string[]>> {
    const previews = new Map<string, string[]>();
    if (listingIds.length === 0) return previews;
    const images = await this.db
      .select({ listingId: listingImages.listingId, url: listingImages.url })
      .from(listingImages)
      .where(inArray(listingImages.listingId, listingIds))
      .orderBy(asc(listingImages.sortOrder));
    for (const { listingId, url } of images) {
      const urls = previews.get(listingId) ?? [];
      if (urls.length < GALLERY_PREVIEW_COUNT) previews.set(listingId, [...urls, url]);
    }
    return previews;
  }

  private async findOne(where: SQL) {
    const [row] = await this.db
      .select({ listing: listings, category: categoryRef, parent: { name: parentCategory.name, slug: parentCategory.slug } })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
      .where(where);
    if (!row) throw new NotFoundException('Listing not found');
    return row;
  }

  /**
   * Checks structured details against the form of the listing's category and drops answers the
   * form does not ask for. A category without a form takes no details.
   */
  private async checkDetails(categoryId: string, details: ListingDetails): Promise<ListingDetails> {
    const [category] = await this.db
      .select({ slug: categories.slug, parentSlug: parentCategory.slug })
      .from(categories)
      .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
      .where(eq(categories.id, categoryId));
    // An unknown category fails on the foreign key when the listing is saved.
    const form = category && listingFormFor(category.slug, category.parentSlug);
    if (!form) return {};
    const result = listingDetailsSchema(form.fields).safeParse(details);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        issues: result.error.issues.map((i) => ({ path: ['details', ...i.path].join('.'), message: i.message })),
      });
    }
    return result.data as ListingDetails;
  }

  private gallery(listingId: string): Promise<GalleryImage[]> {
    return this.db
      .select({ id: listingImages.id, url: listingImages.url, sortOrder: listingImages.sortOrder })
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(asc(listingImages.sortOrder));
  }

  /** Cover and gallery URLs, to release once they are replaced or the listing is deleted. */
  private async imageUrls(id: string): Promise<Array<string | null>> {
    const [[listing], gallery] = await Promise.all([
      this.db.select({ cover: listings.coverImageUrl }).from(listings).where(eq(listings.id, id)),
      this.gallery(id),
    ]);
    return [listing?.cover ?? null, ...gallery.map((g) => g.url)];
  }

  private async replaceGallery(tx: Tx, listingId: string, urls: string[]) {
    await tx.delete(listingImages).where(eq(listingImages.listingId, listingId));
    if (urls.length) {
      await tx
        .insert(listingImages)
        .values(urls.map((url, sortOrder) => ({ listingId, url, sortOrder })));
    }
  }
}
