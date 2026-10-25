import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, gte, isNull, type SQL, sql } from 'drizzle-orm';
import { type DashboardStats, LISTING_AREAS } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { enquiries, listings, projects } from '../../db/schema.js';
import { istDayStart, istToday } from '../../common/dates.js';
import { SettingsService } from '../settings/settings.service.js';

const DAY = 86_400_000;
const TOP = 5;
const EXPIRING_WITHIN_DAYS = 30;
const OTHER_AREAS = 'Other areas';

/** YYYY-MM-DD in India time, `days` before today. */
const istDate = (days = 0) => new Date(Date.now() + 5.5 * 3_600_000 - days * DAY).toISOString().slice(0, 10);
/** The India-time day a lead came in. */
const leadDay = sql<string>`to_char(${enquiries.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`;
/** Real estate leads carry the button they came from; vendor enquiries do not. */
const isRealEstate = sql<boolean>`(${enquiries.source} is not null)`;
/** A lead's listing or project; leads whose source was deleted fall back to the saved name. */
const sourceKey = sql`coalesce(${enquiries.projectId}::text, ${enquiries.listingId}::text, ${enquiries.listingName})`;
const termEnd = sql`(${projects.termStart} + make_interval(months => ${projects.termMonths}))::date`;
const countWhere = (filter: SQL) => sql<number>`count(*) filter (where ${filter})`.mapWith(Number);

/** The admin dashboard's figures. Counting happens in Postgres, not in the page. */
@Injectable()
export class DashboardService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly settings: SettingsService,
  ) {}

  async stats(days: 7 | 30 | 90): Promise<DashboardStats> {
    // 90 days show as 13 weekly bars, so that range covers 91 whole days.
    const span = days === 90 ? 91 : days;
    const inRange = gte(enquiries.createdAt, istDayStart(istDate(span - 1)));

    const [[listing], [project], [lead], perDay, top, byCategory, listingAreas, projectAreas, expiring, pricing] = await Promise.all([
      this.db
        .select({
          total: count(),
          live: countWhere(sql`${listings.status} = 'live'`),
          draft: countWhere(sql`${listings.status} = 'draft'`),
          hidden: countWhere(sql`${listings.status} = 'hidden'`),
          featured: countWhere(sql`${listings.isFeatured}`),
        })
        .from(listings),
      this.db
        .select({
          total: count(),
          live: countWhere(sql`${projects.status} = 'live'`),
          draft: countWhere(sql`${projects.status} = 'draft'`),
          hidden: countWhere(sql`${projects.status} = 'hidden'`),
          activeTerms: countWhere(sql`${projects.status} = 'live' and ${termEnd} >= ${istToday}`),
        })
        .from(projects),
      this.db
        .select({
          total: count(),
          unread: countWhere(isNull(enquiries.readAt)),
          today: countWhere(gte(enquiries.createdAt, istDayStart(istDate()))),
        })
        .from(enquiries),
      this.db.select({ day: leadDay, realEstate: isRealEstate, count: count() }).from(enquiries).where(inRange).groupBy(leadDay, isRealEstate),
      // One row per listing or project (renamed ones too); deleted ones are grouped by their saved name.
      this.db
        .select({
          name: sql<string>`(array_agg(${enquiries.listingName} order by ${enquiries.createdAt} desc))[1]`,
          projectId: enquiries.projectId,
          listingId: enquiries.listingId,
          realEstate: isRealEstate,
          count: count(),
        })
        .from(enquiries)
        .where(inRange)
        .groupBy(sourceKey, enquiries.projectId, enquiries.listingId, isRealEstate)
        .orderBy(desc(count()))
        .limit(TOP),
      this.db.select({ name: enquiries.categoryName, count: count() }).from(enquiries).where(inRange).groupBy(enquiries.categoryName).orderBy(desc(count())),
      this.db.select({ area: listings.area, count: count() }).from(listings).where(eq(listings.status, 'live')).groupBy(listings.area),
      this.db.select({ area: projects.area, count: count() }).from(projects).where(eq(projects.status, 'live')).groupBy(projects.area),
      this.db
        .select({
          id: projects.id,
          name: projects.name,
          advertiserName: projects.advertiserName,
          termEnd: sql<string>`to_char(${termEnd}, 'YYYY-MM-DD')`,
          daysLeft: sql<number>`(${termEnd} - ${istToday})`.mapWith(Number),
        })
        .from(projects)
        .where(and(eq(projects.status, 'live'), sql`${termEnd} <= ${istToday} + ${EXPIRING_WITHIN_DAYS}::int`))
        .orderBy(asc(termEnd))
        .limit(6),
      this.settings.pricing(),
    ]);

    // One bar per day, or per 7 days in the 90-day view; `end` is the bar's last day.
    const step = days === 90 ? 7 : 1;
    const series = Array.from({ length: span / step }, (_, i) => {
      const start = istDate(span - 1 - i * step);
      const end = istDate(span - (i + 1) * step);
      const bucket = perDay.filter((r) => r.day >= start && r.day <= end);
      const sum = (re: boolean) => bucket.filter((r) => r.realEstate === re).reduce((a, r) => a + r.count, 0);
      return { end, realEstate: sum(true), wedding: sum(false) };
    });
    const realEstate = series.reduce((a, b) => a + b.realEstate, 0);
    const wedding = series.reduce((a, b) => a + b.wedding, 0);

    // Older listings have free-text areas ("Sector 18, Noida"); they count under "Other areas".
    const known: readonly string[] = LISTING_AREAS;
    const areaCount = (rows: { area: string; count: number }[], area: string) =>
      rows.filter((r) => (known.includes(r.area) ? r.area : OTHER_AREAS) === area).reduce((a, r) => a + r.count, 0);
    const hasOther = [...listingAreas, ...projectAreas].some((r) => !known.includes(r.area));
    const areas = [...LISTING_AREAS, ...(hasOther ? [OTHER_AREAS] : [])];

    return {
      days,
      realEstatePlanPrice: pricing.realEstate,
      listings: listing,
      projects: project,
      leads: { inRange: realEstate + wedding, realEstate, wedding, ...lead },
      series,
      topSources: top.map((t) => ({ name: t.name, kind: t.realEstate ? 'project' : 'listing', id: t.projectId ?? t.listingId, count: t.count })),
      byCategory,
      byArea: areas.map((area) => ({ area, listings: areaCount(listingAreas, area), projects: areaCount(projectAreas, area) })),
      expiring,
    };
  }
}
