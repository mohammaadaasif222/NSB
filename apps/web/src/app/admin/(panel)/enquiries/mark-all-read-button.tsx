"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@/components/admin/form";
import { useUnreadEnquiries } from "@/components/admin/unread-enquiries";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

export function MarkAllReadButton() {
  const unread = useUnreadEnquiries();
  const { run, pending } = useAdminAction();
  return (
    <Button
      variant="secondary"
      disabled={unread === 0}
      pending={pending}
      onClick={() => run(() => adminClient.post("/admin/enquiries/read-all"), { success: "All enquiries marked as read" })}
    >
      <CheckCheck className="size-4" aria-hidden /> Mark all read
    </Button>
  );
}
