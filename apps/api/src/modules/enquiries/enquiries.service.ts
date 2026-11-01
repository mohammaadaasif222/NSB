import { Inject, Injectable, Logger, NotFoundException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, lt, lte, or, type SQL, sql } from 'drizzle-orm';
import {
  type Enquiry,
  type EnquiryInput,
  type EnquiryQuery,
  type EnquiryUpdate,
  formatPrice,
  type LeadSectionCounts,
  GENERAL_PROPERTY_LEAD,
  listingPlace,
  type Paginated,
  type ProjectEnquiryInput,
  type ProjectEnquiryResult,
  type ProjectType,
  projectPlace,
  REAL_ESTATE_SLUG,
  type UnreadCount,
} from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, enquiries, projects } from '../../db/schema.js';
import { istDayStart } from '../../common/dates.js';
import { likeTerm } from '../../common/like.js';
import { without } from '../../common/columns.js';
import { pageWindow } from '../../common/pagination.js';
import { ListingsService } from '../listings/listings.service.js';
import { ALERT_TARGETS, AlertFailed, NotificationsService, type PendingAlert } from '../notifications/notifications.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { projectLeadMessage } from './project-lead-message.js';

type Row = typeof enquiries.$inferSelect;

/** Most rows one export returns; narrow the filters for more. */
export const EXPORT_LIMIT = 10_000;

/** A repeat lead within this time (same mobile, same listing or button) is saved without a second alert. */
const REPEAT_MINUTES = 10;

/** How often unsent alerts are looked for, and the wait before the first retry, which doubles each time. */
const ALERT_RETRY_MS = 5 * 60_000;
const ALERT_RETRY_MINUTES = ALERT_RETRY_MS / 60_000;
/** Retries before an alert is dropped, about 21 hours after the lead. */
const MAX_ALERT_RETRIES = 8;
/** Alerts retried per look; the rest wait for the next one. */
const ALERT_BATCH = 20;

/** The retry state, which also holds the vendor's contact details: never part of a lead. */
const ALERT_COLUMNS = ['pendingAlert', 'alertAttempts', 'nextAlertAt'] as const;

const noAlert = { pendingAlert: null, nextAlertAt: null };

/** A new lead's alert, saved with the lead. The retry loop takes over if it has not gone by then. */
const pending = (listing: PendingAlert['listing']) => ({
  pendingAlert: { listing, targets: [...ALERT_TARGETS] },
  nextAlertAt: new Date(Date.now() + ALERT_RETRY_MS),
});

const toEnquiry = (r: Row, projectType: Enquiry['projectType'] = null): Enquiry => ({
  ...without(r, ALERT_COLUMNS),
  projectType,
  createdAt: r.createdAt.toISOString(),
  readAt: r.readAt?.toISOString() ?? null,
});

/** Leads with their project's type (real estate), for the Leads table. */
const withProject = { enquiry: enquiries, projectType: projects.type };

