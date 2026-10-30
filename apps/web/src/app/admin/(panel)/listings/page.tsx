import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { type AdminCategory, LISTING_STATUSES, type ListingStatus, type ListingSummary, type Paginated } from "@nsb/shared";
import { PageHeader, Pagination } from "@/components/admin/ui";
import { adminApi, isUuid } from "@/lib/admin-api";
import { ListingFilters, type ListingFilterValues } from "./listing-filters";
import { ListingsTable } from "./listings-table";

export const metadata: Metadata = { title: "Listings" };

const PAGE_SIZES = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZES)[number];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

function readPageSize(value: string): PageSize {
  const requested = Number(value);
  return PAGE_SIZES.find((size) => size === requested) ?? 10;
}

/** Reads the filters from the URL, dropping anything malformed instead of failing the page. */
function readFilters(query: Record<string, string | string[] | undefined>): ListingFilterValues {
  const [from, to] = [one(query.from), one(query.to)];
  return {
    q: one(query.q).slice(0, 100),
    category: isUuid(one(query.category)) ? one(query.category) : "",
    from: isDate(from) ? from : "",
    to: isDate(to) ? to : "",
    status: (LISTING_STATUSES as readonly string[]).includes(one(query.status)) ? (one(query.status) as ListingStatus) : "",
  };
}

export default async function ListingsPage({ searchParams }: PageProps<"/admin/listings">) {
  const query = await searchParams;
  const filters = readFilters(query);
  const categoryId = filters.category || undefined;
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);
  const pageSize = readPageSize(one(query.pageSize));

  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (categoryId) params.set("categoryId", categoryId);
  if (filters.q) params.set("q", filters.q);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);
  const [categories, listings] = await Promise.all([
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<Paginated<ListingSummary>>(`/admin/listings?${params}`),
  ]);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const pageCount = Math.max(1, Math.ceil(listings.total / pageSize));
  const filtered = Object.values(filters).some(Boolean);
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    if (p > 1) sp.set("page", String(p));
    sp.set("pageSize", String(pageSize));
    return `/admin/listings${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Listings"
        description={`${listings.total} ${filtered ? "matching listings" : "vendors"}, featured first, then newest`}
        actions={
          <Link href="/admin/listings/new" className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            <Plus className="size-4" aria-hidden /> Add listing
          </Link>
        }
      />
      <ListingFilters categories={categories} values={filters} pageSize={pageSize} pageSizes={PAGE_SIZES} />
      <ListingsTable
        key={JSON.stringify({ page, pageSize, filters })}
        listings={listings.items}
        parentNames={Object.fromEntries(
          categories.flatMap((category) => {
            const parentId = category.parentId;
            const parent = parentId ? byId.get(parentId) : undefined;
            return parent ? [[category.id, parent.name]] : [];
          }),
        )}
        empty={filtered ? "No listings match these filters." : "No listings yet."}
        firstRowNumber={(page - 1) * pageSize + 1}
      />
      <Pagination page={page} pageCount={pageCount} href={pageHref} />
    </>
  );
}
