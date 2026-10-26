import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { type AdminCategory, type Enquiry, LEAD_STATUSES, type LeadSectionCounts, type LeadStatus, type Paginated, PROJECT_LEAD_SOURCES, PROJECT_TYPES } from "@nsb/shared";
import { Can } from "@/components/admin/admin-role";
import { Pagination } from "@/components/admin/ui";
import { adminApi, isUuid } from "@/lib/api";
import { type LeadFilterValues, LeadFilters } from "./lead-filters";
import { LeadsTable } from "./leads-table";
import { MarkAllReadButton } from "./mark-all-read-button";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;
const SECTIONS = [
  { key: "real-estate", label: "Real Estate", count: "realEstate" },
  { key: "wedding", label: "Wedding", count: "wedding" },
] as const;
const STATUS_LABEL: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", won: "Won", lost: "Lost" };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const pick = <T extends string>(list: readonly T[], value: string): T | "" => ((list as readonly string[]).includes(value) ? (value as T) : "");

/** Reads the filters from the URL, dropping anything malformed instead of failing the page. */
function readFilters(query: Record<string, string | string[] | undefined>, counts: LeadSectionCounts): LeadFilterValues {
  const [from, to] = [one(query.from), one(query.to)];
  const asked = one(query.section);
  // Without a section (the bell, alert emails): the one with unread leads, Real Estate first.
  const section =
    asked === "wedding" || asked === "real-estate" ? asked : !counts.realEstate.unread && counts.wedding.unread ? "wedding" : "real-estate";
  return {
    section,
    q: one(query.q).slice(0, 100),
    category: section === "wedding" && isUuid(one(query.category)) ? one(query.category) : "",
    type: section === "real-estate" ? pick(PROJECT_TYPES, one(query.type)) : "",
    source: section === "real-estate" ? pick(PROJECT_LEAD_SOURCES, one(query.source)) : "",
    leadStatus: pick(LEAD_STATUSES, one(query.leadStatus)),
    status: one(query.status) === "unread" ? "unread" : "",
    from: isDate(from) ? from : "",
    to: isDate(to) ? to : "",
  };
}

/** Leads, kept separate per section as in the NSB Live Demo admin. */
export default async function LeadsPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const query = await searchParams;
  const counts = await adminApi.get<LeadSectionCounts>("/admin/enquiries/sections");
  // The lead counts in Real Estate and Wedding link here with one project or listing.
  const projectId = isUuid(one(query.project)) ? one(query.project) : "";
  const listingId = isUuid(one(query.listing)) ? one(query.listing) : "";
  const filters = readFilters({ ...query, ...(projectId && { section: "real-estate" }), ...(listingId && { section: "wedding" }) }, counts);
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);

  // The API's parameter names.
  const params = new URLSearchParams({ section: filters.section, page: String(page), pageSize: String(PAGE_SIZE) });
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("categoryId", filters.category);
  if (filters.type) params.set("projectType", filters.type);
  if (filters.source) params.set("source", filters.source);
  if (filters.leadStatus) params.set("leadStatus", filters.leadStatus);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (projectId) params.set("projectId", projectId);
  if (listingId) params.set("listingId", listingId);

  const [leads, categories] = await Promise.all([
    adminApi.get<Paginated<Enquiry>>(`/admin/enquiries?${params}`),
    adminApi.get<AdminCategory[]>("/admin/categories"),
  ]);
  const wedding = categories.find((c) => !c.parentId && c.slug === "wedding");
  const subCategories = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];

  /** This page's URL with some filters changed; changing a filter goes back to page 1. */
  const href = (change: Partial<LeadFilterValues> & { page?: number }) => {
    const { page: nextPage, ...next } = { ...filters, ...change };
    const sp = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    if (projectId) sp.set("project", projectId);
    if (listingId) sp.set("listing", listingId);
    if (nextPage && nextPage > 1) sp.set("page", String(nextPage));
    return `/admin/enquiries?${sp}`;
  };
  // A new section starts with no other filters.
  const sectionHref = (section: LeadFilterValues["section"]) => `/admin/enquiries?section=${section}`;

  const filtered = Object.entries(filters).some(([k, v]) => k !== "section" && v) || !!projectId || !!listingId;
  const exportQuery = new URLSearchParams([...params].filter(([k]) => k !== "page" && k !== "pageSize")).toString();
  const pageCount = Math.max(1, Math.ceil(leads.total / PAGE_SIZE));

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Leads</h2>
          <p>Leads are kept separate for each section. More sections will appear here as they open.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="leadContacts">
            {/* The browser downloads the file; the session cookie goes with the same-origin request. */}
            <a href={`/api/admin/enquiries/export?${exportQuery}`} download className="a-btn g">
              <Download size={16} aria-hidden /> Export to Excel
            </a>
          </Can>
          <MarkAllReadButton />
        </div>
      </div>

      <nav className="a-stp mb-4" aria-label="Sections">
        {SECTIONS.map((s) => (
          <Link key={s.key} href={sectionHref(s.key)} aria-current={filters.section === s.key ? "page" : undefined}>
            {s.label} <span className="opacity-75">· {counts[s.count].new} new</span>
          </Link>
        ))}
      </nav>

      <LeadFilters values={filters} subCategories={subCategories}>
        <Link href={href({ leadStatus: "", status: "" })} className="a-chp" aria-current={!filters.leadStatus && !filters.status ? "true" : undefined}>
          All
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} href={href({ leadStatus: s, status: "" })} className="a-chp" aria-current={filters.leadStatus === s ? "true" : undefined}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
        <Link href={href({ status: filters.status ? "" : "unread" })} className="a-chp" aria-current={filters.status ? "true" : undefined}>
          Unread
        </Link>
      </LeadFilters>

      {(projectId || listingId) && (
        <p className="a-info mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          Showing the leads of {leads.items[0]?.listingName ?? (projectId ? "one project" : "one listing")}.
          <Link href={sectionHref(filters.section)} className="font-semibold text-(--admin-accent) hover:underline">
            Show all leads
          </Link>
        </p>
      )}

      <LeadsTable
        key={params.toString()}
        leads={leads.items}
        section={filters.section}
        empty={filtered ? "No leads match." : `No ${filters.section === "wedding" ? "wedding" : "real estate"} leads yet.`}
      />
      <nav className="a-pg" aria-label="Lead count">
        <span>
          {leads.total} {filtered ? "matching leads" : "leads"}, newest first
        </span>
      </nav>
      <Pagination page={page} pageCount={pageCount} href={(p) => href({ page: p })} />
    </>
  );
}
