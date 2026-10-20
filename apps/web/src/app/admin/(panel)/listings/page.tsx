import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { type AdminCategory, LISTING_STATUSES, type ListingStatus, type ListingSummary, type Paginated } from "@nsb/shared";
import { Badge, DataTable, PageHeader, Pagination } from "@/components/admin/ui";
import { adminApi, isUuid } from "@/lib/api";
import { DeleteListingButton } from "./delete-listing-button";
import { formatDateTime } from "@/lib/format";
import { ListingFilters, type ListingFilterValues } from "./listing-filters";

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
  const parentName = (categoryId: string) => {
    const parentId = byId.get(categoryId)?.parentId;
    return parentId ? byId.get(parentId)?.name : undefined;
  };
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
      <DataTable
        rows={listings.items}
        rowKey={(l) => l.id}
        empty={filtered ? "No listings match these filters." : "No listings yet."}
        columns={[
          {
            header: "Sr. No.",
            cell: (_, index) => (page - 1) * pageSize + index + 1,
            className: "w-20",
          },
          {
            header: "Business",
            cell: (l) => (
              <Link href={`/admin/listings/${l.id}`} className="font-medium text-zinc-900 hover:underline">
                {l.name}
              </Link>
            ),
          },
          {
            header: "Category",
            cell: (l) => (
              <>
                {l.category.name}
                {parentName(l.category.id) && <span className="block text-xs text-zinc-500">in {parentName(l.category.id)}</span>}
              </>
            ),
          },
          { header: "Area", cell: (l) => l.area },
          {
            header: "Status",
            cell: (l) =>
              l.status === "live" ? <Badge tone="good">Live</Badge> : <Badge>{l.status === "draft" ? "Draft" : "Hidden"}</Badge>,
          },
          { header: "Added", cell: (l) => formatDateTime(l.createdAt), className: "whitespace-nowrap text-zinc-600" },
          { header: "Featured", cell: (l) => (l.isFeatured ? <Badge tone="good">Featured</Badge> : null) },
          {
            header: "Actions",
            className: "w-24 text-right",
            cell: (l) => (
              <span className="flex justify-end gap-1">
                <Link href={`/admin/listings/${l.id}`} aria-label={`Edit ${l.name}`} title="Edit" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <DeleteListingButton id={l.id} name={l.name} />
              </span>
            ),
          },
        ]}
      />
      <Pagination page={page} pageCount={pageCount} href={pageHref} />
    </>
  );
}
