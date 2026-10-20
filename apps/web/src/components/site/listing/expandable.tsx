"use client";

import { useState, type ReactNode } from "react";

const toggleClass = "mt-2 text-sm font-semibold text-brand hover:underline";

/** Long text clamped to a few lines with "Read more". */
export function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 280;
  return (
    <div>
      <p className={`text-base leading-7 whitespace-pre-line text-ink-soft ${long && !open ? "line-clamp-3" : ""}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className={toggleClass}>
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/** Shows the first `limit` items with a "View All (n)" toggle (or `moreLabel`). */
export function ExpandableList({ items, limit, className, moreLabel }: { items: ReactNode[]; limit: number; className?: string; moreLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ul className={className}>{open ? items : items.slice(0, limit)}</ul>
      {items.length > limit && (
        <button type="button" onClick={() => setOpen(!open)} className={toggleClass}>
          {open ? "Show less" : (moreLabel ?? `View All (${items.length})`)}
        </button>
      )}
    </div>
  );
}
