"use client";

import { useId, useState } from "react";

/**
 * "+N more" pill after a card's chips: hovering it (or tapping it) shows the other items in a dark
 * popup above the chips. It sits above the card's stretched link, so it doesn't navigate.
 */
export function MoreInfo({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="group/more">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="lp-more"
      >
        +{items.length} more
      </button>
      {/* pb-2 rather than a margin, so the pointer can move up into the popup without it closing. */}
      <div
        id={id}
        className={`absolute bottom-full left-0 z-20 w-85 max-w-full pb-2 transition-opacity group-hover/more:visible group-hover/more:opacity-100 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div className="max-h-50 overflow-auto rounded-xl bg-[#0f172a] px-3.5 py-3 text-white shadow-lg">
          <b className="text-xs tracking-wide text-[#93c5fd] uppercase">More features</b>
          <ul className="mt-2 list-inside list-disc columns-2 gap-4 text-[12.5px] leading-snug">
            {items.map((item, i) => (
              <li key={i} className="mb-1.5 break-inside-avoid">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </span>
  );
}