@Injectable()
export class EnquiriesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EnquiriesService.name);
  private retries?: NodeJS.Timeout;

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly listings: ListingsService,
    private readonly projects: ProjectsService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.retries = setInterval(() => void this.retryAlerts().catch((err: unknown) => this.logger.error('Alert retry failed', err)), ALERT_RETRY_MS);
    this.retries.unref();
  }

  onModuleDestroy() {
    clearInterval(this.retries);
  }

  async create(input: EnquiryInput): Promise<Enquiry> {
    const { listing, category, parent, quickInfo } = await this.listings.getSource(input.listingId);
    const repeat = await this.isRepeat(input.mobile, eq(enquiries.listingId, input.listingId));
    const alert: PendingAlert['listing'] = {
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
    };
    const [row] = await this.db
      .insert(enquiries)
      .values({
        ...input,
        listingName: listing.name,
        categoryId: category.id,
        categoryName: category.name,
        ...(!repeat && pending(alert)),
      })
      .returning();

    if (!repeat) this.notify(row);

    return toEnquiry(row);
  }

  /**
   * A real estate lead (View Number and the other project buttons). It is filed under the Real
   * Estate category, and the visitor gets the advertiser's number in return, as the project page
   * promises. Without a project it is a "help me choose" callback for the NSB team.
   */
  async createForProject(input: ProjectEnquiryInput): Promise<ProjectEnquiryResult> {
    const project = input.projectId ? await this.projects.forLead(input.projectId) : null;
    const [category] = await this.db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.slug, REAL_ESTATE_SLUG));
    const repeat = await this.isRepeat(
      input.mobile,
      and(eq(enquiries.source, input.source), project ? eq(enquiries.projectId, project.id) : isNull(enquiries.projectId))!,
    );
    // Alerts go to NSB only: advertisers get the lead from NSB, not by email.
    const alert: PendingAlert['listing'] = project && {
      id: project.id,
      slug: project.slug,
      area: projectPlace(project),
      quickInfo: [
        { label: 'Builder', value: project.builder },
        { label: 'Listed by', value: `${project.advertiserName} (${project.advertiserType})` },
        { label: 'Starting price', value: project.minPrice ? `₹${formatPrice(project.minPrice)}` : 'On request' },
        { label: 'Possession', value: [project.possessionStatus, project.possessionDate].filter(Boolean).join(', ') },
        ...(project.reraId ? [{ label: 'RERA ID', value: project.reraId }] : []),
      ],
      services: [],
      vendorEmail: null,
      vendorPhone: project.phone,
      notifyVendor: false,
      categorySlug: REAL_ESTATE_SLUG,
      parent: null,
      path: `/real-estate/${project.slug}`,
    };
    const [row] = await this.db
      .insert(enquiries)
      .values({
        name: input.name,
        mobile: input.mobile,
        message: projectLeadMessage(input),
        // A site visit's date; admin shows it as the preferred date.
        preferredDate: input.source === 'Site visit' ? (input.visitDate ?? null) : null,
        source: input.source,
        projectId: project?.id ?? null,
        listingName: project?.name ?? GENERAL_PROPERTY_LEAD,
        categoryId: category?.id ?? null,
        categoryName: category?.name ?? 'Real Estate',
        ...(!repeat && pending(alert)),
      })
      .returning();

    if (!repeat) this.notify(row);

    return {
      id: row.id,
      advertiserName: project?.advertiserName ?? null,
      phone: project?.phone ?? null,
      brochureUrl: project?.brochureUrl ?? null,
    };
  }

  private async isRepeat(mobile: string, about: SQL): Promise<boolean> {
    const [{ repeats }] = await this.db
      .select({ repeats: count() })
      .from(enquiries)
      .where(and(eq(enquiries.mobile, mobile), about, sql`${enquiries.createdAt} > now() - make_interval(mins => ${REPEAT_MINUTES})`));
    return repeats > 0;
  }

  /** The lead is saved; a failed alert must never lose it or fail the request. */
  private notify(row: Row) {
    this.sendAlert(row).catch((err: unknown) => this.logger.error(`Alert failed for enquiry ${row.id}`, err));
  }

  /** Sends a saved alert. Anyone it did not reach stays on the row for the next retry. */
  private async sendAlert(row: Row) {
    const { listing, targets } = row.pendingAlert!;
    try {
      await this.notifications.enquiryReceived({ enquiry: toEnquiry(row), listing }, targets);
      await this.db.update(enquiries).set(noAlert).where(eq(enquiries.id, row.id));
    } catch (err) {
      const left = err instanceof AlertFailed ? err.left : targets;
      const lastTry = row.alertAttempts >= MAX_ALERT_RETRIES;
      this.logger.error(`Alert failed for enquiry ${row.id}${lastTry ? '; giving up' : ''}`, err);
      await this.db
        .update(enquiries)
        .set(lastTry ? noAlert : { pendingAlert: { listing, targets: left } })
        .where(eq(enquiries.id, row.id));
    }
  }

  /** Takes the alerts that are due and books each one's next try first, so no two runs send the same alert. */
  async retryAlerts(): Promise<void> {
    const due = this.db
      .select({ id: enquiries.id })
      .from(enquiries)
      .where(lte(enquiries.nextAlertAt, sql`now()`))
      .orderBy(asc(enquiries.nextAlertAt))
      .limit(ALERT_BATCH)
      .for('update', { skipLocked: true });
    const rows = await this.db
      .update(enquiries)
      .set({
        alertAttempts: sql`${enquiries.alertAttempts} + 1`,
        nextAlertAt: sql`now() + make_interval(mins => ${ALERT_RETRY_MINUTES} * power(2, ${enquiries.alertAttempts})::int)`,
      })
      .where(inArray(enquiries.id, due))
      .returning();
    for (const row of rows) await this.sendAlert(row);
  }

  /** `contacts: false` (View only): the search does not match numbers or email addresses, which that role cannot see. */
  async list(query: EnquiryQuery, { contacts = true } = {}): Promise<Paginated<Enquiry>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const where = this.where(query, contacts);
    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select(withProject)
        .from(enquiries)
        .leftJoin(projects, eq(enquiries.projectId, projects.id))
        .where(where)
        .orderBy(desc(enquiries.createdAt), desc(enquiries.id))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(enquiries).where(where),
    ]);
    return { items: rows.map((r) => toEnquiry(r.enquiry, r.projectType)), total, page, pageSize };
  }

  /** Every lead matching the dashboard filters (newest first, capped at EXPORT_LIMIT), for the CSV export. */
  async exportRows(query: EnquiryQuery): Promise<Enquiry[]> {
    const rows = await this.db
      .select(withProject)
      .from(enquiries)
      .leftJoin(projects, eq(enquiries.projectId, projects.id))
      .where(this.where(query))
      .orderBy(desc(enquiries.createdAt), desc(enquiries.id))
      .limit(EXPORT_LIMIT);
    return rows.map((r) => toEnquiry(r.enquiry, r.projectType));
  }

  /** The dashboard filters, shared by the list and the export. */
  private where(query: EnquiryQuery, contacts = true): SQL | undefined {
    const filters: SQL[] = [];
    if (query.categoryId) {
      // The category itself, or any of its sub-categories.
      const subs = this.db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, query.categoryId));
      filters.push(or(eq(enquiries.categoryId, query.categoryId), inArray(enquiries.categoryId, subs))!);
    }
    if (query.listingId) filters.push(eq(enquiries.listingId, query.listingId));
    if (query.projectId) filters.push(eq(enquiries.projectId, query.projectId));
    // Real estate leads carry the button they came from; vendor enquiries do not.
    if (query.section) filters.push(query.section === 'real-estate' ? isNotNull(enquiries.source) : isNull(enquiries.source));
    if (query.leadStatus) filters.push(eq(enquiries.leadStatus, query.leadStatus));
    if (query.source) filters.push(eq(enquiries.source, query.source));
    if (query.projectType) {
      // Validated as text (the list lives in projects.ts); an unknown type matches no project.
      filters.push(inArray(enquiries.projectId, this.db.select({ id: projects.id }).from(projects).where(eq(projects.type, query.projectType as ProjectType))));
    }
    if (query.status) filters.push(query.status === 'unread' ? isNull(enquiries.readAt) : isNotNull(enquiries.readAt));
    if (query.from) filters.push(gte(enquiries.createdAt, istDayStart(query.from)));
    if (query.to) filters.push(lt(enquiries.createdAt, sql`${istDayStart(query.to)} + interval '1 day'`));
    if (query.q) {
      const term = likeTerm(query.q);
      const contactMatch = contacts ? [ilike(enquiries.mobile, term), ilike(enquiries.email, term)] : [];
      filters.push(or(ilike(enquiries.name, term), ...contactMatch, ilike(enquiries.listingName, term))!);
    }
    return filters.length ? and(...filters) : undefined;
  }

  async unreadCount(): Promise<UnreadCount> {
    const [{ unread }] = await this.db.select({ unread: count() }).from(enquiries).where(isNull(enquiries.readAt));
    return { unread };
  }

  /** New and unread leads per section, for the Leads tabs. */
  async sectionCounts(): Promise<LeadSectionCounts> {
    // Separate queries, so each reads only its own partial index instead of every lead.
    const perSection = async (filter: SQL) => {
      const realEstate = isNotNull(enquiries.source);
      const rows = await this.db.select({ realEstate, leads: count() }).from(enquiries).where(filter).groupBy(realEstate);
      return { realEstate: rows.find((r) => r.realEstate)?.leads ?? 0, wedding: rows.find((r) => !r.realEstate)?.leads ?? 0 };
    };
    const [isNew, unread] = await Promise.all([perSection(eq(enquiries.leadStatus, 'new')), perSection(isNull(enquiries.readAt))]);
    return { realEstate: { new: isNew.realEstate, unread: unread.realEstate }, wedding: { new: isNew.wedding, unread: unread.wedding } };
  }

  /** Marks one enquiry read (keeping the first time it was read) or unread again, and/or sets its follow-up stage. */
  async update(id: string, { read, leadStatus }: EnquiryUpdate): Promise<Enquiry> {
    const [row] = await this.db
      .update(enquiries)
      .set({
        ...(read !== undefined && { readAt: read ? sql`coalesce(${enquiries.readAt}, now())` : null }),
        ...(leadStatus && { leadStatus }),
      })
      .where(eq(enquiries.id, id))
      .returning();
    if (!row) throw new NotFoundException('Enquiry not found');
    const [project] = row.projectId ? await this.db.select({ type: projects.type }).from(projects).where(eq(projects.id, row.projectId)) : [];
    return toEnquiry(row, project?.type ?? null);
  }

  async markAllRead(): Promise<UnreadCount> {
    await this.db.update(enquiries).set({ readAt: sql`now()` }).where(isNull(enquiries.readAt));
    return { unread: 0 };
  }
}
