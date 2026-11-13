"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";

/** The heart on a card. Saved projects are not stored yet (customer accounts are Phase 2). */
export function SaveButton({ name }: { name: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <button type="button" className="re-hr" aria-pressed={saved} aria-label={`Save ${name}`} onClick={() => setSaved((s) => !s)}>
      ♥
    </button>
  );
}

/** Relevance / price sort; changing it reloads the list from page 1. */
export function SortSelect({
  value,
  className = "re-sort",
  defaultLabel = "Relevance",
}: {
  value: string;
  className?: string;
  /** The first option's label. */ defaultLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <select
      className={className}
      aria-label="Sort projects"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        if (e.target.value === "rel") next.delete("sort");
        else next.set("sort", e.target.value);
        next.delete("page");
        router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
      }}
    >
      <option value="rel">{defaultLabel}</option>
      <option value="lo">Price: Low to High</option>
      <option value="hi">Price: High to Low</option>
    </select>
  );
}

/** A filter as a dropdown (phones show these instead of the chips); "" clears it. Changing it reloads from page 1. */
export function FilterSelect({
  name,
  value,
  label,
  options,
  className = "re-sort re-fsel",
}: {
  name: string;
  value: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <select
      className={className}
      aria-label={label}
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        if (e.target.value) next.set(name, e.target.value);
        else next.delete(name);
        next.delete("page");
        router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** A horizontal row with previous / next arrows (the NSB Shorts strip). */
export function ShortsRow({ header, children }: { header: ReactNode; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => row.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  return (
    <>
      <div className="re-sth">
        {header}
        <div className="re-ar">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous">
            ‹
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next">
            ›
          </button>
        </div>
      </div>
      <div className="re-rl" ref={row}>
        {children}
      </div>
    </>
  );
}
