"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import type { ListingStatus, ListingSummary } from "@nsb/shared";
import { useCan } from "@/components/admin/admin-role";
import { ConfirmDialog } from "@/components/admin/dialog";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { useToast } from "@/components/admin/toast";
import { DeleteListingButton } from "../listings/delete-listing-button";
import { ListingStatusButton } from "../listings/listing-status-button";
import { adminClient, RequestError } from "@/lib/admin-client";
import { formatDateTime } from "@/lib/format";

const STATUS_LABEL: Record<ListingStatus, string> = { live: "Live", draft: "Draft", hidden: "Hidden" };
type BulkAction = "publish" | "unpublish" | "delete";

export function WeddingListingsTable({
  listings,
  weddingId,
  empty,
}: {
  listings: ListingSummary[];
  weddingId?: string;
  empty: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const canEdit = useCan("edit");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const allSelected = listings.length > 0 && selected.size === listings.length;

  const selectAll = (checked: boolean) => {
    setSelected(checked ? new Set(listings.map((listing) => listing.id)) : new Set());
  };

  const selectOne = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const performBulkAction = async (action: BulkAction) => {
    const ids = [...selected];
    if (!ids.length || pending) return;
    setPending(true);
    const results = await Promise.allSettled(
      ids.map((id) =>
        action === "delete"
          ? adminClient.delete(`/admin/listings/${id}`)
          : adminClient.patch(`/admin/listings/${id}`, { status: (action === "publish" ? "live" : "draft") satisfies ListingStatus }),
      ),
    );
    const failedIds = ids.filter((_, index) => results[index].status === "rejected");
    const succeeded = ids.length - failedIds.length;
    setSelected(new Set(failedIds));
    setConfirmDelete(false);
    setPending(false);
    if (succeeded > 0) router.refresh();

    const actionName = action === "publish" ? "published" : action === "unpublish" ? "moved to draft" : "deleted";
    if (failedIds.length) {
      const error = results.find((result) => result.status === "rejected");
      const reason = error?.status === "rejected" ? error.reason : null;
      const detail = reason instanceof RequestError ? ` ${reason.message}` : "";
      toast.error(`${succeeded} listing${succeeded === 1 ? "" : "s"} ${actionName}; ${failedIds.length} failed and remain selected.${detail}`);
    } else {
      toast.success(`${succeeded} listing${succeeded === 1 ? "" : "s"} ${actionName}`);
    }
  };

  return (
    <>
      {canEdit && selected.size > 0 && (
        <div className="a-bulk">
          <span className="a-bulk-count">{selected.size} selected</span>
          <div className="a-bulk-actions">
            <button type="button" onClick={() => void performBulkAction("publish")} disabled={pending}>
              Publish
            </button>
            <button type="button" onClick={() => void performBulkAction("unpublish")} disabled={pending}>
              Unpublish
            </button>
            <button type="button" className="danger" onClick={() => setConfirmDelete(true)} disabled={pending}>
              Delete
            </button>
          </div>
        </div>
      )}
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <input
                  type="checkbox"
                  className="a-listing-select"
                  hidden={!canEdit}
                  checked={allSelected}
                  disabled={pending}
                  onChange={(event) => selectAll(event.currentTarget.checked)}
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
                      checked={selected.has(listing.id)}
                      disabled={pending}
                      onChange={(event) => selectOne(listing.id, event.currentTarget.checked)}
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
                        <small>{listing.locality ?? listing.shortDescription}</small>
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
                          href={`/wedding/${listing.category.slug}/${listing.slug}`}
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
      <ConfirmDialog
        open={confirmDelete}
        title="Delete selected listings?"
        message={`This will permanently delete ${selected.size} selected listing${selected.size === 1 ? "" : "s"} and their photos. Their enquiries will be kept.`}
        confirmLabel={`Delete ${selected.size} listing${selected.size === 1 ? "" : "s"}`}
        pending={pending}
        onConfirm={() => void performBulkAction("delete")}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
