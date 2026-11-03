"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import type { ListingStatus, ListingSummary } from "@nsb/shared";
import { useCan } from "@/components/admin/admin-role";
import { BulkBar, BulkDeleteDialog } from "@/components/admin/bulk-bar";
import { DeleteListingButton } from "@/components/admin/delete-listing-button";
import { ListingStatusButton } from "@/components/admin/listing-status-button";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { useBulkActions } from "@/components/admin/use-bulk-actions";
import { formatDateTime } from "@/lib/format";
import { sitePath } from "@/lib/admin-links";

const STATUS_LABEL: Record<ListingStatus, string> = { live: "Live", draft: "Draft", hidden: "Hidden" };

export function WeddingListingsTable({
  listings,
  weddingId,
  empty,
}: {
  listings: ListingSummary[];
  weddingId?: string;
  empty: string;
}) {
  const canEdit = useCan("edit");
  const bulk = useBulkActions(listings, "/admin/listings");

  return (
    <>
      {canEdit && <BulkBar bulk={bulk} />}
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <input
                  type="checkbox"
                  className="a-listing-select"
                  hidden={!canEdit}
                  checked={bulk.allSelected}
                  disabled={bulk.pending}
                  onChange={(event) => bulk.selectAll(event.currentTarget.checked)}
                  aria-label="Select all listings on this page"
                />
              </th>
              <th scope="col">Listing</th>
              <th scope="col">Sub-category</th>
              <th scope="col">Location</th>
              <th scope="col">Added</th>
              <th scope="col">Status</th>
              <th scope="col">Featured</th>
              <th scope="col">Leads</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.length ? (
              listings.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="a-listing-select"
                  hidden={!canEdit}
                      checked={bulk.selected.has(listing.id)}
                      disabled={bulk.pending}
                      onChange={(event) => bulk.selectOne(listing.id, event.currentTarget.checked)}
                      aria-label={`Select ${listing.name}`}
                    />
                  </td>
                  <td>
                    <div className="a-nm">
                      <ListingThumb name={listing.name} imageUrl={listing.coverImageUrl} />
                      <div className="min-w-0">
                        <Link href={`/admin/listings/${listing.id}`} className="hover:text-(--admin-accent)">
                          <b>{listing.name}</b>
                        </Link>
                        <small title={listing.locality ?? listing.shortDescription}>{listing.locality ?? listing.shortDescription}</small>
                      </div>
                    </div>
                  </td>
                  <td>{listing.category.name}</td>
                  <td>{listing.area}</td>
                  <td className="whitespace-nowrap text-zinc-500">{formatDateTime(listing.createdAt)}</td>
                  <td>
                    <span className={`a-pl ${listing.status}`}>{STATUS_LABEL[listing.status]}</span>
                  </td>
                  <td>
                    {listing.isElite ? (
                      <span className="a-pl new">Elite #{listing.topRank}</span>
                    ) : listing.topRank ? (
                      <span className="a-pl new">Top #{listing.topRank}</span>
                    ) : listing.isFeatured ? (
                      <span className="a-pl new">Featured</span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td>
                    {listing.leadCount ? (
                      <Link
                        href={`/admin/enquiries?section=wedding&listing=${listing.id}`}
                        className="font-semibold hover:text-(--admin-accent)"
                        title="Open these leads"
                      >
                        {listing.leadCount}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">0</span>
                    )}
                  </td>
                  <td>
                    <div className="a-ac">
                      {listing.status === "live" && listing.category.id !== weddingId && (
                        <a
                          href={sitePath(`/wedding/${listing.category.slug}/${listing.slug}`)}
                          target="_blank"
                          rel="noreferrer"
                          title="View on site"
                          aria-label={`View ${listing.name} on the site`}
                        >
                          <ExternalLink size={15} aria-hidden />
                        </a>
                      )}
                      {canEdit && (
                        <>
                        <Link href={`/admin/listings/${listing.id}`} title="Edit" aria-label={`Edit ${listing.name}`}>
                          <Pencil size={15} aria-hidden />
                        </Link>
                        <ListingStatusButton id={listing.id} name={listing.name} status={listing.status} />
                        <DeleteListingButton id={listing.id} name={listing.name} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-10 text-center text-zinc-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BulkDeleteDialog
        bulk={bulk}
        message={`This will permanently delete ${bulk.selected.size} selected listing${bulk.selected.size === 1 ? "" : "s"} and their photos. Their enquiries will be kept.`}
      />
    </>
  );
}
