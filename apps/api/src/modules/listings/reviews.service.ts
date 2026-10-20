import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import type { ListingReview, ReviewInput, ReviewUpdate } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { listingReviews, listings } from '../../db/schema.js';
import { toReview } from './listings.service.js';

/** Reviews the NSB team adds to a listing by hand (copied from Google, or from customers). */
@Injectable()
export class ReviewsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async list(listingId: string): Promise<ListingReview[]> {
    await this.assertListing(listingId);
    const rows = await this.db
      .select()
      .from(listingReviews)
      .where(eq(listingReviews.listingId, listingId))
      .orderBy(sql`${listingReviews.reviewDate} desc nulls last`, desc(listingReviews.createdAt));
    return rows.map(toReview);
  }

  async create(listingId: string, input: ReviewInput): Promise<ListingReview> {
    await this.assertListing(listingId);
    const [row] = await this.db.insert(listingReviews).values({ ...input, listingId }).returning();
    return toReview(row);
  }

  async update(id: string, input: ReviewUpdate): Promise<ListingReview> {
    const [row] = Object.keys(input).length
      ? await this.db.update(listingReviews).set(input).where(eq(listingReviews.id, id)).returning()
      : await this.db.select().from(listingReviews).where(eq(listingReviews.id, id));
    if (!row) throw new NotFoundException('Review not found');
    return toReview(row);
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.db.delete(listingReviews).where(eq(listingReviews.id, id)).returning({ id: listingReviews.id });
    if (!row) throw new NotFoundException('Review not found');
  }

  private async assertListing(id: string) {
    const [row] = await this.db.select({ id: listings.id }).from(listings).where(eq(listings.id, id));
    if (!row) throw new NotFoundException('Listing not found');
  }
}
