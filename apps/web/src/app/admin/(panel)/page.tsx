import Link from "next/link";
import {
  type AdminCategory,
  type AdminProjectRow,
  type Banner,
  DASHBOARD_RANGES,
  type DashboardStats,
  type Enquiry,
  type ListingSummary,
  type Paginated,
} from "@nsb/shared";
import { Bell, Building2, CalendarClock, ChevronRight, Heart, Home, IndianRupee, ListChecks, MessageSquareText, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ListingThumb, hueOf } from "@/components/admin/listing-thumb";
import { Kpi } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin-api";
import { ago, formatDate } from "@/lib/format";

const AMBER = "#F59E0B";
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function SectionRow({ href, icon, title, note }: { href: string; icon: ReactNode; title: string; note: string }) {
  return (
    <Link href={href} className="a-li">
      <span className="a-th" style={{ background: "var(--admin-accent)" }} aria-hidden>
        {icon}
      </span>
      <div>
        <b>{title}</b>
        <small>{note}</small>
      </div>
      <ChevronRight size={16} className="text-zinc-500" aria-hidden />
    </Link>
  );
}

/** A labelled horizontal bar; `parts` are stacked segments (real estate blue, wedding amber). */
function Bar({ label, value, max, parts, href }: { label: string; value: number; max: number; parts?: [number, number]; href?: string }) {
  const width = (n: number) => `${(n / Math.max(1, max)) * 100}%`;
  return (
    <div className="a-bar">
      <span title={label}>{href ? <Link href={href} className="hover:text-(--admin-accent)">{label}</Link> : label}</span>
      <div aria-hidden>
        {parts ? (
          <>
            <i style={{ width: width(parts[0]) }} />
            <i className="w" style={{ width: width(parts[1]) }} />
          </>
        ) : (
          <i style={{ width: width(value) }} />
        )}
      </div>
      <em>{value}</em>
    </div>
  );
}

