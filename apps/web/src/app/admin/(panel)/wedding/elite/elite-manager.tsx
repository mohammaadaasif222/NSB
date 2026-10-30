"use client";

import { type FormEvent, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { type ListingSummary, MAX_TOP_LISTINGS, type Paginated, type TopListingsInput } from "@nsb/shared";
import { IconButton, TextInput, Toggle } from "@/components/admin/form";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { SortableList } from "@/components/admin/sortable-list";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient, RequestError } from "@/lib/admin-client";

/** How many search results to offer at once. */
const RESULTS = 8;

/** The top places of one sub-category. Every change saves straight away, as the home banners do. */
export function EliteManager({ categoryId, categoryName, top }: { categoryId: string; categoryName: string; top: ListingSummary[] }) {
  const { run, pending } = useAdminAction();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ListingSummary[] | null>(null);
  const [searchError, setSearchError] = useState("");
  const full = top.length >= MAX_TOP_LISTINGS;
  const items = top.map(({ id, isElite }) => ({ id, isElite }));
  const elite = top.filter((l) => l.isElite).length;

  const save = async (next: TopListingsInput["items"], success: string) =>
    (await run(() => adminClient.put("/admin/listings/top", { categoryId, items: next } satisfies TopListingsInput), { success })).ok;

  const reorder = (ids: string[]) => save(ids.map((id) => items.find((i) => i.id === id)!), "Order saved");

  const search = async (e: FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const params = new URLSearchParams({ categoryId, status: "live", pageSize: String(RESULTS) });
    if (q.trim()) params.set("q", q.trim());
    try {
      setResults((await adminClient.get<Paginated<ListingSummary>>(`/admin/listings?${params}`)).items);
    } catch (err) {
      setSearchError(err instanceof RequestError ? err.message : "Could not search. Please try again.");
    }
  };

  const available = results?.filter((l) => !top.some((t) => t.id === l.id));

  return (
    <section className="a-card" aria-labelledby="elite-top-h">
      <h3 id="elite-top-h">
        Top 10 in {categoryName}
        <span className="a-hs0">
          {top.length} of {MAX_TOP_LISTINGS} places · {elite} Elite
        </span>
      </h3>
      <p className="a-hsub mb-3">Place 1 shows first on the first page. Listings without a place follow in the usual order. Elite turns a card blue.</p>

      {top.length > 0 ? (
        <SortableList items={top} getId={(l) => l.id} getLabel={(l) => l.name} onReorder={reorder} disabled={pending} layout="rows">
          {(listing, arrows) => (
            <div className="a-hrow a-elite-row">
              {arrows}
              <b className="a-elite-n">{top.findIndex((l) => l.id === listing.id) + 1}</b>
              <div className="a-nm">
                <ListingThumb name={listing.name} imageUrl={listing.coverImageUrl} />
                <div className="min-w-0">
                  <b>{listing.name}</b>
                  <small>
                    {listing.area}
                    {listing.status !== "live" && " · not on the site until it is Live"}
                  </small>
                </div>
              </div>
              <Toggle
                label="Elite"
                showLabel
                checked={listing.isElite}
                disabled={pending}
                onChange={(isElite) =>
                  void save(
                    items.map((i) => (i.id === listing.id ? { ...i, isElite } : i)),
                    isElite ? `${listing.name} is Elite` : `${listing.name} is no longer Elite`,
                  )
                }
              />
              <IconButton
                label={`Remove ${listing.name} from the top 10`}
                disabled={pending}
                onClick={() =>
                  void save(
                    items.filter((i) => i.id !== listing.id),
                    `${listing.name} removed`,
                  )
                }
              >
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </div>
          )}
        </SortableList>
      ) : (
        <p className="mb-3 text-sm text-zinc-500">No top places set: listings show featured first, then newest.</p>
      )}

      <form onSubmit={(e) => void search(e)} className="mt-3 flex gap-2">
        <TextInput value={q} maxLength={100} placeholder="Find a live listing by name or area" aria-label="Find a live listing" onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="a-btn o">
          <Search size={16} aria-hidden /> Find
        </button>
      </form>
      {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
      {full && <p className="mt-2 text-sm text-zinc-500">All {MAX_TOP_LISTINGS} places are taken. Remove one to add another.</p>}
      {available && (
        <ul className="mt-3 flex flex-col gap-2">
          {available.length === 0 && <li className="text-sm text-zinc-500">No more live listings match.</li>}
          {available.map((listing) => (
            <li key={listing.id} className="a-hrow a-elite-add">
              <div className="a-nm">
                <ListingThumb name={listing.name} imageUrl={listing.coverImageUrl} />
                <div className="min-w-0">
                  <b>{listing.name}</b>
                  <small>{listing.area}</small>
                </div>
              </div>
              <button
                type="button"
                className="a-btn o s"
                disabled={pending || full}
                onClick={() => void save([...items, { id: listing.id, isElite: false }], `${listing.name} added`)}
              >
                <Plus size={14} aria-hidden /> Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
