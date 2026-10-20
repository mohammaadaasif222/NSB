"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

/**
 * Phone-only "See more" for a long grid. Children mark the items to hide until expanded with
 * `max-sm:hidden max-sm:group-data-[expanded=true]/more:flex` (see `HIDDEN_UNTIL_EXPANDED`).
 * From `sm` up everything shows and the button is hidden.
 */
export function ShowMore({ children, hiddenCount, label }: { children: ReactNode; hiddenCount: number; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-expanded={open} className="group/more flex flex-col gap-4">
      {children}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mx-auto flex items-center gap-1.5 rounded-full border border-brand/30 bg-white px-5 py-2 text-sm font-semibold text-brand sm:hidden"
        >
          {open ? "See less" : `${label} (${hiddenCount} more)`}
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Class for items that stay hidden on phones until "See more" is tapped. */
export const HIDDEN_UNTIL_EXPANDED = "max-sm:hidden max-sm:group-data-[expanded=true]/more:block";
