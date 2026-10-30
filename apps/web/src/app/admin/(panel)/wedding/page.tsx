import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Plus } from "lucide-react";
import {
  type AdminCategory,
  type AdminSettings,
  type AdminUser,
  canDo,
  LISTING_AREAS,
  LISTING_STATUSES,
  type ListingStatus,
  type ListingSummary,
  type Paginated,
} from "@nsb/shared";
import { adminApi, isUuid } from "@/lib/api";
import { WeddingListingsTable } from "./listings-table";
import { ManageSubcategories } from "./manage-subcategories";
import { WeddingFilters, type WeddingFilterValues } from "./wedding-filters";

export const metadata: Metadata = { title: "Wedding" };

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<ListingStatus, string> = { live: "Live", draft: "Draft", hidden: "Hidden" };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

/** Wedding sub-categories and their listings, laid out as in the NSB Live Demo admin. */
export default async function WeddingPage({ searchParams }: PageProps<"/admin/wedding">) {
  const query = await searchParams;
  const q = one(query.q).slice(0, 100);
  const status = (LISTING_STATUSES as readonly string[]).includes(one(query.status)) ? (one(query.status) as ListingStatus) : "";
  const page = Math.max(1, Number.parseInt(one(query.page), 10) || 1);
  const area = (LISTING_AREAS as readonly string[]).includes(one(query.area)) ? one(query.area) : "";
  const sort = (["az", "lead"] as const).find((s) => s === one(query.sort)) ?? "new";

  const [categories, admin] = await Promise.all([adminApi.get<AdminCategory[]>("/admin/categories"), adminApi.get<AdminUser>("/auth/me")]);
  const canEdit = canDo(admin.role, "edit");
  // Slot prices for "Manage sub-categories"; settings are for editors.
  const pricing = canEdit ? (await adminApi.get<AdminSettings>("/admin/settings")).pricing : null;
  const wedding = categories.find((c) => !c.parentId && c.slug === "wedding");
  const subs = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];
  const sub = isUuid(one(query.sub)) ? subs.find((c) => c.id === one(query.sub)) : undefined;
  const scopeId = sub?.id ?? wedding?.id;

  if (!scopeId) {
    return (
      <div className="a-card">
        <h3>Wedding</h3>
        <p className="text-zinc-500">There is no Wedding category yet. Run the seed to add it.</p>
      </div>
    );
  }

  const params = (extra: Record<string, string>) => new URLSearchParams({ categoryId: scopeId, ...extra });
  const listParams = params({ page: String(page), pageSize: String(PAGE_SIZE), sort });
  if (q) listParams.set("q", q);
  if (area) listParams.set("area", area);
  if (status) listParams.set("status", status);
  const countOf = (s?: ListingStatus) => {
    const p = params({ pageSize: "1" });
    if (q) p.set("q", q);
    if (area) p.set("area", area);
    if (s) p.set("status", s);
    return adminApi.get<Paginated<ListingSummary>>(`/admin/listings?${p}`).then((r) => r.total);
  };
  const [listings, all, live, draft, hidden] = await Promise.all([
    adminApi.get<Paginated<ListingSummary>>(`/admin/listings?${listParams}`),
    countOf(),
    countOf("live"),
    countOf("draft"),
    countOf("hidden"),
  ]);
  const counts: Record<ListingStatus | "", number> = { "": all, live, draft, hidden };

  /** This page's URL with some filters changed; changing a filter goes back to page 1. */
  const href = (change: { sub?: string; q?: string; status?: string; area?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const next = { sub: sub?.id ?? "", q, status, area, ...change };
    if (next.sub) sp.set("sub", next.sub);
    if (next.q) sp.set("q", next.q);
    if (next.area) sp.set("area", next.area);
    if (next.status) sp.set("status", next.status);
    if (sort !== "new") sp.set("sort", sort);
    if (change.page && change.page > 1) sp.set("page", String(change.page));
    return `/admin/wedding${sp.size ? `?${sp}` : ""}`;
  };

  const pageCount = Math.max(1, Math.ceil(listings.total / PAGE_SIZE));
  const first = listings.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(page * PAGE_SIZE, listings.total);
  const weddingTotal = subs.reduce((n, c) => n + c.listingCount, 0) + (wedding?.listingCount ?? 0);

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Wedding</h2>
          <p>All wedding vendors. Pick a sub-category to filter.</p>
        </div>
        {canEdit && wedding && pricing && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/wedding/elite${sub ? `?sub=${sub.id}` : ""}`} className="a-btn o">
              <Crown size={16} aria-hidden /> Elite 10
            </Link>
            <ManageSubcategories weddingId={wedding.id} subs={subs} pricing={pricing} />
            <Link href="/admin/listings/new" className="a-btn">
              <Plus size={16} aria-hidden /> Add listing
            </Link>
          </div>
        )}
      </div>

      <nav className="a-tl mb-4" aria-label="Sub-categories">
        <Link href={href({ sub: "" })} className="a-chp" aria-current={!sub ? "true" : undefined}>
          All vendors<span>{weddingTotal}</span>
        </Link>
        {subs.map((c) => (
          <Link key={c.id} href={href({ sub: c.id })} className="a-chp" aria-current={sub?.id === c.id ? "true" : undefined}>
            {c.name}
            <span>{c.isActive ? c.listingCount : "hidden"}</span>
          </Link>
        ))}
      </nav>

      <WeddingFilters values={{ sub: sub?.id ?? "", q, area, status, sort } satisfies WeddingFilterValues}>
        {(["", ...LISTING_STATUSES] as const).map((s) => (
          <Link key={s || "all"} href={href({ status: s })} className="a-chp" aria-current={status === s ? "true" : undefined}>
            {s ? STATUS_LABEL[s] : "All"}
            <span>{counts[s]}</span>
          </Link>
        ))}
        {(q || status || area) && (
          <Link href={href({ status: "", q: "", area: "" })} className="a-btn g s">
            Clear filters
          </Link>
        )}
      </WeddingFilters>

      <WeddingListingsTable
        key={JSON.stringify({ sub: sub?.id, q, status, area, sort, page })}
        listings={listings.items}
        weddingId={wedding?.id}
        empty={q || status || area ? "No listings match these filters." : "No listings here yet."}
      />

      <nav className="a-pg" aria-label="Pagination">
        <span>
          Showing {first}–{last} of {listings.total}
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
  );
}
