"use client";

import { type ReactNode, useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { LISTING_AREAS } from "@nsb/shared";
import { setSiteLocation } from "@/app/actions/location";
import { locationLabel, sameLocation, type SiteLocation } from "@/lib/location";

/**
 * Chooses the site-wide location. The new choice shows at once (optimistic) while the cookie is
 * saved and the page re-renders on the server with filtered data; `pending` is true until then.
 */
export function useSiteLocation(current: SiteLocation | null) {
  const [location, setOptimistic] = useOptimistic(current);
  const [pending, startTransition] = useTransition();
  const choose = (next: SiteLocation | null) => {
    if (sameLocation(next, location)) return;
    startTransition(async () => {
      setOptimistic(next);
      await setSiteLocation(next);
    });
  };
  return { location, choose, pending };
}

/**
 * Location menu for the site headers, as in the NSB Live Demo: Noida, Greater Noida or Greater
 * Noida West, plus All locations. `variant` only changes the trigger, so it matches each header's design.
 */
export function LocationPicker({ current, variant }: { current: SiteLocation | null; variant: "home" | "site" }) {
  const { location, choose, pending } = useSiteLocation(current);
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
  const trigger =
    variant === "home" ? (
      <button type="button" className="lb" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-busy={pending || undefined} onClick={() => setOpen((o) => !o)}>
        <MapPin size={16} aria-hidden />
        <span>{label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        className="flex items-center gap-1"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-busy={pending || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex rounded-full bg-brand-soft p-1.5">
          <MapPin className="size-4 text-brand" aria-hidden />
        </span>
        <span className="hidden max-w-44 truncate pl-1 text-sm leading-5 font-medium whitespace-nowrap text-[#4b5563] sm:inline">{label}</span>
        <span className="sr-only sm:hidden">Location: {label}</span>
        <ChevronDown className="size-5 text-muted" aria-hidden />
      </button>
    );

  return (
    <div ref={box} className={`relative ${variant === "home" ? "loc" : ""} ${pending ? "opacity-70" : ""}`}>
      {trigger}
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
