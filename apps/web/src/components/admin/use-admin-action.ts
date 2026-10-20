"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { RequestError } from "@/lib/admin-client";
import { useToast } from "./toast";

type Result<T> = { ok: true; data: T } | { ok: false; error: RequestError };

/**
 * Runs one admin mutation at a time: ignores repeat clicks while pending, shows a toast,
 * and refreshes the server-rendered data on success (no full page reload).
 */
export function useAdminAction() {
  const router = useRouter();
  const toast = useToast();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T>(action: () => Promise<T>, { success, refresh = true }: { success?: string; refresh?: boolean } = {}): Promise<Result<T>> => {
      if (busy.current) return { ok: false, error: new RequestError(0, "Already saving") };
      busy.current = true;
      setPending(true);
      try {
        const data = await action();
        if (success) toast.success(success);
        if (refresh) router.refresh();
        return { ok: true, data };
      } catch (err) {
        const error = err instanceof RequestError ? err : new RequestError(0, "Something went wrong. Please try again.");
        if (error.status !== 401) toast.error(error.message);
        return { ok: false, error };
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [router, toast],
  );

  return { run, pending };
}
