"use client";

import { useCallback, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import type { ListingSummary, Paginated } from "@nsb/shared";
import { TextInput } from "@/components/admin/form";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { useLiveSearch } from "@/components/admin/use-live-search";
import { adminClient } from "@/lib/admin-client";

/** How many results to load at once. */
const PAGE_SIZE = 8;

/**
 * Finds live listings of one sub-category as the admin types, for adding to its top places. It
 * keeps its own state, so typing does not re-render the list of places above it.
 */
export function ListingFinder({
  categoryId,
  excludeIds,
  full,
  disabled,
  onAdd,
}: {
  categoryId: string;
  /** Listings already chosen, left out of the results. */
  excludeIds: string[];
  /** No room for another: results still show, but cannot be added. */
  full: string | null;
  disabled: boolean;
  onAdd: (listing: ListingSummary) => void;
}) {
  const fetchPage = useCallback(
    (q: string, page: number, signal: AbortSignal) => {
      const params = new URLSearchParams({ categoryId, status: "live", page: String(page), pageSize: String(PAGE_SIZE) });
      if (q) params.set("q", q);
      return adminClient.get<Paginated<ListingSummary>>(`/admin/listings?${params}`, { signal });
    },
    [categoryId],
  );
  const { q, change, submit, loadMore, loading, error, items, hasMore } = useLiveSearch(fetchPage);
  const available = useMemo(() => {
    const chosen = new Set(excludeIds);
    return items?.filter((l) => !chosen.has(l.id));
  }, [items, excludeIds]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-3 flex gap-2"
      >
        <TextInput value={q} maxLength={100} placeholder="Find a live listing by name, area or tag" aria-label="Find a live listing" onChange={(e) => change(e.target.value)} />
        <button type="submit" className="a-btn o">
          <Search size={16} aria-hidden /> Find
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {full && <p className="mt-2 text-sm text-zinc-500">{full}</p>}
      <p className="sr-only" role="status">
        {loading ? "Searching" : available ? `${available.length} listings found` : ""}
      </p>
      {available && (
        <ul className="mt-3 flex flex-col gap-2" aria-busy={loading}>
          {available.length === 0 && !hasMore && !loading && <li className="text-sm text-zinc-500">No more live listings match.</li>}
          {available.map((listing) => (
            <li key={listing.id} className="a-hrow a-elite-add">
              <div className="a-nm">
                <ListingThumb name={listing.name} imageUrl={listing.coverImageUrl} />
                <div className="min-w-0">
                  <b>{listing.name}</b>
                  <small>{listing.area}</small>
                </div>
              </div>
              <button type="button" className="a-btn o s" disabled={disabled || !!full} onClick={() => onAdd(listing)}>
                <Plus size={14} aria-hidden /> Add
              </button>
            </li>
          ))}
          {hasMore && (
            <li>
              <button type="button" className="a-btn g s" disabled={loading} onClick={loadMore}>
                {loading ? "Loading…" : "Show more"}
              </button>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
