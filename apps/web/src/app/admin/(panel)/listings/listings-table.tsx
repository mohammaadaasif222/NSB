"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
import type { ListingStatus, ListingSummary } from "@nsb/shared";
import { ConfirmDialog } from "@/components/admin/dialog";
import { DeleteListingButton } from "./delete-listing-button";
import { useToast } from "@/components/admin/toast";
import { Badge, DataTable } from "@/components/admin/ui";
import { adminClient, RequestError } from "@/lib/admin-client";
import { formatDateTime } from "@/lib/format";

type BulkAction = "publish" | "unpublish" | "delete";

export function ListingsTable({
  listings,
  parentNames,
  empty,
  firstRowNumber,
}: {
  listings: ListingSummary[];
  parentNames: Record<string, string>;
  empty: string;
  firstRowNumber: number;
}) {
  const router = useRouter();
  const toast = useToast();
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
      {selected.size > 0 && (
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
      <DataTable
        rows={listings}
        rowKey={(listing) => listing.id}
        empty={empty}
        columns={[
          {
            header: "Select",
            headerContent: (
              <input
                type="checkbox"
                className="a-listing-select"
                checked={allSelected}
                disabled={pending}
                onChange={(event) => selectAll(event.currentTarget.checked)}
                aria-label="Select all listings on this page"
              />
            ),
            className: "w-12 text-center",
            cell: (listing) => (
              <input
                type="checkbox"
                className="a-listing-select"
                checked={selected.has(listing.id)}
                disabled={pending}
                onChange={(event) => selectOne(listing.id, event.currentTarget.checked)}
                aria-label={`Select ${listing.name}`}
              />
            ),
          },
          {
            header: "Sr. No.",
            cell: (_, index) => firstRowNumber + index,
            className: "w-20",
          },
          {
            header: "Business",
            cell: (listing) => (
              <Link href={`/admin/listings/${listing.id}`} className="font-medium text-zinc-900 hover:underline">
                {listing.name}
              </Link>
            ),
          },
          {
            header: "Category",
            cell: (listing) => (
              <>
                {listing.category.name}
                {parentNames[listing.category.id] && <span className="block text-xs text-zinc-500">in {parentNames[listing.category.id]}</span>}
              </>
            ),
          },
          { header: "Area", cell: (listing) => listing.area },
          {
            header: "Status",
            cell: (listing) =>
              listing.status === "live" ? (
                <Badge tone="good">Live</Badge>
              ) : (
                <Badge>{listing.status === "draft" ? "Draft" : "Hidden"}</Badge>
              ),
          },
          { header: "Added", cell: (listing) => formatDateTime(listing.createdAt), className: "whitespace-nowrap text-zinc-600" },
          { header: "Featured", cell: (listing) => (listing.isFeatured ? <Badge tone="good">Featured</Badge> : null) },
          {
            header: "Actions",
            className: "w-24 text-right",
            cell: (listing) => (
              <span className="flex justify-end gap-1">
                <Link
                  href={`/admin/listings/${listing.id}`}
                  aria-label={`Edit ${listing.name}`}
                  title="Edit"
                  className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <DeleteListingButton id={listing.id} name={listing.name} />
              </span>
            ),
          },
        ]}
      />
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
