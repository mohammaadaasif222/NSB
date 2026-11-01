"use client";

import { useEffect } from "react";

/** A screen that failed to load, usually because the API is briefly unavailable. The admin menu stays. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <div className="flex flex-col items-start gap-3 p-6">
      <h1 className="text-lg font-semibold text-zinc-900">This screen could not load</h1>
      <p className="text-sm text-zinc-600">Nothing was changed. Check your connection and try again.</p>
      <button type="button" onClick={() => retry()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
        Try again
      </button>
    </div>
  );
}
