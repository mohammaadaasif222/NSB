"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ListingStatus } from "@nsb/shared";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** Publish (Draft or Hidden → Live) or unpublish (Live → Draft) from the listings table. */
export function ListingStatusButton({ id, name, status }: { id: string; name: string; status: ListingStatus }) {
  const { run, pending } = useAdminAction();
  const next: ListingStatus = status === "live" ? "draft" : "live";
  const label = status === "live" ? `Unpublish ${name}` : `Publish ${name}`;

  return (
    <button
      type="button"
      aria-label={label}
      title={status === "live" ? "Unpublish" : "Publish"}
      disabled={pending}
      onClick={() =>
        run(() => adminClient.patch(`/admin/listings/${id}`, { status: next }), {
          success: next === "live" ? "Listing published" : "Listing moved to draft",
        })
      }
    >
      {status === "live" ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
    </button>
  );
}
