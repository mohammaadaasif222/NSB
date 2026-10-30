"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FilterMenuItem {
  label: string;
  href: string;
  current: boolean;
  /** Small number after the label, e.g. listings in the chosen location. */
  count?: number;
}

/** Header dropdown on the category page. `wide` lays its links out in two columns of tags. */
export function FilterMenu({ label, ariaLabel, items, wide }: { label: string; ariaLabel: string; items: FilterMenuItem[]; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={root} className={`lp-dd ${open ? "is-open" : ""}`}>
      <button type="button" aria-expanded={open} aria-label={`${ariaLabel}: ${label}`} onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <ChevronDown aria-hidden />
      </button>
      {open && (
        <nav className={`lp-dm ${wide ? "is-wide" : ""}`} aria-label={ariaLabel}>
          {items.map((item) => (
            <Link key={item.label} href={item.href} scroll={false} aria-current={item.current ? "true" : undefined} onClick={() => setOpen(false)}>
              {item.label}
              {item.count !== undefined && <small>{item.count}</small>}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
