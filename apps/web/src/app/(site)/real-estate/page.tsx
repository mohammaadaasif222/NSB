import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { POSSESSION_STATUSES, type Paginated, type ProjectLocality, type ProjectSummary, REAL_ESTATE_SLUG } from "@nsb/shared";
import { pageItems } from "@/components/site/pagination";
import { LeadButton, LeadProvider } from "@/components/site/real-estate/lead-dialog";
import { SortSelect } from "@/components/site/real-estate/listing-widgets";
import { AdStrip, ProjectCard, PromoStrip, ShortsStrip } from "@/components/site/real-estate/project-card";
import { api } from "@/lib/api";
import { getCategory } from "@/lib/catalog";
import { COMING_SOON_METADATA, CATEGORY_PAGES_ENABLED } from "@/lib/flags";
import { locationPlace, withLocation } from "@/lib/location";
import { getSiteLocation } from "@/lib/location-server";

/** Real estate listing page, as in the NSB Live Demo: filter chips, project cards and a sidebar. */

const PAGE_SIZE = 12;
const BHK = [
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK+" },
] as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

export async function generateMetadata(): Promise<Metadata> {
  if (!CATEGORY_PAGES_ENABLED) return COMING_SOON_METADATA;
  const place = locationPlace(await getSiteLocation());
  return {
    title: `New Projects in ${place}`,
    description: `Verified builder projects in ${place}: apartments, villas and plots with prices, floor plans, photos and videos. View the builder's number on Noida Super Bazaar.`,
  };
}

export default async function RealEstatePage({ searchParams }: PageProps<"/real-estate">) {
  const query = await searchParams;
  const bhk = BHK.some((b) => b.value === one(query.bhk)) ? one(query.bhk) : "";
  const possession = (POSSESSION_STATUSES as readonly string[]).includes(one(query.possession)) ? one(query.possession) : "";
  const sort = ["lo", "hi"].includes(one(query.sort)) ? one(query.sort) : "rel";
  const q = one(query.q).slice(0, 100);
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);

  // 404 while Real Estate is switched off in the admin.
  const [, location] = await Promise.all([getCategory(REAL_ESTATE_SLUG), getSiteLocation()]);
  const params = withLocation(new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) }), location);
  if (bhk) params.set("bhk", bhk);
  if (possession) params.set("possession", possession);
  if (sort !== "rel") params.set("sort", sort);
  if (q) params.set("q", q);
  const [result, localities] = await Promise.all([
    api.get<Paginated<ProjectSummary>>(`/projects?${params}`),
    api.get<ProjectLocality[]>(`/projects/localities${location ? `?${new URLSearchParams({ area: location.area })}` : ""}`),
  ]);
  const place = locationPlace(location);
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  /** This page with some filters changed; changing a filter goes back to page 1. */
  const href = (change: { bhk?: string; possession?: string; q?: string; page?: number }) => {
    const next = { bhk, possession, q, ...change };
    const sp = new URLSearchParams();
    if (next.bhk) sp.set("bhk", next.bhk);
    if (next.possession) sp.set("possession", next.possession);
    if (sort !== "rel") sp.set("sort", sort);
    if (next.q) sp.set("q", next.q);
    if (change.page && change.page > 1) sp.set("page", String(change.page));
    return `/real-estate${sp.size ? `?${sp}` : ""}`;
  };

  const cards = result.items.flatMap((project, i) => {
    const card = <ProjectCard key={project.id} project={project} />;
    if (i === 2) return [card, <AdStrip key="ad" />];
    if (i === 5) return [card, <ShortsStrip key="shorts" />];
    if (i === 8) return [card, <PromoStrip key="promo" />];
    return [card];
  });

  return (
    <div className="re">
      <LeadProvider>
        <div className="re-w">
          <nav className="re-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › <Link href="/real-estate">Real Estate</Link> › <span aria-current="page">{place}</span>
          </nav>
          <div className="re-head">
            <div>
              <h1>New Projects in {place}</h1>
              <p className="re-sub">
                {result.total} verified builder project{result.total === 1 ? "" : "s"} · every project has its own page with photos, videos and full
                details
              </p>
            </div>
            <form action="/real-estate" className="re-search" role="search">
              {bhk && <input type="hidden" name="bhk" value={bhk} />}
              {possession && <input type="hidden" name="possession" value={possession} />}
              {sort !== "rel" && <input type="hidden" name="sort" value={sort} />}
              <Search size={18} strokeWidth={1.7} aria-hidden />
              <input name="q" type="search" defaultValue={q} placeholder="Search project, builder, sector or tag" aria-label="Search projects" maxLength={100} />
            </form>
          </div>

          <div className="re-fb">
            <Link href={href({ bhk: "" })} className="re-chip" aria-current={!bhk ? "true" : undefined}>
              All
            </Link>
            {BHK.map((b) => (
              <Link key={b.value} href={href({ bhk: b.value })} className="re-chip" aria-current={bhk === b.value ? "true" : undefined}>
                {b.label}
              </Link>
            ))}
            {POSSESSION_STATUSES.map((s) => (
              <Link key={s} href={href({ possession: possession === s ? "" : s })} className="re-chip" aria-current={possession === s ? "true" : undefined}>
                {s}
              </Link>
            ))}
            {q && (
              <Link href={href({ q: "" })} className="re-chip" aria-current="true" aria-label={`Clear search ${q}`}>
                “{q}” ×
              </Link>
            )}
            <span className="re-sp" />
            <SortSelect value={sort} />
          </div>

          <div className="re-grid">
            <section aria-label="Projects">
              {cards.length > 0 ? cards : <div className="re-empty">No projects match these filters yet.</div>}
              {result.items.length > 0 && result.items.length <= 2 && <AdStrip />}
              {pageCount > 1 && (
                <nav className="re-pg" aria-label="Pagination">
                  {pageItems(page, pageCount).map((p, i) =>
                    p === "gap" ? (
                      <span key={`gap-${i}`} aria-hidden>
                        …
                      </span>
                    ) : p === page ? (
                      <span key={p} aria-current="page">
                        {p}
                      </span>
                    ) : (
                      <Link key={p} href={href({ page: p })} aria-label={`Page ${p}`}>
                        {p}
                      </Link>
                    ),
                  )}
                </nav>
              )}
            </section>

            <aside className="re-aside">
              <div>
                <h4>Location Sponsor</h4>
                <a className="re-sbn" href="#">
                  <Image src="/images/real-estate/ad-skyline.jpg" alt="" fill sizes="254px" />
                  <span className="stg">SPONSORED</span>
                  <b>Your brand, on every {place} search</b>
                  <small>One sponsor per location. Limited slot.</small>
                  <span className="bt">Book this slot</span>
                </a>
              </div>
              {localities.length > 0 && (
                <div>
                  <h4>Popular localities</h4>
                  <ul>
                    {localities.slice(0, 4).map((l) => (
                      <li key={l.name}>
                        <Link href={href({ q: l.name })}>{l.name}</Link>
                        <span>
                          {l.count} project{l.count === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h4>Need help choosing?</h4>
                <p style={{ color: "var(--re-mute)", fontSize: 13, margin: "0 0 12px" }}>Talk to the NSB team for a shortlist.</p>
                <LeadButton advertiser="NSB Team" source="Callback" className="re-btn re-full">
                  Get a callback
                </LeadButton>
              </div>
            </aside>
          </div>
        </div>
      </LeadProvider>
    </div>
  );
}
