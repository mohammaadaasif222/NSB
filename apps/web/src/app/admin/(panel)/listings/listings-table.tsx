"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import type { ListingSummary } from "@nsb/shared";
import { BulkBar, BulkDeleteDialog } from "@/components/admin/bulk-bar";
import { DeleteListingButton } from "@/components/admin/delete-listing-button";
import { Badge, DataTable } from "@/components/admin/ui";
import { useBulkActions } from "@/components/admin/use-bulk-actions";
import { formatDateTime } from "@/lib/format";

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
  const bulk = useBulkActions(listings, "/admin/listings");

  return (
    <>
      <BulkBar bulk={bulk} />
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
                checked={bulk.allSelected}
                disabled={bulk.pending}
                onChange={(event) => bulk.selectAll(event.currentTarget.checked)}
                aria-label="Select all listings on this page"
              />
            ),
            className: "w-12 text-center",
            cell: (listing) => (
              <input
                type="checkbox"
                className="a-listing-select"
                checked={bulk.selected.has(listing.id)}
                disabled={bulk.pending}
                onChange={(event) => bulk.selectOne(listing.id, event.currentTarget.checked)}
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
      <BulkDeleteDialog
        bulk={bulk}
        message={`This will permanently delete ${bulk.selected.size} selected listing${bulk.selected.size === 1 ? "" : "s"} and their photos. Their enquiries will be kept.`}
      />
    </>
  );
}
