"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/dialog";
import { IconButton } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** Delete with confirmation. `redirectTo` navigates away afterwards (used on the edit page). */
export function DeleteListingButton({ id, name, redirectTo }: { id: string; name: string; redirectTo?: string }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState(false);

  const remove = async () => {
    const result = await run(() => adminClient.delete(`/admin/listings/${id}`), { success: "Listing deleted", refresh: !redirectTo });
    if (!result.ok) return;
    setOpen(false);
    if (redirectTo) router.push(redirectTo);
  };

  return (
    <>
      <IconButton label={`Delete ${name}`} onClick={() => setOpen(true)} className="dl hover:text-red-600">
        <Trash2 className="size-4" aria-hidden />
      </IconButton>
      <ConfirmDialog
        open={open}
        title="Delete listing?"
        message={
          <>
            <b>{name}</b> and its photos will be removed permanently. Its enquiries are kept.
          </>
        }
        pending={pending}
        onConfirm={remove}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
