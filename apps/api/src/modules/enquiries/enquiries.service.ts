import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, lt, or, type SQL, sql } from 'drizzle-orm';
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
import { pageWindow } from '../../common/pagination.js';
import { ListingsService } from '../listings/listings.service.js';
import { type EnquiryNotice, NotificationsService } from '../notifications/notifications.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { projectLeadMessage } from './project-lead-message.js';

type Row = typeof enquiries.$inferSelect;

/** Most rows one export returns; narrow the filters for more. */
export const EXPORT_LIMIT = 10_000;

const toEnquiry = (r: Row, projectType: Enquiry['projectType'] = null): Enquiry => ({
  ...r,
  projectType,
  createdAt: r.createdAt.toISOString(),
  readAt: r.readAt?.toISOString() ?? null,
});

/** Leads with their project's type (real estate), for the Leads table. */
const withProject = { enquiry: enquiries, projectType: projects.type };

@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name);

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly listings: ListingsService,
    private readonly projects: ProjectsService,
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
    this.notify({
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
    });

    return enquiry;
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
      })
      .returning();
    const enquiry = toEnquiry(row);

    // Alerts go to NSB only: advertisers get the lead from NSB, not by email.
    this.notify({
      enquiry,
      listing: project && {
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
      },
    });

    return {
      id: enquiry.id,
      advertiserName: project?.advertiserName ?? null,
      phone: project?.phone ?? null,
      brochureUrl: project?.brochureUrl ?? null,
    };
  }

  /** The lead is saved; a failed alert must never lose it or fail the request. */
  private notify(notice: EnquiryNotice) {
    this.notifications
      .enquiryReceived(notice)
      .catch((err: unknown) => this.logger.error(`Alert failed for enquiry ${notice.enquiry.id}`, err));
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
        .orderBy(desc(enquiries.createdAt))
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
      .orderBy(desc(enquiries.createdAt))
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
    const n = (filter: SQL) => sql<number>`count(*) filter (where ${filter})`.mapWith(Number);
    const realEstate = isNotNull(enquiries.source);
    const wedding = isNull(enquiries.source);
    const isNew = eq(enquiries.leadStatus, 'new');
    const unread = isNull(enquiries.readAt);
    const [row] = await this.db
      .select({
        reNew: n(and(realEstate, isNew)!),
        reUnread: n(and(realEstate, unread)!),
        wNew: n(and(wedding, isNew)!),
        wUnread: n(and(wedding, unread)!),
      })
      .from(enquiries);
    return { realEstate: { new: row.reNew, unread: row.reUnread }, wedding: { new: row.wNew, unread: row.wUnread } };
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
