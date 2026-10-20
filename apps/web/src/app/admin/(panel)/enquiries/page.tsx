import type { Metadata } from "next";
import { Download } from "lucide-react";
import { type AdminCategory, ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus, type Paginated } from "@nsb/shared";
import { PageHeader, Pagination } from "@/components/admin/ui";
import { adminApi, isUuid } from "@/lib/api";
import { EnquiryFilters, type FilterValues } from "./enquiry-filters";
import { EnquiryTable } from "./enquiry-table";
import { MarkAllReadButton } from "./mark-all-read-button";

export const metadata: Metadata = { title: "Enquiries" };

const PAGE_SIZE = 25;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Reads the filters from the URL, dropping anything malformed instead of failing the page. */
function readFilters(query: Record<string, string | string[] | undefined>): FilterValues {
  const status = one(query.status);
  const [from, to] = [one(query.from), one(query.to)];
  return {
    q: one(query.q).slice(0, 100),
    category: isUuid(one(query.category)) ? one(query.category) : "",
    status: (ENQUIRY_STATUSES as readonly string[]).includes(status) ? (status as EnquiryStatus) : "",
    from: isDate(from) ? from : "",
    to: isDate(to) ? to : "",
  };
}

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const query = await searchParams;
  const filters = readFilters(query);
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("categoryId", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const [enquiries, categories] = await Promise.all([
    adminApi.get<Paginated<Enquiry>>(`/admin/enquiries?${params}`),
    adminApi.get<AdminCategory[]>("/admin/categories"),
  ]);

  const filtered = Object.values(filters).some(Boolean);
  // Export the same leads the filters show (all pages), with the API's parameter names.
  const exportQuery = new URLSearchParams([...params].filter(([k]) => k !== "page" && k !== "pageSize")).toString();
  const pageCount = Math.max(1, Math.ceil(enquiries.total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    if (p > 1) sp.set("page", String(p));
    return `/admin/enquiries${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Enquiries"
        description={`${enquiries.total} ${filtered ? "matching leads" : "leads"}, newest first`}
        actions={
          <>
            {/* The browser downloads the file; the session cookie goes with the same-origin request. */}
            <a
              href={`/api/admin/enquiries/export${exportQuery ? `?${exportQuery}` : ""}`}
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Download className="size-4" aria-hidden /> Export CSV
            </a>
            <MarkAllReadButton />
          </>
        }
      />
      <EnquiryFilters categories={categories} values={filters} />
      <EnquiryTable enquiries={enquiries.items} empty={filtered ? "No enquiries match these filters." : "No enquiries yet."} />
      <Pagination page={page} pageCount={pageCount} href={pageHref} />
    </>
  );
}
