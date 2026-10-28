"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/** Phones only: goes back in history, or to `fallback` when the page was opened directly. */
export function BackButton({ fallback, className = "" }: { fallback: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className={`inline-flex items-center gap-0.5 shrink-0 rounded-full border border-brand/30 bg-white py-1 pr-2.5 pl-1.5 text-[13px] font-medium text-brand sm:hidden ${className}`}
    >
      <ChevronLeft className="size-4" aria-hidden /> Back
    </button>
  );
}
