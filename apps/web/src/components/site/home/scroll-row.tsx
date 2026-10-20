"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

/**
 * A horizontally scrolling row of cards: swipe on phones (snapping card by card, like an app),
 * left/right arrows on larger screens. Each arrow shows only while there is more to scroll that way,
 * so a row that fits needs no arrows at all.
 */
export function ScrollRow({ children, label, className = "", tone = "light" }: { children: ReactNode; label: string; className?: string; tone?: "light" | "dark" }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 240), behavior: "smooth" });
  };

  const arrow = `absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-colors md:flex ${
    tone === "dark" ? "bg-white text-night hover:bg-white/90" : "border border-line bg-white text-ink hover:bg-surface"
  }`;

  return (
    <div className="relative">
      <ul ref={ref} aria-label={label} className={`no-scrollbar flex snap-x snap-mandatory scroll-smooth overflow-x-auto ${className}`}>
        {children}
      </ul>
      {edges.start && (
        <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`} className={`${arrow} -left-2 lg:-left-5`}>
          <ChevronLeft className="size-6" aria-hidden />
        </button>
      )}
      {edges.end && (
        <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`} className={`${arrow} -right-2 lg:-right-5`}>
          <ChevronRight className="size-6" aria-hidden />
        </button>
      )}
    </div>
  );
}
