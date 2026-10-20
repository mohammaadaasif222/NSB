import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search } from "lucide-react";
import { type AdminCategory, LISTING_STATUSES, type ListingStatus, type ListingSummary, type Paginated } from "@nsb/shared";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { adminApi, isUuid } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { DeleteListingButton } from "../listings/delete-listing-button";
import { ListingStatusButton } from "../listings/listing-status-button";
import { WeddingSlots } from "./slots";

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

  const categories = await adminApi.get<AdminCategory[]>("/admin/categories");
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
  const listParams = params({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) listParams.set("q", q);
  if (status) listParams.set("status", status);
  const countOf = (s?: ListingStatus) => {
    const p = params({ pageSize: "1" });
    if (q) p.set("q", q);
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
  const href = (change: { sub?: string; q?: string; status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const next = { sub: sub?.id ?? "", q, status, ...change };
    if (next.sub) sp.set("sub", next.sub);
    if (next.q) sp.set("q", next.q);
    if (next.status) sp.set("status", next.status);
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
          <p>Sub-categories and their vendor listings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/home#categories" className="a-btn g">
            Manage sub-categories
          </Link>
          <Link href="/admin/listings/new" className="a-btn">
            <Plus size={16} aria-hidden /> Add listing
          </Link>
        </div>
      </div>

      <nav className="a-tl mb-4" aria-label="Sub-categories">
        <Link href={href({ sub: "" })} className="a-chp" aria-current={!sub ? "true" : undefined}>
          All wedding<span>{weddingTotal}</span>
        </Link>
        {subs.map((c) => (
          <Link key={c.id} href={href({ sub: c.id })} className="a-chp" aria-current={sub?.id === c.id ? "true" : undefined}>
            {c.name}
            <span>{c.isActive ? c.listingCount : "hidden"}</span>
          </Link>
        ))}
      </nav>

      {wedding && <WeddingSlots weddingId={wedding.id} subs={subs} selected={sub} />}

      <div className="a-tl">
        <form action="/admin/wedding" className="a-gs" role="search">
          {sub && <input type="hidden" name="sub" value={sub.id} />}
          {status && <input type="hidden" name="status" value={status} />}
          <Search size={16} aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search name, area or locality" aria-label="Search listings" maxLength={100} />
        </form>
        {(["", ...LISTING_STATUSES] as const).map((s) => (
          <Link key={s || "all"} href={href({ status: s })} className="a-chp" aria-current={status === s ? "true" : undefined}>
            {s ? STATUS_LABEL[s] : "All"}
            <span>{counts[s]}</span>
          </Link>
        ))}
        {(q || status) && (
          <Link href={href({ status: "", q: "" })} className="a-btn g s ml-auto">
            Clear filters
          </Link>
        )}
      </div>

      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th scope="col">Listing</th>
              <th scope="col">Sub-category</th>
              <th scope="col">Location</th>
              <th scope="col">Added</th>
              <th scope="col">Status</th>
              <th scope="col">Featured</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.items.length ? (
              listings.items.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="a-nm">
                      <ListingThumb name={l.name} imageUrl={l.coverImageUrl} />
                      <div className="min-w-0">
                        <Link href={`/admin/listings/${l.id}`} className="hover:text-(--admin-accent)">
                          <b>{l.name}</b>
                        </Link>
                        <small>{l.locality ?? l.shortDescription}</small>
                      </div>
                    </div>
                  </td>
                  <td>{l.category.name}</td>
                  <td>{l.area}</td>
                  <td className="whitespace-nowrap text-zinc-500">{formatDateTime(l.createdAt)}</td>
                  <td>
                    <span className={`a-pl ${l.status}`}>{STATUS_LABEL[l.status]}</span>
                  </td>
                  <td>{l.isFeatured ? <span className="a-pl new">Featured</span> : <span className="text-zinc-500">—</span>}</td>
                  <td>
                    <div className="a-ac">
                      {l.status === "live" && l.category.id !== wedding?.id && (
                        <a href={`/wedding/${l.category.slug}/${l.slug}`} target="_blank" rel="noreferrer" title="View on site" aria-label={`View ${l.name} on the site`}>
                          <ExternalLink size={15} aria-hidden />
                        </a>
                      )}
                      <Link href={`/admin/listings/${l.id}`} title="Edit" aria-label={`Edit ${l.name}`}>
                        <Pencil size={15} aria-hidden />
                      </Link>
                      <ListingStatusButton id={l.id} name={l.name} status={l.status} />
                      <DeleteListingButton id={l.id} name={l.name} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-zinc-500">
                  {q || status ? "No listings match these filters." : "No listings here yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
