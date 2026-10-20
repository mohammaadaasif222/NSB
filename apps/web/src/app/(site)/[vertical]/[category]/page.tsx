import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LayoutGrid, List, X } from "lucide-react";
import type { Category, ListingSummary, Paginated } from "@nsb/shared";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { BrowsePanel } from "@/components/site/listing/browse-panel";
import { ListingCard, type ListingView } from "@/components/site/listing/listing-card";
import { ListingSearch } from "@/components/site/listing/listing-search";
import { Pagination } from "@/components/site/pagination";
import { api } from "@/lib/api";
import { browsePanels } from "@/lib/browse-panels";
import { getSiteSettings } from "@/lib/site-settings";
import { getCategory, listingPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED, COMING_SOON_METADATA } from "@/lib/flags";

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

  const listingQuery = new URLSearchParams({ category: category.slug, page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) listingQuery.set("q", q);
  const [listings, siblings, { listingSidebar }] = await Promise.all([
    api.get<Paginated<ListingSummary>>(`/listings?${listingQuery}`),
    api.get<Category[]>(`/categories?parent=${encodeURIComponent(vertical.slug)}`),
    getSiteSettings(),
  ]);
  // Side cards as switched on in Admin › Settings; shown beside list view only.
  const panels = listingSidebar.enabled ? browsePanels(category.slug, category.name).filter((p) => listingSidebar[p.kind]) : [];
  const sidebar = view === "list" && panels.length > 0;

  const basePath = `/${vertical.slug}/${category.slug}`;
  const pageCount = Math.max(1, Math.ceil(listings.total / listings.pageSize));
  const href = (next: { view?: ListingView; page?: number; q?: string | null }) => {
    const sp = new URLSearchParams();
    const v = next.view ?? view;
    const p = next.page ?? page;
    const search = next.q === null ? undefined : (next.q ?? q);
    if (search) sp.set("q", search);
    if (v === "list") sp.set("view", "list");
    else sp.set("view", "grid");
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="bg-surface">
      <div className="container-page pt-6 pb-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: vertical.name, href: `/${vertical.slug}` },
            { label: category.name },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] leading-tight font-semibold text-ink">{category.name} in Noida</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Showing <b>{listings.total} results</b> as per your search criteria
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 sm:w-auto">
            <ListingSearch categoryName={category.name} q={q} view={view} />
            <div className="flex items-center gap-5 text-base" role="group" aria-label="Layout">
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
                  className="flex items-center gap-2 text-ink-soft hover:text-brand aria-[current=true]:text-brand"
                  scroll={false}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label={`${vertical.name} categories`} className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4">
          <ul className="flex gap-2">
            {siblings.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  href={`/${vertical.slug}/${s.slug}`}
                  aria-current={s.slug === category.slug ? "page" : undefined}
                  className="block rounded-full border border-[#e5e7eb] px-4 py-1.5 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand aria-[current=page]:border-brand aria-[current=page]:bg-brand-soft aria-[current=page]:font-medium aria-[current=page]:text-brand"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {q && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-2 rounded-full border border-[#d1d5db] py-1 pr-1.5 pl-3 text-ink-soft">
              Search: “{q}”
              <Link href={href({ q: null, page: 1 })} aria-label={`Remove search “${q}”`} scroll={false} className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink">
                <X className="size-3.5" aria-hidden />
              </Link>
            </span>
            <Link href={href({ q: null, page: 1 })} scroll={false} className="font-medium text-ink underline underline-offset-2 hover:text-brand">
              Clear all
            </Link>
          </div>
        )}

        {/* The browse side cards sit beside list view only; grid view uses the full width. */}
        <div className={`mt-8 grid gap-5 ${sidebar ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
          <div className="min-w-0">
            {listings.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#e5e7eb] px-4 py-16 text-center text-muted">
                {q ? (
                  <>
                    No {category.name.toLowerCase()} match “{q}”. Try a different name or area, or{" "}
                    <Link href={href({ q: null, page: 1 })} className="text-brand underline">
                      see all
                    </Link>
                    .
                  </>
                ) : (
                  <>No {category.name.toLowerCase()} listed yet. Check back soon.</>
                )}
              </p>
            ) : (
              <ul className={view === "list" ? "flex flex-col gap-5" : "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"}>
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
                <BrowsePanel key={panel.title} panel={panel} />
              ))}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
