"use client";

import type { ReactNode } from "react";
import { ConfirmDialog } from "./dialog";
import type { useBulkActions } from "./use-bulk-actions";

type Bulk = ReturnType<typeof useBulkActions>;

/** The bar above a table while rows are selected. */
export function BulkBar({ bulk }: { bulk: Bulk }) {
  if (bulk.selected.size === 0) return null;
  return (
    <div className="a-bulk">
      <span className="a-bulk-count">{bulk.selected.size} selected</span>
      <div className="a-bulk-actions">
        <button type="button" onClick={() => void bulk.perform("publish")} disabled={bulk.pending}>
          Publish
        </button>
        <button type="button" onClick={() => void bulk.perform("unpublish")} disabled={bulk.pending}>
          Unpublish
        </button>
        <button type="button" className="danger" onClick={() => bulk.setConfirmDelete(true)} disabled={bulk.pending}>
          Delete
        </button>
      </div>
    </div>
  );
}

/** Asks before the bar's Delete runs. */
export function BulkDeleteDialog({ bulk, message }: { bulk: Bulk; message: ReactNode }) {
  const count = bulk.selected.size;
  return (
    <ConfirmDialog
      open={bulk.confirmDelete}
      title="Delete selected listings?"
      message={message}
      confirmLabel={`Delete ${count} listing${count === 1 ? "" : "s"}`}
      pending={bulk.pending}
      onConfirm={() => void bulk.perform("delete")}
      onClose={() => bulk.setConfirmDelete(false)}
    />
  );
}
