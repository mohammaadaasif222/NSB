"use client";

import { useState } from "react";
import type { ImageStorageProvider, StorageProviderStatus, StorageTestResult } from "@nsb/shared";
import { Button } from "@/components/admin/form";
import { Badge } from "@/components/admin/ui";
import { adminClient } from "@/lib/admin-client";

export function StatusBadge({ status }: { status: StorageProviderStatus }) {
  if (status.problem) return <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Needs attention</span>;
  if (!status.configured) return <Badge>Not configured</Badge>;
  return <Badge tone="good">{status.source === "env" ? "Configured on the server" : "Configured"}</Badge>;
}

/** Uploads and deletes a tiny image with the saved credentials, and shows the result inline. */
export function TestConnectionButton({ provider, disabled }: { provider: ImageStorageProvider; disabled?: boolean }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<StorageTestResult | null>(null);

  const test = async () => {
    setPending(true);
    setResult(null);
    try {
      setResult(await adminClient.post<StorageTestResult>("/admin/uploads/test", { provider }));
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={test} pending={pending} disabled={disabled}>
        {pending ? "Testing…" : "Test connection"}
      </Button>
      {result && (
        <p role="status" className={`order-last basis-full text-right text-xs ${result.ok ? "text-emerald-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </>
  );
}
