import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, ne, or, type SQL, sql } from 'drizzle-orm';
import {
  type AdminProject,
  type AdminProjectQuery,
  type AdminProjectRow,
  type Paginated,
  type SitemapEntry,
  type ProjectDetail,
  type ProjectDuplicate,
  type ProjectInput,
  type ProjectLocality,
  projectNameKey,
  type ProjectQuery,
  type ProjectStats,
  type ProjectSummary,
  type ProjectUpdate,
  REAL_ESTATE_SLUG,
} from '@nsb/shared';
import { DB, type Database, type Tx } from '../../db/db.module.js';
import { categories, enquiries, projects } from '../../db/schema.js';
import { without } from '../../common/columns.js';
import { rethrowDbError } from '../../common/db-errors.js';
import { istToday } from '../../common/dates.js';
import { searchMatch } from '../../common/like.js';
import { pageWindow } from '../../common/pagination.js';
import { MediaService } from '../media/media.service.js';
import { projectImages, projectValues, termEnd } from './project-values.js';

type Row = typeof projects.$inferSelect;

/** Columns a card has no use for: long text, and the advertiser's private contacts. */
const NOT_ON_CARDS = [
  'about',
  'highlights',
  'amenities',
  'specifications',
  'nearby',
  'advertiser',
  'faqs',
  'videoUrl',
  'videoChapters',
  'videos',
  'phone',
  'brochureUrl',
  'metaTitle',
  'metaDescription',
] as const;
const cardColumns = without(getTableColumns(projects), NOT_ON_CARDS);
type CardRow = Omit<Row, (typeof NOT_ON_CARDS)[number]>;

/** A sitemap file holds at most 50,000 addresses; listings take most of them. */
const SITEMAP_LIMIT = 4_000;

/** Priced configurations shown on a card. */
const CARD_CONFIGURATIONS = 3;
const SIMILAR_COUNT = 3;
const POPULAR_LOCALITIES = 6;

/** Public pages show a project only while it is Live and the Real Estate category is active. */
const visible = and(
  eq(projects.status, 'live'),
  sql`exists (select 1 from ${categories} where ${categories.slug} = ${REAL_ESTATE_SLUG} and ${categories.isActive})`,
)!;

// Qualified by hand: in a select list Drizzle writes columns unqualified, and "id" would mean enquiries.id here.
const leadCount = sql<number>`(select count(*) from ${enquiries} where ${enquiries}.project_id = ${projects}.id)`.mapWith(Number);

/** Sectors are typed by hand, so "Sector 150" and " sector 150" are the same place. */
const localityKey = sql<string>`lower(btrim(${projects.locality}))`;

/** Photos in a card's slider on phones. */
const CARD_PHOTOS = 5;

const toSummary = (p: CardRow): ProjectSummary => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  builder: p.builder,
  advertiserName: p.advertiserName,
  advertiserType: p.advertiserType,
  type: p.type,
  area: p.area,
  locality: p.locality,
  isPremium: p.isPremium,
  isFeatured: p.isFeatured,
  possessionStatus: p.possessionStatus,
  possessionDate: p.possessionDate,
  reraId: p.reraId,
  minPrice: p.minPrice,
  keyConfigurations: p.configurations
    .filter((c) => c.price)
    .slice(0, CARD_CONFIGURATIONS)
    .map((c) => ({ title: c.title, superArea: c.superArea })),
  coverImageUrl: p.photos[0] ?? null,
  photoPreview: p.photos.slice(0, CARD_PHOTOS),
  status: p.status,
  createdAt: p.createdAt.toISOString(),
});

/** Everything the project page shows; the phone and brochure link stay private. */
const toPage = (p: Row) => ({
  ...toSummary(p),
  launchDate: p.launchDate,
  units: p.units,
  landArea: p.landArea,
  towers: p.towers,
  about: p.about,
  highlights: p.highlights,
  tags: p.tags,
  configurations: p.configurations,
  amenities: p.amenities,
  specifications: p.specifications,
  nearby: p.nearby,
  advertiser: p.advertiser,
  faqs: p.faqs,
  photos: p.photos,
  videoUrl: p.videoUrl,
  videoChapters: p.videoChapters,
  videos: p.videos,
  metaTitle: p.metaTitle,
  metaDescription: p.metaDescription,
  updatedAt: p.updatedAt.toISOString(),
});

