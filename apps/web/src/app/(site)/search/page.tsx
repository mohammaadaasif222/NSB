import type { Metadata } from "next";
import Link from "next/link";
import type { ListingSummary, Paginated, ProjectSummary } from "@nsb/shared";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Pagination } from "@/components/site/pagination";
import { categoryHit, listingHit, matchCategories, projectHit, SearchHitRow } from "@/components/site/search-hit";
import { api } from "@/lib/api";
import { getSearchCategories } from "@/lib/catalog";
import { locationPlace, withLocation } from "@/lib/location";
import { getSiteLocation } from "@/lib/location-server";
import { pageParam } from "@/lib/paging";
import { one, pageCountOf } from "@/lib/search-params";

/** Every match for the header's search: categories, then vendors or projects, a page at a time. */

type Props = PageProps<"/search">;

const PAGE_SIZE = 20;
const TABS = { vendors: "Vendors", projects: "Projects" } as const;
type Tab = keyof typeof TABS;

const queryOf = (raw: string | undefined) => raw?.trim().slice(0, 100) ?? "";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = queryOf(one((await searchParams).q));
  // Result pages are endless and change daily: not for search engines.
  return { title: q ? `Search results for “${q}”` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await searchParams;
  const q = queryOf(one(query.q));
  const page = pageParam(one(query.page));
  const location = await getSiteLocation();

  // Links always name their tab, so `page` belongs to the tab in the URL (vendors when none).
  const pagedTab = tabParam(one(query.tab)) ?? "vendors";
  const params = (t: Tab) => withLocation(new URLSearchParams({ q, page: String(t === pagedTab ? page : 1), pageSize: String(PAGE_SIZE) }), location);
  const [listings, projects, categories] = q
    ? await Promise.all([
        api.get<Paginated<ListingSummary>>(`/listings?${params("vendors")}`),
        api.get<Paginated<ProjectSummary>>(`/projects?${params("projects")}`),
        getSearchCategories(),
      ])
    : [null, null, []];

  const counts: Record<Tab, number> = { vendors: listings?.total ?? 0, projects: projects?.total ?? 0 };
  // The chosen tab, or the first with results.
  const tab: Tab = tabParam(one(query.tab)) ?? (counts.vendors || !counts.projects ? "vendors" : "projects");
  const current = tab === "vendors" ? listings : projects;
  const hits = (tab === "vendors" ? listings?.items.map(listingHit) : projects?.items.map(projectHit))?.filter((h) => h !== null) ?? [];
  const matchedCategories = matchCategories(categories, q, 12);
  const href = (next: { tab?: Tab; page?: number }) => {
    const p = new URLSearchParams({ q, tab: next.tab ?? tab });
    if ((next.page ?? 1) > 1) p.set("page", String(next.page));
    return `/search?${p}`;
  };

  return (
    <div className="container-home px-4 py-6 sm:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{q ? <>Results for “{q}”</> : "Search"}</h1>
      {!q ? (
        <p className="mt-4 text-muted">Type a business, service or project in the search box above.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            {counts.vendors + counts.projects} matching vendors and projects in {location ? locationPlace(location) : "all locations"}
          </p>

          {matchedCategories.length > 0 && (
            <section className="mt-6" aria-label="Categories">
              <h2 className="text-sm font-semibold text-ink-soft">Categories</h2>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {matchedCategories.map((c) => {
                  const hit = categoryHit(c);
                  return (
                    <li key={hit.key}>
                      <SearchHitRow hit={hit} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <nav className="mt-8 flex gap-2 border-b border-[#e5e7eb]" aria-label="Result type">
            {(Object.keys(TABS) as Tab[]).map((t) => (
              <Link
                key={t}
                href={href({ tab: t })}
                aria-current={t === tab ? "page" : undefined}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${t === tab ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
              >
                {TABS[t]} ({counts[t]})
              </Link>
            ))}
          </nav>

          {hits.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-[#e5e7eb] px-4 py-16 text-center text-muted">
              No {TABS[tab].toLowerCase()} match “{q}”. Try a different word or a shorter one.
            </p>
          ) : (
            <ul className="mt-4 grid gap-1 lg:grid-cols-2">
              {hits.map((hit) => (
                <li key={hit.key}>
                  <SearchHitRow hit={hit} />
                </li>
              ))}
            </ul>
          )}
          {current && <Pagination page={page} pageCount={pageCountOf(current.total, current.pageSize)} href={(p) => href({ page: p })} />}
        </>
      )}
    </div>
  );
}

function tabParam(value: string | undefined): Tab | undefined {
  return value === "vendors" || value === "projects" ? value : undefined;
}
