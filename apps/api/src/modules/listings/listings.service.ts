import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, gte, inArray, lt, or, type SQL, sql } from 'drizzle-orm';
import {
  type AdminListing,
  type AdminListingQuery,
  type GalleryImage,
  type ListingDetail,
  type ListingDetails,
  listingDetailsSchema,
  listingFormFor,
  type ListingInput,
  type ListingQuery,
  type ListingReview,
  type ListingSummary,
  type ListingUpdate,
  type Paginated,
  type ResolvedListingForm,
  type SitemapListing,
} from '@nsb/shared';
import { DB, type Database, type Tx } from '../../db/db.module.js';
import { categories, enquiries, listingImages, listingReviews, listings } from '../../db/schema.js';
import { rethrowDbError } from '../../common/db-errors.js';
import { istDayStart } from '../../common/dates.js';
import { MediaService } from '../media/media.service.js';
import { leaveTopPlaces } from './elite-places.service.js';
import { ListingCardsService } from './listing-cards.service.js';
import { shownQuickInfo, toDetail, toReview } from './listing-mappers.js';
import { categoryRef, parentCategory, visible, withCategory } from './listing-query.js';

/** Tells two categories' forms apart: the same questions keep the same answers. */
const formKey = (form: ResolvedListingForm | null | undefined) => form?.fields.map((f) => f.key).join() ?? '';

/** A sitemap file holds at most 50,000 addresses, shared with the site's other pages. */
const SITEMAP_LIMIT = 45_000;

@Injectable()
export class ListingsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly media: MediaService,
    private readonly cards: ListingCardsService,
  ) {}

  /** Public list: only listings in active categories. */
  list(query: ListingQuery): Promise<Paginated<ListingSummary>> {
    return this.cards.page(query, [visible]);
  }

  /** Admin list: every listing, optionally in one category (a top-level one includes its sub-categories). */
  async listAdmin(query: AdminListingQuery): Promise<Paginated<ListingSummary>> {
    const { categoryId, from, to, status } = query;
    const filters: SQL[] = [];
    if (status) filters.push(eq(listings.status, status));
    if (categoryId) filters.push(or(eq(listings.categoryId, categoryId), eq(categories.parentId, categoryId))!);
    if (from) filters.push(gte(listings.createdAt, istDayStart(from)));
    if (to) filters.push(lt(listings.createdAt, sql`${istDayStart(to)} + interval '1 day'`));
    const order =
      query.sort === 'az'
        ? [asc(listings.name)]
        : query.sort === 'lead'
          ? [desc(sql`(select count(*) from ${enquiries} where ${enquiries}.listing_id = ${listings}.id)`), desc(listings.createdAt)]
          : [desc(listings.createdAt)];
    const page = await this.cards.page(query, filters, order);
    const leads = await this.leadCounts(page.items.map((l) => l.id));
    return { ...page, items: page.items.map((l) => ({ ...l, leadCount: leads.get(l.id) ?? 0 })) };
  }

  /** Leads per listing, for a page of admin rows. */
  private async leadCounts(listingIds: string[]): Promise<Map<string, number>> {
    if (!listingIds.length) return new Map();
    const rows = await this.db
      .select({ listingId: enquiries.listingId, count: count() })
      .from(enquiries)
      .where(inArray(enquiries.listingId, listingIds))
      .groupBy(enquiries.listingId);
    return new Map(rows.map((r) => [r.listingId!, r.count]));
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

  /** Lookup used when recording an enquiry: the live listing, its category, that category's parent and the key info the site shows. */
  async getSource(id: string) {
    const { listing, category, parent } = await this.findOne(and(eq(listings.id, id), visible)!);
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
    } else if (fields.categoryId) {
      const [current] = await this.db.select({ categoryId: listings.categoryId }).from(listings).where(eq(listings.id, id));
      if (!current) throw new NotFoundException('Listing not found');
      // Answers belong to a form: they stay on a move that keeps it, and would show wrongly under another.
      const [from, to] = await Promise.all([this.formOf(current.categoryId), this.formOf(fields.categoryId)]);
      if (formKey(from) !== formKey(to)) fields.details = {};
    }
    const before = await this.imageUrls(id);
    try {
      await this.db.transaction(async (tx) => {
        const [row] = Object.keys(fields).length
          ? await tx.update(listings).set({ ...fields, ...leaveTopPlaces(fields.categoryId) }).where(eq(listings.id, id)).returning({ id: listings.id })
          : await tx.select({ id: listings.id }).from(listings).where(eq(listings.id, id));
        if (!row) throw new NotFoundException('Listing not found');
        if (gallery) await this.replaceGallery(tx, id, gallery);
      });
    } catch (err) {
      rethrowDbError(err, 'Listing');
    }
    await this.media.release(before, await this.imageUrls(id));
    return this.getAdmin(id);
  }

  async remove(id: string): Promise<void> {
    const images = await this.imageUrls(id);
    const [row] = await this.db.delete(listings).where(eq(listings.id, id)).returning({ id: listings.id });
    if (!row) throw new NotFoundException('Listing not found');
    await this.media.release(images);
  }

  /** Newest edits first. Listings outside a vertical have no public address. */
  async sitemap(): Promise<SitemapListing[]> {
    const rows = await this.db
      .select({ slug: listings.slug, updatedAt: listings.updatedAt, category: categories.slug, vertical: parentCategory.slug })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .innerJoin(parentCategory, eq(categories.parentId, parentCategory.id))
      .where(visible)
      .orderBy(desc(listings.updatedAt))
      .limit(SITEMAP_LIMIT);
    return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
  }

  /** A listing's reviews, newest first (by review date, then when they were added). */
  private async reviews(listingId: string): Promise<ListingReview[]> {
    const rows = await this.db
      .select()
      .from(listingReviews)
      .where(eq(listingReviews.listingId, listingId))
      .orderBy(sql`${listingReviews.reviewDate} desc nulls last`, desc(listingReviews.createdAt));
    return rows.map(toReview);
  }

  private async findOne(where: SQL) {
    const [row] = await withCategory(this.db, {
      listing: listings,
      category: categoryRef,
      parent: { name: parentCategory.name, slug: parentCategory.slug },
    }).where(where);
    if (!row) throw new NotFoundException('Listing not found');
    return row;
  }

  /**
   * Checks structured details against the form of the listing's category and drops answers the
   * form does not ask for. A category without a form takes no details.
   */
  private async checkDetails(categoryId: string, details: ListingDetails): Promise<ListingDetails> {
    const form = await this.formOf(categoryId);
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

  /** The structured form a category's listings fill in, if it has one. */
  private async formOf(categoryId: string) {
    const [category] = await this.db
      .select({ slug: categories.slug, parentSlug: parentCategory.slug })
      .from(categories)
      .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
      .where(eq(categories.id, categoryId));
    // An unknown category fails on the foreign key when the listing is saved.
    return category && listingFormFor(category.slug, category.parentSlug);
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
