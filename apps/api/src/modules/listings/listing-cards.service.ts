import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, inArray, type SQL, sql } from 'drizzle-orm';
import type { ListingQuery, ListingSummary, Paginated } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, listingImages, listingReviews, listings } from '../../db/schema.js';
import { searchMatch } from '../../common/like.js';
import { pageWindow } from '../../common/pagination.js';
import { cardColumns, GALLERY_PREVIEW_COUNT, ratingOf, type ReviewStats, toSummary } from './listing-mappers.js';
import { categoryRef, locationFilters, parentCategory, withCategory } from './listing-query.js';

/** Pages of vendor cards, for the site's lists, the admin's and the top places. */
@Injectable()
export class ListingCardsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async page(query: ListingQuery, extra: SQL[], order: SQL[] = [sql`${listings.topRank} asc nulls last`, desc(listings.isFeatured), desc(listings.createdAt)]): Promise<Paginated<ListingSummary>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const filters = [...extra, ...locationFilters(query)];
    if (query.category) filters.push(eq(listings.categoryId, sql`(select ${categories.id} from ${categories} where ${categories.slug} = ${query.category})`));
    if (query.featured !== undefined) filters.push(eq(listings.isFeatured, query.featured));
    if (query.tag) filters.push(sql`exists (select 1 from unnest(${listings.tags}) as t(tag) where lower(t.tag) = lower(${query.tag}))`);
    if (query.q) filters.push(searchMatch([listings.name, listings.area, listings.locality, listings.shortDescription], listings.tags, query.q));
    const where = filters.length ? and(...filters) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      withCategory(this.db, { listing: cardColumns, category: categoryRef, parent: { slug: parentCategory.slug } })
        .where(where)
        .orderBy(...order, desc(listings.id))
        .limit(limit)
        .offset(offset),
      withCategory(this.db, { total: count() }).where(where),
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

  /** The first few gallery URLs of each listing, in one query for a whole page of cards. */
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
}
