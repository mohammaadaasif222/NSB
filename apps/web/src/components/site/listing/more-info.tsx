"use client";

import { useId, useState } from "react";

/**
 * "+N more" link after a card's chips: hovering it (or tapping it on a phone) shows every item
 * in a dark popup above the chips. It sits above the card's stretched link, so it doesn't navigate.
 */
export function MoreInfo({ items, hiddenCount }: { items: string[]; hiddenCount: number }) {
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
        className="relative z-10 py-1 text-xs font-semibold whitespace-nowrap text-ink-soft underline underline-offset-2 hover:text-brand"
      >
        +{hiddenCount} more
      </button>
      {/* pb-2 rather than a margin, so the pointer can move up into the popup without it closing. */}
      <div
        id={id}
        className={`absolute bottom-full left-0 z-20 max-w-full pb-2 transition-opacity group-hover/more:visible group-hover/more:opacity-100 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <ul className="list-disc rounded-md bg-[#3d3d3d]/95 py-3 pr-5 pl-8 text-sm leading-relaxed font-medium text-white shadow-lg">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </span>
  );
}