/** Leads per day (or per week for 90 days), real estate and wedding stacked, as in the demo. */
function LeadsChart({ series, days }: { series: DashboardStats["series"]; days: number }) {
  const max = Math.max(1, ...series.map((b) => b.realEstate + b.wedding));
  const bw = 560 / series.length;
  const gap = Math.min(8, bw * 0.25);
  const every = series.length > 14 ? 5 : series.length > 7 ? 4 : 1;
  const unit = days === 90 ? "week to" : "on";
  return (
    <svg viewBox="0 0 560 200" style={{ width: "100%", height: "auto" }} role="img" aria-label={`Leads over the last ${days} days`}>
      <g stroke="var(--admin-line)">
        <line x1="0" y1="160" x2="560" y2="160" />
        <line x1="0" y1="110" x2="560" y2="110" strokeDasharray="3 4" />
        <line x1="0" y1="60" x2="560" y2="60" strokeDasharray="3 4" />
      </g>
      {series.map((b, i) => {
        const x = i * bw + gap / 2;
        const w = bw - gap;
        const hr = (b.realEstate / max) * 130;
        const hw = (b.wedding / max) * 130;
        const label = shortDate(b.end);
        return (
          <g key={b.end}>
            <rect x={x} y={160 - hr} width={w} height={hr} rx="3" fill="var(--admin-accent)">
              <title>{`${unit} ${label}: ${b.realEstate} real estate`}</title>
            </rect>
            <rect x={x} y={160 - hr - hw} width={w} height={hw} rx="3" fill={AMBER}>
              <title>{`${unit} ${label}: ${b.wedding} wedding`}</title>
            </rect>
            {i % every === 0 && (
              <text x={x + w / 2} y="180" textAnchor="middle" fontSize="10" fill="var(--admin-muted)">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** The demo's dashboard (KPIs, leads chart, sections, latest leads) with more panels below it. */
export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const requested = Number(one((await searchParams).days));
  const days = (DASHBOARD_RANGES as readonly number[]).includes(requested) ? requested : 7;

  const [stats, categories, banners, latest, draftListings, draftProjects] = await Promise.all([
    adminApi.get<DashboardStats>(`/admin/dashboard?days=${days}`),
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<Banner[]>("/admin/banners"),
    adminApi.get<Paginated<Enquiry>>("/admin/enquiries?pageSize=6"),
    adminApi.get<Paginated<ListingSummary>>("/admin/listings?pageSize=4&status=draft"),
    adminApi.get<Paginated<AdminProjectRow>>("/admin/projects?pageSize=4&status=draft"),
  ]);

  const { listings, projects, leads } = stats;
  const topLevel = categories.filter((c) => !c.parentId);
  const wedding = topLevel.find((c) => c.slug === "wedding");
  const weddingSubs = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];
  const liveAll = listings.live + projects.live;
  const totalAll = listings.total + projects.total;
  const maxSource = Math.max(1, ...stats.topSources.map((s) => s.count));
  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.count));
  const maxArea = Math.max(1, ...stats.byArea.map((a) => a.listings + a.projects));
  const drafts = [
    ...draftListings.items.map((l) => ({ id: l.id, name: l.name, image: l.coverImageUrl, note: `${l.category.name} · ${l.area}`, href: `/admin/listings/${l.id}` })),
    ...draftProjects.items.map((p) => ({ id: p.id, name: p.name, image: p.coverImageUrl, note: `Real Estate · ${p.area}`, href: `/admin/real-estate/${p.id}` })),
  ];
  const draftTotal = draftListings.total + draftProjects.total;

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Welcome back</h2>
          <p>A quick look at Noida, Greater Noida and Greater Noida West.</p>
        </div>
      </div>

      <div className="a-kp">
        <Kpi label="Live listings" value={liveAll} note={`of ${totalAll} total`} icon={<ListChecks size={18} aria-hidden />} />
        <Kpi
          label={`Leads, last ${days} days`}
          value={leads.inRange}
          note={`${leads.realEstate} real estate · ${leads.wedding} wedding`}
          icon={<Users size={18} aria-hidden />}
        />
        <Kpi label="New leads" value={leads.unread} note="waiting for follow-up" icon={<Bell size={18} aria-hidden />} />
        <Kpi
          label="Real estate plans"
          value={inr(projects.activeTerms * stats.realEstatePlanPrice)}
          note={`${projects.activeTerms} active at ${inr(stats.realEstatePlanPrice)} a year`}
          icon={<IndianRupee size={18} aria-hidden />}
        />
      </div>

      <div className="a-kp">
        <Kpi label="Leads today" value={leads.today} note={`${leads.total} leads in total`} icon={<MessageSquareText size={18} aria-hidden />} />
        <Kpi label="Wedding vendors" value={listings.live} note={`${listings.draft} draft · ${listings.hidden} hidden`} icon={<Heart size={18} aria-hidden />} />
        <Kpi label="Real estate projects" value={projects.live} note={`${projects.draft} draft · ${projects.hidden} hidden`} icon={<Building2 size={18} aria-hidden />} />
        <Kpi label="Featured listings" value={listings.featured} note="shown first and on the home page" icon={<Star size={18} aria-hidden />} />
      </div>

      <div className="a-g2">
        <div className="a-card">
          <h3>
            Leads
            <span className="a-rg">
              {DASHBOARD_RANGES.map((d) => (
                <Link key={d} href={d === 7 ? "/admin" : `/admin?days=${d}`} className="a-chp" aria-current={d === days ? "true" : undefined} scroll={false}>
                  {d}D
                </Link>
              ))}
            </span>
          </h3>
          <LeadsChart series={stats.series} days={days} />
          <div className="a-lgd">
            <span>
              <i style={{ background: "var(--admin-accent)" }} />
              Real Estate
            </span>
            <span>
              <i style={{ background: AMBER }} />
              Wedding
            </span>
            {days === 90 && <span>One bar per week</span>}
          </div>
        </div>
        <div className="a-card">
          <h3>Sections</h3>
          <SectionRow
            href="/admin/home"
            icon={<Home size={17} aria-hidden />}
            title="Home page"
            note={`${banners.filter((b) => b.isActive).length} hero banners live · ${topLevel.filter((c) => c.isActive).length} of ${topLevel.length} categories visible`}
          />
          <SectionRow
            href="/admin/wedding"
            icon={<Heart size={17} aria-hidden />}
            title="Wedding"
            note={`${listings.live} live listings · ${weddingSubs.length} sub-categories`}
          />
          <SectionRow
            href="/admin/real-estate"
            icon={<Building2 size={17} aria-hidden />}
            title="Real Estate"
            note={`${projects.live} live projects · ${projects.activeTerms} active plans`}
          />
          <SectionRow
            href="/admin/enquiries"
            icon={<MessageSquareText size={17} aria-hidden />}
            title="Enquiries"
            note={`${leads.unread} unread · ${leads.total} in total`}
          />
        </div>
      </div>

      <div className="a-g2b mb-4">
        <div className="a-card">
          <h3>Top lead sources, last {days} days</h3>
          {stats.topSources.length ? (
            stats.topSources.map((s) => (
              <Bar
                key={`${s.kind}-${s.id ?? s.name}`}
                label={s.name}
                value={s.count}
                max={maxSource}
                parts={s.kind === "project" ? [s.count, 0] : [0, s.count]}
                href={s.id ? (s.kind === "project" ? `/admin/enquiries?section=real-estate&project=${s.id}` : `/admin/enquiries?section=wedding&listing=${s.id}`) : undefined}
              />
            ))
          ) : (
            <p className="text-zinc-500">No leads in this period.</p>
          )}
        </div>
        <div className="a-card">
          <h3>Leads by category, last {days} days</h3>
          {stats.byCategory.length ? (
            stats.byCategory.map((c) => <Bar key={c.name} label={c.name} value={c.count} max={maxCategory} />)
          ) : (
            <p className="text-zinc-500">No leads in this period.</p>
          )}
        </div>
      </div>

      <div className="a-g2b mb-4">
        <div className="a-card">
          <h3>Live listings by location</h3>
          {stats.byArea.map((a) => (
            <Bar key={a.area} label={a.area} value={a.listings + a.projects} max={maxArea} parts={[a.projects, a.listings]} />
          ))}
          <div className="a-lgd">
            <span>
              <i style={{ background: "var(--admin-accent)" }} />
              Real estate projects
            </span>
            <span>
              <i style={{ background: AMBER }} />
              Wedding vendors
            </span>
          </div>
        </div>
        <div className="a-card">
          <h3>
            Real estate terms ending <Link href="/admin/real-estate?sort=exp">View all</Link>
          </h3>
          {stats.expiring.length ? (
            stats.expiring.map((p) => (
              <div key={p.id} className="a-li">
                <span className="a-th" style={{ background: p.daysLeft < 0 ? "var(--admin-red)" : AMBER }} aria-hidden>
                  <CalendarClock size={17} />
                </span>
                <div>
                  <b>{p.name}</b>
                  <small>
                    {p.advertiserName} · ends {formatDate(p.termEnd)}
                  </small>
                </div>
                <span className={`a-pl ${p.daysLeft < 0 ? "hidden" : "draft"}`}>{p.daysLeft < 0 ? "Ended" : `${p.daysLeft} days left`}</span>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No live project’s term ends in the next 30 days.</p>
          )}
        </div>
      </div>

      <div className="a-g2b">
        <div className="a-card">
          <h3>Needs attention {draftTotal > drafts.length && <small className="text-zinc-500">{draftTotal} drafts in all</small>}</h3>
          {drafts.length ? (
            drafts.map((d) => (
              <div key={d.id} className="a-li">
                <ListingThumb name={d.name} imageUrl={d.image} />
                <div>
                  <b>{d.name}</b>
                  <small>Draft · {d.note}</small>
                </div>
                <Link href={d.href} className="a-btn s">
                  Review
                </Link>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">All clear. Nothing needs attention.</p>
          )}
        </div>
        <div className="a-card">
          <h3>
            Latest leads <Link href="/admin/enquiries">View all</Link>
          </h3>
          {latest.items.length ? (
            latest.items.map((e) => {
              const realEstate = !!e.source;
              return (
                <div key={e.id} className="a-li">
                  <span className="a-th" style={{ background: `hsl(${hueOf(e.name)} 55% 45%)` }} aria-hidden>
                    {e.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <b>{e.name}</b>
                    <small>
                      {e.source ?? e.categoryName} · {e.listingName}
                    </small>
                  </div>
                  <span className={`a-pl ${realEstate ? "new" : "draft"}`}>{realEstate ? "Real Estate" : "Wedding"}</span>
                  <small className="whitespace-nowrap">{ago(e.createdAt)}</small>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-500">No enquiries yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
