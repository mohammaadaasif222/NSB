"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Shown when a page or the site layout fails, usually because the API is briefly unavailable. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted">We could not load this page. Please try again in a moment.</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => retry()} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
          Try again
        </button>
        <Link href="/" className="text-sm font-semibold text-brand hover:underline">
          Go to home page
        </Link>
      </div>
    </main>
  );
}
