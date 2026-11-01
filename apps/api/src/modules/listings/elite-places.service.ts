import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNotNull, sql } from 'drizzle-orm';
import { type ListingSummary, MAX_TOP_LISTINGS, type TopListingsInput } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { listings } from '../../db/schema.js';
import { ListingCardsService } from './listing-cards.service.js';

/** Top places belong to a sub-category, so a listing moved to another one gives its place up. */
export const leaveTopPlaces = (categoryId: string | undefined) =>
  categoryId
    ? {
        topRank: sql<number | null>`case when ${listings.categoryId} = ${categoryId}::uuid then ${listings.topRank} end`,
        isElite: sql<boolean>`${listings.categoryId} = ${categoryId}::uuid and ${listings.isElite}`,
      }
    : {};

/** The Elite 10: each sub-category's top places. */
@Injectable()
export class ElitePlacesService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly cards: ListingCardsService,
  ) {}

  /** A sub-category's top places, first place first. */
  async top(categoryId: string): Promise<ListingSummary[]> {
    const { items } = await this.cards.page(
      { page: 1, pageSize: MAX_TOP_LISTINGS },
      [eq(listings.categoryId, categoryId), isNotNull(listings.topRank)],
      [asc(listings.topRank)],
    );
    return items;
  }

  /** Replaces a sub-category's top places. All or nothing: a listing from elsewhere changes nothing. */
  async setTop({ categoryId, items }: TopListingsInput): Promise<ListingSummary[]> {
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`nsb:top:${categoryId}`}))`);
      await tx
        .update(listings)
        .set({ topRank: null, isElite: false })
        .where(and(eq(listings.categoryId, categoryId), isNotNull(listings.topRank)));
      for (const [i, { id, isElite }] of items.entries()) {
        const [row] = await tx
          .update(listings)
          .set({ topRank: i + 1, isElite })
          .where(and(eq(listings.id, id), eq(listings.categoryId, categoryId)))
          .returning({ id: listings.id });
        if (!row) throw new BadRequestException('Every listing must be in this sub-category');
      }
    });
    return this.top(categoryId);
  }
}