/** The saved fields as form input, so a partial update can be merged and checked whole. */
const toInput = (p: Row): ProjectInput => ({
  type: p.type,
  area: p.area as ProjectInput['area'],
  name: p.name,
  builder: p.builder,
  locality: p.locality,
  reraId: p.reraId,
  possessionStatus: p.possessionStatus,
  possessionDate: p.possessionDate,
  launchDate: p.launchDate,
  isPremium: p.isPremium,
  isFeatured: p.isFeatured,
  tags: p.tags,
  units: p.units,
  landArea: p.landArea,
  towers: p.towers,
  about: p.about,
  highlights: p.highlights,
  configurations: p.configurations,
  amenities: p.amenities,
  specifications: p.specifications,
  nearby: p.nearby,
  advertiser: p.advertiser,
  faqs: p.faqs,
  photos: p.photos,
  videoUrl: p.videoUrl,
  videoChapters: p.videoChapters,
  videos: p.videos,
  brochureUrl: p.brochureUrl,
  phone: p.phone,
  termStart: p.termStart,
  termMonths: p.termMonths === 6 ? 6 : 12,
  status: p.status,
  metaTitle: p.metaTitle,
  metaDescription: p.metaDescription,
});

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly media: MediaService,
  ) {}

  /** The public listing page. */
  async list(query: ProjectQuery): Promise<Paginated<ProjectSummary>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const filters: SQL[] = [visible];
    if (query.area) filters.push(eq(projects.area, query.area));
    if (query.locality) filters.push(sql`${localityKey} = lower(${query.locality.trim()})`);
    if (query.possession) filters.push(eq(projects.possessionStatus, query.possession));
    if (query.bhk === '4') filters.push(sql`exists (select 1 from unnest(${projects.bedrooms}) as b(n) where b.n >= 4)`);
    else if (query.bhk) filters.push(sql`${Number(query.bhk)} = any(${projects.bedrooms})`);
    if (query.q) filters.push(this.search(query.q));
    const where = and(...filters);

    const order =
      query.sort === 'lo'
        ? [sql`${projects.minPrice} asc nulls last`, desc(projects.createdAt)]
        : query.sort === 'hi'
          ? [sql`${projects.minPrice} desc nulls last`, desc(projects.createdAt)]
          : [desc(projects.isPremium), desc(projects.createdAt)];

    const [rows, [{ total }]] = await Promise.all([
      this.db.select(cardColumns).from(projects).where(where).orderBy(...order, desc(projects.id)).limit(limit).offset(offset),
      this.db.select({ total: count() }).from(projects).where(where),
    ]);
    return { items: rows.map(toSummary), total, page, pageSize };
  }

  async sitemap(): Promise<SitemapEntry[]> {
    const rows = await this.db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(visible)
      .orderBy(desc(projects.updatedAt))
      .limit(SITEMAP_LIMIT);
    return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
  }

  async getBySlug(slug: string): Promise<ProjectDetail> {
    const [row] = await this.db.select().from(projects).where(and(eq(projects.slug, slug), visible));
    if (!row) throw new NotFoundException('Project not found');
    const similar = await this.db
      .select(cardColumns)
      .from(projects)
      .where(and(visible, eq(projects.area, row.area), ne(projects.id, row.id)))
      .orderBy(desc(projects.isPremium), desc(projects.createdAt))
      .limit(SIMILAR_COUNT);
    return { ...toPage(row), hasBrochure: !!row.brochureUrl, similar: similar.map(toSummary) };
  }

  /** Sectors with the most live projects in an area (or everywhere). */
  async localities(area?: string): Promise<ProjectLocality[]> {
    const rows = await this.db
      .select({ name: sql<string>`min(btrim(${projects.locality}))`, count: count() })
      .from(projects)
      .where(and(visible, area ? eq(projects.area, area) : undefined))
      .groupBy(localityKey)
      .orderBy(desc(count()), asc(sql`min(btrim(${projects.locality}))`))
      .limit(POPULAR_LOCALITIES);
    return rows;
  }

  /** A live project a visitor is enquiring about. */
  async forLead(id: string): Promise<Row> {
    const [row] = await this.db.select().from(projects).where(and(eq(projects.id, id), visible));
    if (!row) throw new NotFoundException('Project not found');
    return row;
  }

  async listAdmin(query: AdminProjectQuery): Promise<Paginated<AdminProjectRow>> {
    const { page, pageSize, limit, offset } = pageWindow(query.page, query.pageSize);
    const filters: SQL[] = [];
    if (query.type) filters.push(eq(projects.type, query.type));
    if (query.area) filters.push(eq(projects.area, query.area));
    if (query.status === 'expired') filters.push(sql`${termEnd} < ${istToday}`);
    else if (query.status) filters.push(eq(projects.status, query.status));
    if (query.q) filters.push(this.search(query.q));
    const where = filters.length ? and(...filters) : undefined;

    const order =
      query.sort === 'exp'
        ? [asc(termEnd), asc(projects.name)]
        : query.sort === 'lead'
          ? [desc(leadCount), desc(projects.createdAt)]
          : query.sort === 'az'
            ? [asc(projects.name)]
            : [desc(projects.createdAt)];

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({ project: projects, leadCount })
        .from(projects)
        .where(where)
        .orderBy(...order, desc(projects.id))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(projects).where(where),
    ]);
    return {
      items: rows.map((r) => ({ ...toSummary(r.project), termStart: r.project.termStart, termMonths: r.project.termMonths, leadCount: r.leadCount })),
      total,
      page,
      pageSize,
    };
  }

  async stats(): Promise<ProjectStats> {
    const [[row], [{ leads }]] = await Promise.all([
      this.db
        .select({
          total: count(),
          live: sql<number>`count(*) filter (where ${projects.status} = 'live')`.mapWith(Number),
          draft: sql<number>`count(*) filter (where ${projects.status} = 'draft')`.mapWith(Number),
          hidden: sql<number>`count(*) filter (where ${projects.status} = 'hidden')`.mapWith(Number),
          advertisers: sql<number>`count(distinct lower(btrim(${projects.advertiserName})))`.mapWith(Number),
          expiringSoon: sql<number>`count(*) filter (where ${projects.status} = 'live' and ${termEnd} between ${istToday} and ${istToday} + 30)`.mapWith(Number),
        })
        .from(projects),
      this.db.select({ leads: count() }).from(enquiries).where(sql`${enquiries.projectId} is not null`),
    ]);
    return { ...row, leads };
  }

  async getAdmin(id: string): Promise<AdminProject> {
    const [row] = await this.db.select({ project: projects, leadCount }).from(projects).where(eq(projects.id, id));
    if (!row) throw new NotFoundException('Project not found');
    const p = row.project;
    return { ...toPage(p), brochureUrl: p.brochureUrl, phone: p.phone, termStart: p.termStart, termMonths: p.termMonths, leadCount: row.leadCount };
  }

  /** The project already listed under this name in this area, if any. */
  async findDuplicate(name: string, area: string, excludeId?: string, db: Database | Tx = this.db): Promise<ProjectDuplicate | null> {
    const key = projectNameKey(name);
    if (!key) return null;
    const filters = [eq(projects.area, area), sql`regexp_replace(lower(${projects.name}), '[^a-z0-9]', '', 'g') = ${key}`];
    if (excludeId) filters.push(ne(projects.id, excludeId));
    const [row] = await db
      .select({ id: projects.id, name: projects.name, area: projects.area, advertiserName: projects.advertiserName, status: projects.status })
      .from(projects)
      .where(and(...filters))
      .limit(1);
    return row ?? null;
  }

  async create(input: ProjectInput): Promise<AdminProject> {
    const id = await this.db.transaction(async (tx) => {
      await this.assertUnique(input, undefined, tx);
      const slug = await this.freeSlug(input, tx);
      try {
        const [row] = await tx.insert(projects).values({ ...projectValues(input), slug }).returning({ id: projects.id });
        return row.id;
      } catch (err) {
        rethrowDbError(err, 'Project');
      }
    });
    return this.getAdmin(id);
  }

  async update(id: string, input: ProjectUpdate): Promise<AdminProject> {
    // Locks the row: a save at the same moment merges onto this one instead of undoing it.
    const { current, next } = await this.db.transaction(async (tx) => {
      const [row] = await tx.select().from(projects).where(eq(projects.id, id)).for('update');
      if (!row) throw new NotFoundException('Project not found');
      const next: ProjectInput = { ...toInput(row), ...input };
      if (next.name !== row.name || next.area !== row.area) await this.assertUnique(next, id, tx);
      // The slug stays as it was made on create, even when the name or area change, so links keep working.
      const { slug: _, ...values } = projectValues(next);
      try {
        await tx.update(projects).set(values).where(eq(projects.id, id));
      } catch (err) {
        rethrowDbError(err, 'Project');
      }
      return { current: row, next };
    });
    await this.media.release(projectImages(current), projectImages(next));
    return this.getAdmin(id);
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ photos: projects.photos, configurations: projects.configurations });
    if (!row) throw new NotFoundException('Project not found');
    await this.media.release(projectImages(row));
  }

  private search(q: string): SQL {
    return searchMatch([projects.name, projects.builder, projects.advertiserName, projects.locality], projects.tags, q);
  }

  /**
   * The new project's slug. The admin's own must be free; the one made from the name and area gets
   * "-2", "-3"… if a project renamed since still has it (slugs never change).
   */
  private async freeSlug(input: ProjectInput, tx: Tx): Promise<string> {
    const base = projectValues(input).slug;
    const taken = new Set(
      (await tx.select({ slug: projects.slug }).from(projects).where(or(eq(projects.slug, base), sql`${projects.slug} like ${`${base}-%`}`))).map(
        (r) => r.slug,
      ),
    );
    if (!taken.has(base)) return base;
    if (input.slug) {
      const message = `/real-estate/${base} is already used by another project. Choose another URL.`;
      throw new ConflictException({ statusCode: 409, message, issues: [{ path: 'slug', message }] });
    }
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  /**
   * One project, one listing: a second listing of the same project in the same area is refused.
   * Holds a lock on that name until the transaction ends, so two saves at once cannot both pass.
   */
  private async assertUnique(input: Pick<ProjectInput, 'name' | 'area'>, excludeId: string | undefined, tx: Tx) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`nsb:project:${input.area}:${projectNameKey(input.name)}`}))`);
    const dup = await this.findDuplicate(input.name, input.area, excludeId, tx);
    if (!dup) return;
    const message = `${dup.name} in ${dup.area} is already listed by ${dup.advertiserName}. One project can have only one listing.`;
    throw new ConflictException({ statusCode: 409, message, issues: [{ path: 'name', message }] });
  }
}
