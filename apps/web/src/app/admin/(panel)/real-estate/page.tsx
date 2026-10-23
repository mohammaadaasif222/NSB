import type { Metadata } from "next";
import Link from "next/link";
import { Building2, IndianRupee, ListChecks, Plus, Users } from "lucide-react";
import {
  ADMIN_PROJECT_SORTS,
  type AdminProjectRow,
  type AdminSettings,
  LISTING_AREAS,
  LISTING_STATUSES,
  type Paginated,
  PROJECT_TYPES,
  type ProjectStats,
} from "@nsb/shared";
import { Kpi } from "@/components/admin/ui";
import { adminApi } from "@/lib/api";
import { ProjectFilters, type ProjectFilterValues } from "./project-filters";
import { ProjectsTable } from "./projects-table";
import { SideAdForm } from "./side-ad-form";

export const metadata: Metadata = { title: "Real Estate" };

const PAGE_SIZE = 8;
const DAY = 86_400_000;
const FILTER_STATUSES = [...LISTING_STATUSES, "expired"] as const;
const STATUSES = ["", ...FILTER_STATUSES] as const;
const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = { "": "All", live: "Live", draft: "Draft", hidden: "Hidden", expired: "Expired" };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const pick = <T extends string>(list: readonly T[], value: string): T | "" => ((list as readonly string[]).includes(value) ? (value as T) : "");

/** Days until a term ends (negative once it has ended). */
function daysLeft(termStart: string, months: number) {
  const end = new Date(`${termStart}T00:00:00+05:30`);
  end.setMonth(end.getMonth() + months);
  return Math.ceil((end.getTime() - Date.now()) / DAY);
}

/** Real estate projects and the project page sidebar ad, laid out as in the NSB Live Demo admin. */
export default async function RealEstatePage({ searchParams }: PageProps<"/admin/real-estate">) {
  const query = await searchParams;
  const tab = one(query.tab) === "sponsors" ? "sponsors" : "all";
  const values: ProjectFilterValues = {
    q: one(query.q).slice(0, 100),
    type: pick(PROJECT_TYPES, one(query.type)),
    area: pick(LISTING_AREAS, one(query.area)),
    status: pick(FILTER_STATUSES, one(query.status)),
    sort: pick(ADMIN_PROJECT_SORTS, one(query.sort)) || "new",
  };
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), sort: values.sort });
  for (const key of ["q", "type", "area", "status"] as const) if (values[key]) params.set(key, values[key]);
  const [stats, projects, settings] = await Promise.all([
    adminApi.get<ProjectStats>("/admin/projects/stats"),
    tab === "all" ? adminApi.get<Paginated<AdminProjectRow>>(`/admin/projects?${params}`) : null,
    tab === "sponsors" ? adminApi.get<AdminSettings>("/admin/settings") : null,
  ]);

  /** This page's URL with some filters changed; changing a filter goes back to page 1. */
  const href = (change: Partial<ProjectFilterValues> & { page?: number }) => {
    const next = { ...values, ...change };
    const sp = new URLSearchParams();
    for (const key of ["q", "type", "area", "status"] as const) if (next[key]) sp.set(key, next[key]);
    if (next.sort !== "new") sp.set("sort", next.sort);
    if (change.page && change.page > 1) sp.set("page", String(change.page));
    return `/admin/real-estate${sp.size ? `?${sp}` : ""}`;
  };

  const total = projects?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Real Estate</h2>
          <p>Each project has one listing and one advertiser (a builder or a broker). A broker can list many projects.</p>
        </div>
        <Link href="/admin/real-estate/new" className="a-btn">
          <Plus size={16} aria-hidden /> Add listing
        </Link>
      </div>

      <div className="a-kp">
        <Kpi label="Projects" value={stats.total} note="on NSB" icon={<Building2 size={18} aria-hidden />} />
        <Kpi label="Live" value={stats.live} note={`${stats.draft} in draft`} icon={<ListChecks size={18} aria-hidden />} />
        <Kpi label="Advertisers" value={stats.advertisers} note="builders and brokers" icon={<Users size={18} aria-hidden />} />
        <Kpi label="Leads" value={stats.leads} note="across all projects" icon={<IndianRupee size={18} aria-hidden />} />
      </div>

      <nav className="a-stp mb-4" aria-label="Real estate sections">
        <Link href="/admin/real-estate" aria-current={tab === "all" ? "page" : undefined}>
          All listings
        </Link>
        <Link href="/admin/real-estate?tab=sponsors" aria-current={tab === "sponsors" ? "page" : undefined}>
          Sponsors &amp; ads
        </Link>
      </nav>

      {settings && <SideAdForm ad={settings.projectSideAd} maxUploadBytes={settings.maxUploadBytes} />}

      {projects && (
        <>
          <ProjectFilters values={values}>
            {STATUSES.map((s) => (
              <Link key={s || "all"} href={href({ status: s })} className="a-chp" aria-current={values.status === s ? "true" : undefined}>
                {STATUS_LABEL[s]}
              </Link>
            ))}
          </ProjectFilters>

          <ProjectsTable
            key={JSON.stringify({ values, page })}
            projects={projects.items.map((p) => ({ ...p, daysLeft: daysLeft(p.termStart, p.termMonths) }))}
            empty={Object.values({ ...values, sort: "" }).some(Boolean) ? "No listings match these filters." : "No projects yet. Add the first listing."}
          />

          <nav className="a-pg" aria-label="Pagination">
            <span>
              Showing {first}–{last} of {total}
            </span>
            {pageCount > 1 && (
              <div>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={href({ page: p })} aria-current={p === page ? "page" : undefined}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </>
      )}
    </>
  );
}
