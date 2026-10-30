"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { type ListingSummary, MAX_TOP_LISTINGS, type TopListingsInput } from "@nsb/shared";
import { IconButton, Toggle } from "@/components/admin/form";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { SortableList } from "@/components/admin/sortable-list";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { ListingFinder } from "./listing-finder";

/** The top places of one sub-category. Every change saves straight away, as the home banners do. */
export function EliteManager({ categoryId, categoryName, top }: { categoryId: string; categoryName: string; top: ListingSummary[] }) {
  const { run, pending } = useAdminAction();
  const full = top.length >= MAX_TOP_LISTINGS;
  const items = top.map(({ id, isElite }) => ({ id, isElite }));
  const elite = top.filter((l) => l.isElite).length;
  const topIds = useMemo(() => top.map((l) => l.id), [top]);

  const save = async (next: TopListingsInput["items"], success: string) =>
    (await run(() => adminClient.put("/admin/listings/top", { categoryId, items: next } satisfies TopListingsInput), { success })).ok;

  const reorder = (ids: string[]) => save(ids.map((id) => items.find((i) => i.id === id)!), "Order saved");

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

      <ListingFinder
        categoryId={categoryId}
        excludeIds={topIds}
        full={full ? `All ${MAX_TOP_LISTINGS} places are taken. Remove one to add another.` : null}
        disabled={pending}
        onAdd={(listing) => void save([...items, { id: listing.id, isElite: false }], `${listing.name} added`)}
      />
    </section>
  );
}
