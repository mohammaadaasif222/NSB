import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, lt, or, type SQL, sql } from 'drizzle-orm';
import { type Enquiry, type EnquiryInput, type EnquiryQuery, listingPlace, type Paginated, type UnreadCount } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, enquiries } from '../../db/schema.js';
import { istDayStart } from '../../common/dates.js';
import { likeTerm } from '../../common/like.js';
import { pageWindow } from '../../common/pagination.js';
import { ListingsService } from '../listings/listings.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

type Row = typeof enquiries.$inferSelect;

/** Most rows one CSV export returns; narrow the filters for more. */
export const EXPORT_LIMIT = 10_000;

const toEnquiry = (r: Row): Enquiry => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
  readAt: r.readAt?.toISOString() ?? null,
});


@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name);

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly listings: ListingsService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(input: EnquiryInput): Promise<Enquiry> {
    const { listing, category, parent, quickInfo } = await this.listings.getSource(input.listingId);
    const [row] = await this.db
      .insert(enquiries)
      .values({
        ...input,
        listingName: listing.name,
        categoryId: category.id,
        categoryName: category.name,
      })
      .returning();
    const enquiry = toEnquiry(row);

    // The lead is saved; a failed alert must never lose it or fail the request.
    this.notifications
      .enquiryReceived({
        enquiry,
        listing: {
          id: listing.id,
          slug: listing.slug,
          area: listingPlace(listing),
          quickInfo,
          services: listing.services,
          vendorEmail: listing.email,
          vendorPhone: listing.phone,
          notifyVendor: listing.notifyVendor,
          categorySlug: category.slug,
          parent,
        },
      })
      .catch((err: unknown) => this.logger.error(`Alert failed for enquiry ${enquiry.id}`, err));

    return enquiry;
  }

  async list(query: EnquiryQuery): Promise<Paginated<Enquiry>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const where = this.where(query);
    const [rows, [{ total }]] = await Promise.all([
      this.db.select().from(enquiries).where(where).orderBy(desc(enquiries.createdAt)).limit(limit).offset(offset),
      this.db.select({ total: count() }).from(enquiries).where(where),
    ]);
    return { items: rows.map(toEnquiry), total, page, pageSize };
  }

  /** Every lead matching the dashboard filters (newest first, capped at EXPORT_LIMIT), for the CSV export. */
  async exportRows(query: EnquiryQuery): Promise<Enquiry[]> {
    const rows = await this.db.select().from(enquiries).where(this.where(query)).orderBy(desc(enquiries.createdAt)).limit(EXPORT_LIMIT);
    return rows.map(toEnquiry);
  }

  /** The dashboard filters, shared by the list and the export. */
  private where(query: EnquiryQuery): SQL | undefined {
    const filters: SQL[] = [];
    if (query.categoryId) {
      // The category itself, or any of its sub-categories.
      const subs = this.db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, query.categoryId));
      filters.push(or(eq(enquiries.categoryId, query.categoryId), inArray(enquiries.categoryId, subs))!);
    }
    if (query.listingId) filters.push(eq(enquiries.listingId, query.listingId));
    if (query.status) filters.push(query.status === 'unread' ? isNull(enquiries.readAt) : isNotNull(enquiries.readAt));
    if (query.from) filters.push(gte(enquiries.createdAt, istDayStart(query.from)));
    if (query.to) filters.push(lt(enquiries.createdAt, sql`${istDayStart(query.to)} + interval '1 day'`));
    if (query.q) {
      const term = likeTerm(query.q);
      filters.push(or(ilike(enquiries.name, term), ilike(enquiries.mobile, term), ilike(enquiries.email, term), ilike(enquiries.listingName, term))!);
    }
    return filters.length ? and(...filters) : undefined;
  }

  async unreadCount(): Promise<UnreadCount> {
    const [{ unread }] = await this.db.select({ unread: count() }).from(enquiries).where(isNull(enquiries.readAt));
    return { unread };
  }

  /** Marks one enquiry read (keeping the first time it was read) or unread again. */
  async setRead(id: string, read: boolean): Promise<Enquiry> {
    const [row] = await this.db
      .update(enquiries)
      .set({ readAt: read ? sql`coalesce(${enquiries.readAt}, now())` : null })
      .where(eq(enquiries.id, id))
      .returning();
    if (!row) throw new NotFoundException('Enquiry not found');
    return toEnquiry(row);
  }

  async markAllRead(): Promise<UnreadCount> {
    await this.db.update(enquiries).set({ readAt: sql`now()` }).where(isNull(enquiries.readAt));
    return { unread: 0 };
  }
}
