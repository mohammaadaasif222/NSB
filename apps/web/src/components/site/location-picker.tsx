"use client";

import { type ReactNode, useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { LISTING_AREAS } from "@nsb/shared";
import { setSiteLocation } from "@/app/actions/location";
import { LOCATION_COOKIE, LOCATION_PATH_COOKIE, locationLabel, sameLocation, type SiteLocation } from "@/lib/location";

/**
 * Chooses the location for this page. The new choice shows at once (optimistic) while the cookie
 * is saved and the page re-renders on the server with filtered data; `pending` is true until then.
 */
export function useSiteLocation(current: SiteLocation | null) {
  const [optimistic, setOptimistic] = useOptimistic(current);
  const [pending, startTransition] = useTransition();
  const path = usePathname();
  // The header's layout is not re-rendered between pages, so `current` can be the last page's;
  // it counts only on the page it arrived on (or was chosen on).
  const [chosenOn, setChosenOn] = useState(current ? path : null);
  const [last, setLast] = useState(current);
  if (!sameLocation(current, last)) {
    setLast(current);
    setChosenOn(current ? path : null);
  }
  const location = chosenOn === path ? optimistic : null;
  const choose = (next: SiteLocation | null) => {
    if (sameLocation(next, location)) return;
    setChosenOn(next ? path : null);
    startTransition(async () => {
      setOptimistic(next);
      await setSiteLocation(next, path);
    });
  };
  return { location, choose, pending };
}

/**
 * On any other page the server already shows the default; this also forgets the old choice, so
 * going back to the page it was made on opens on the default too.
 */
function useForgetOtherPageLocation() {
  const path = usePathname();
  useEffect(() => {
    const saved = document.cookie.split("; ").find((c) => c.startsWith(`${LOCATION_PATH_COOKIE}=`));
    if (!saved || decodeURIComponent(saved.slice(LOCATION_PATH_COOKIE.length + 1)) === path) return;
    for (const name of [LOCATION_COOKIE, LOCATION_PATH_COOKIE]) document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  }, [path]);
}

/**
 * Location menu for the site header, as in the NSB Live Demo: Noida, Greater Noida or Greater
 * Noida West, plus All locations. Styled by site-header.css (.loc, .lb).
 */
export function LocationPicker({ current }: { current: SiteLocation | null }) {
  const { location, choose, pending } = useSiteLocation(current);
  useForgetOtherPageLocation();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = locationLabel(location);
  return (
    <div ref={box} className={`loc relative ${pending ? "opacity-70" : ""}`}>
      <button type="button" className="lb" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-busy={pending || undefined} onClick={() => setOpen((o) => !o)}>
        <MapPin size={16} aria-hidden />
        <span>{label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Choose your location"
          className="absolute top-[calc(100%+10px)] right-0 z-[60] min-w-[190px] rounded-[14px] border border-[#e5e7eb] bg-white p-1.5 text-left shadow-[0_24px_44px_-22px_rgba(15,23,42,.35)]"
        >
          {/* null is "All locations": listings from every area, mixed. */}
          {[null, ...LISTING_AREAS].map((area) => {
            const on = (location?.area ?? null) === area;
            return (
              <button
                key={area ?? "all"}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                onClick={() => {
                  setOpen(false);
                  choose(area ? { area } : null);
                }}
                className="flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-brand-soft hover:text-brand aria-checked:bg-brand-soft aria-checked:text-brand"
              >
                <span className="flex-1">{area ?? locationLabel(null)}</span>
                {on && <Check className="size-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** "×" on a location chip: clears the location everywhere, optimistically. */
export function ClearLocationButton({ current, className, children }: { current: SiteLocation | null; className?: string; children: ReactNode }) {
  const { choose, pending } = useSiteLocation(current);
  return (
    <button type="button" className={className} disabled={pending} aria-busy={pending || undefined} onClick={() => choose(null)}>
      {children}
    </button>
  );
}
