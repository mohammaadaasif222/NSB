"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus } from "@nsb/shared";
import { adminClient, refreshPublicSite, RequestError } from "@/lib/admin-client";
import { useToast } from "./toast";

export type BulkAction = "publish" | "unpublish" | "delete";

/**
 * Row selection and the bulk publish, unpublish and delete for a table of listings. `endpoint` is
 * the rows' admin route. Rows that fail stay selected so they can be tried again.
 */
export function useBulkActions(rows: { id: string }[], endpoint: "/admin/listings" | "/admin/projects") {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const allSelected = rows.length > 0 && selected.size === rows.length;

  const selectAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map((row) => row.id)) : new Set());
  };

  const selectOne = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const perform = async (action: BulkAction) => {
    const ids = [...selected];
    if (!ids.length || pending) return;
    setPending(true);
    const results = await Promise.allSettled(
      ids.map((id) =>
        action === "delete"
          ? adminClient.delete(`${endpoint}/${id}`)
          : adminClient.patch(`${endpoint}/${id}`, { status: (action === "publish" ? "live" : "draft") satisfies ListingStatus }),
      ),
    );
    const failedIds = ids.filter((_, index) => results[index].status === "rejected");
    const succeeded = ids.length - failedIds.length;
    setSelected(new Set(failedIds));
    setConfirmDelete(false);
    setPending(false);
    if (succeeded > 0) {
      refreshPublicSite();
      router.refresh();
    }

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

  return { selected, pending, confirmDelete, setConfirmDelete, allSelected, selectAll, selectOne, perform };
}
