import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, sql } from 'drizzle-orm';
import { LISTING_AREAS, type ListingCounts, type ListingCountsQuery, type LocationOption } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, listings } from '../../db/schema.js';
import { localityKey, locationFilters, parentCategory, visible, withCategory } from './listing-query.js';

/** The site's location filter: the places it offers, and how many listings each has. */
@Injectable()
export class ListingLocationsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /**
   * Areas and localities for the site's location filter, from live listings. Every area in
   * LISTING_AREAS is offered, even before it has listings, so the picker never changes shape.
   */
  async locations(): Promise<LocationOption[]> {
    const rows = await withCategory(this.db, { area: listings.area, name: sql<string | null>`min(btrim(${listings.locality}))`, count: count() })
      .where(visible)
      .groupBy(listings.area, localityKey);
    return LISTING_AREAS.map((area) => {
      const inArea = rows.filter((r) => r.area === area);
      return {
        area,
        count: inArea.reduce((sum, r) => sum + r.count, 0),
        localities: inArea
          .filter((r): r is typeof r & { name: string } => !!r.name)
          .map(({ name, count }) => ({ name, count }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en-IN', { numeric: true })),
      };
    });
  }

  /** Live listings per category in a location: per top-level category, or per sub-category of `parent`. */
  async counts(query: ListingCountsQuery): Promise<ListingCounts> {
    const slug = query.parent ? categories.slug : sql<string>`coalesce(${parentCategory.slug}, ${categories.slug})`;
    const filters = [visible, ...locationFilters(query)];
    if (query.parent) filters.push(eq(parentCategory.slug, query.parent));
    const rows = await withCategory(this.db, { slug, count: count() })
      .where(and(...filters))
      .groupBy(slug);
    return Object.fromEntries(rows.map((r) => [r.slug, r.count]));
  }
}
