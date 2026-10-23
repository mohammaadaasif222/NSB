import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LayoutGrid, List, X } from "lucide-react";
import type { Category, ListingSummary, Paginated } from "@nsb/shared";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { BrowsePanel } from "@/components/site/listing/browse-panel";
import { ListingCard, type ListingView } from "@/components/site/listing/listing-card";
import { ListingSearch } from "@/components/site/listing/listing-search";
import { ClearLocationButton } from "@/components/site/location-picker";
import { Pagination } from "@/components/site/pagination";
import { api } from "@/lib/api";
import { browsePanels } from "@/lib/browse-panels";
import { getSiteSettings } from "@/lib/site-settings";
import { getCategory, listingPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED, COMING_SOON_METADATA } from "@/lib/flags";
import { locationLabel, locationPlace, withLocation } from "@/lib/location";
import { getListingCounts, getSiteLocation } from "@/lib/location-server";

/** Category listing page — one template for every sub-category, styled after WedMeGood. */

type Props = PageProps<"/[vertical]/[category]">;

/** Validates the URL: the category must be a sub-category of `vertical`. */
async function load(params: Props["params"]) {
  const { vertical, category: slug } = await params;
  const category = await getCategory(slug);
  if (!category.parent) notFound();
  if (category.parent.slug !== vertical) redirect(`/${category.parent.slug}/${category.slug}`);
  return { vertical: category.parent, category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!CATEGORY_PAGES_ENABLED) return COMING_SOON_METADATA;
  const { category } = await load(params);
  return {
    title: `${category.name} in Noida`,
    description: category.description ?? `Compare ${category.name.toLowerCase()} in Noida, Greater Noida and Noida Extension.`,
  };
}

/** Listings per page: featured first, then newest; the rest move to page 2, 3… */
const PAGE_SIZE = 10;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CategoryListingPage({ params, searchParams }: Props) {
  const { vertical, category } = await load(params);
  const query = await searchParams;
  const view: ListingView = one(query.view) === "grid" ? "grid" : "list";
  const page = Math.max(1, Number.parseInt(one(query.page) ?? "1", 10) || 1);
  const q = one(query.q)?.trim().slice(0, 100) || undefined;
  /** A browse-panel tag, e.g. "Luxury" or "Banquet Halls". */
  const tag = one(query.tag)?.trim().slice(0, 40) || undefined;

  const location = await getSiteLocation();
  const listingQuery = withLocation(new URLSearchParams({ category: category.slug, page: String(page), pageSize: String(PAGE_SIZE) }), location);
  if (q) listingQuery.set("q", q);
  if (tag) listingQuery.set("tag", tag);
  const [listings, siblings, counts, { listingSidebar }] = await Promise.all([
    api.get<Paginated<ListingSummary>>(`/listings?${listingQuery}`),
    api.get<Category[]>(`/categories?parent=${encodeURIComponent(vertical.slug)}`),
    getListingCounts(location, vertical.slug),
    getSiteSettings(),
  ]);
  const place = locationPlace(location);
  // Side cards as switched on in Admin › Settings; shown beside list view only.
  const panels = listingSidebar.enabled ? browsePanels(category.slug, category.name).filter((p) => listingSidebar[p.kind]) : [];
  const sidebar = view === "list" && panels.length > 0;

  const basePath = `/${vertical.slug}/${category.slug}`;
  const pageCount = Math.max(1, Math.ceil(listings.total / listings.pageSize));
  const href = (next: { view?: ListingView; page?: number; q?: string | null; tag?: string | null }) => {
    const sp = new URLSearchParams();
    const v = next.view ?? view;
    const p = next.page ?? page;
    const search = next.q === null ? undefined : (next.q ?? q);
    const t = next.tag === null ? undefined : (next.tag ?? tag);
    if (search) sp.set("q", search);
    if (t) sp.set("tag", t);
    if (v === "list") sp.set("view", "list");
    else sp.set("view", "grid");
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // A narrower location can leave this page number past the end: start again at page 1.
  if (page > pageCount && listings.total > 0) redirect(href({ page: 1 }));

  return (
    <div className="bg-surface">
      <div className="container-page pt-4 pb-8 sm:pt-6 sm:pb-12">
        {/* Phones skip the breadcrumb, as apps do: the category chips below lead to the rest of the vertical. */}
        <Breadcrumb
          className="hidden sm:block"
          items={[
            { label: "Home", href: "/" },
            { label: vertical.name, href: `/${vertical.slug}` },
            { label: category.name },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-3 sm:mt-6 sm:gap-4">
          <div>
            <h1 className="text-[22px] leading-tight font-semibold text-ink sm:text-[26px]">
              {category.name} in {place}
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft sm:text-sm">
              Showing <b>{listings.total} results</b> as per your search criteria
            </p>
          </div>
          <div className="flex w-full items-center gap-x-4 gap-y-3 sm:w-auto sm:flex-wrap sm:gap-x-6">
            <ListingSearch categoryName={category.name} q={q} view={view} tag={tag} />
            {/* Phones: an icon-only segmented control beside the search box. */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white p-1 text-base sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0" role="group" aria-label="Layout">
              {(
                [
                  ["list", "List", List],
                  ["grid", "Grid", LayoutGrid],
                ] as const
              ).map(([value, label, Icon]) => (
                <Link
                  key={value}
                  href={href({ view: value, page: 1 })}
                  aria-current={view === value ? "true" : undefined}
                  className="flex size-9 items-center justify-center gap-2 rounded-md text-ink-soft hover:text-brand aria-[current=true]:bg-brand-soft aria-[current=true]:text-brand sm:size-auto sm:aria-[current=true]:bg-transparent"
                  scroll={false}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label={`${vertical.name} categories`} className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4 sm:mt-5">
          <ul className="flex gap-2">
            {siblings.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  href={`/${vertical.slug}/${s.slug}`}
                  aria-current={s.slug === category.slug ? "page" : undefined}
                  className="block rounded-full border border-[#e5e7eb] bg-white px-4 py-2 sm:py-1.5 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand aria-[current=page]:border-brand aria-[current=page]:bg-brand-soft aria-[current=page]:font-medium aria-[current=page]:text-brand"
                >
                  {s.name}
                  {location && <span className="ml-1.5 text-xs text-muted tabular-nums">{counts[s.slug] ?? 0}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {panels.length > 0 && (
          <nav aria-label="Filter by tag" className={`no-scrollbar -mx-4 mt-3 overflow-x-auto px-4 ${sidebar ? "lg:hidden" : ""}`}>
            <ul className="flex gap-2">
              {panels
                .flatMap((p) => p.tiles)
                .map((tile) => {
                  const on = tag?.toLowerCase() === tile.label.toLowerCase();
                  return (
                    <li key={tile.label} className="shrink-0">
                      <Link
                        href={href({ tag: on ? null : tile.label, page: 1 })}
                        scroll={false}
                        aria-current={on ? "true" : undefined}
                        className="block rounded-full border border-dashed border-[#d1d5db] px-3 py-1 text-[13px] text-ink-soft hover:border-brand hover:text-brand aria-[current=true]:border-solid aria-[current=true]:border-brand aria-[current=true]:bg-brand-soft aria-[current=true]:text-brand"
                      >
                        {tile.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>
        )}

        {(q || location || tag) && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {location && (
              <span className="flex items-center gap-2 rounded-full border border-[#d1d5db] py-1 pr-1.5 pl-3 text-ink-soft">
                Location: {locationLabel(location)}
                <ClearLocationButton
                  current={location}
                  className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink disabled:opacity-50"
                >
                  <X className="size-3.5" aria-hidden />
                  <span className="sr-only">Show all locations</span>
                </ClearLocationButton>
              </span>
            )}
            {tag && (
              <span className="flex items-center gap-2 rounded-full border border-[#d1d5db] py-1 pr-1.5 pl-3 text-ink-soft">
                {tag}
                <Link href={href({ tag: null, page: 1 })} aria-label={`Remove filter “${tag}”`} scroll={false} className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink">
                  <X className="size-3.5" aria-hidden />
                </Link>
              </span>
            )}
            {q && (
              <span className="flex items-center gap-2 rounded-full border border-[#d1d5db] py-1 pr-1.5 pl-3 text-ink-soft">
                Search: “{q}”
                <Link href={href({ q: null, page: 1 })} aria-label={`Remove search “${q}”`} scroll={false} className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink">
                  <X className="size-3.5" aria-hidden />
                </Link>
              </span>
            )}
            {(q || tag) && (
              <Link href={href({ q: null, tag: null, page: 1 })} scroll={false} className="font-medium text-ink underline underline-offset-2 hover:text-brand">
                {q && tag ? "Clear filters" : q ? "Clear search" : "Clear filter"}
              </Link>
            )}
          </div>
        )}

        {/* The browse side cards sit beside list view only; grid view uses the full width. */}
        <div className={`mt-5 grid gap-5 sm:mt-8 ${sidebar ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
          <div className="min-w-0">
            {listings.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#e5e7eb] px-4 py-16 text-center text-muted">
                {tag && !q ? (
                  <>
                    No {category.name.toLowerCase()} tagged “{tag}”{location ? ` in ${place}` : ""} yet.{" "}
                    <Link href={href({ tag: null, page: 1 })} className="text-brand underline">
                      See all
                    </Link>
                    .
                  </>
                ) : q ? (
                  <>
                    No {category.name.toLowerCase()} {location ? `in ${place} ` : ""}match “{q}”. Try a different name, or{" "}
                    <Link href={href({ q: null, page: 1 })} className="text-brand underline">
                      see all
                    </Link>
                    .
                  </>
                ) : location ? (
                  <>
                    No {category.name.toLowerCase()} in {place} yet.{" "}
                    <ClearLocationButton current={location} className="text-brand underline disabled:opacity-50">
                      Show all locations
                    </ClearLocationButton>
                  </>
                ) : (
                  <>No {category.name.toLowerCase()} listed yet. Check back soon.</>
                )}
              </p>
            ) : (
              <ul className={view === "list" ? "flex flex-col gap-4 sm:gap-5" : "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3"}>
                {listings.items.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} view={view} href={listingPath(vertical.slug, category.slug, listing.slug)} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination page={page} pageCount={pageCount} href={(p) => href({ page: p })} />
          </div>

          {sidebar && (
            <aside className="hidden flex-col gap-6 lg:flex" aria-label="Browse">
              {panels.map((panel) => (
                <BrowsePanel key={panel.title} panel={panel} tag={tag} href={(t) => href({ tag: t, page: 1 })} />
              ))}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
