"use client";

import { type ReactNode, useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import type { LocationOption } from "@nsb/shared";
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

/** Shows a long locality list with a search box above it. */
const SEARCH_FROM = 8;

/**
 * Location picker for the site headers: an area, then a locality such as Sector 18. `variant`
 * only changes the trigger, so it matches each header's design; the panel is the same everywhere.
 */
export function LocationPicker({
  current,
  options,
  variant,
}: {
  current: SiteLocation | null;
  options: LocationOption[];
  variant: "home" | "site";
}) {
  const { location, choose, pending } = useSiteLocation(current);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(location?.area ?? options[0]?.area ?? "");
  const [filter, setFilter] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  const pick = (next: SiteLocation | null) => {
    setOpen(false);
    setFilter("");
    choose(next);
  };

  const area = options.find((o) => o.area === tab) ?? options[0];
  const term = filter.trim().toLowerCase();
  const localities = area ? area.localities.filter((l) => !term || l.name.toLowerCase().includes(term)) : [];
  const label = locationLabel(location);
  const isOn = (a: string, l: string | null) => location?.area === a && (location.locality ?? null) === l;

  const trigger =
    variant === "home" ? (
      <button type="button" className="lb" aria-expanded={open} aria-controls={panelId} aria-busy={pending || undefined} onClick={() => setOpen((o) => !o)}>
        <MapPin size={16} aria-hidden />
        <span>{label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
    ) : (
      <button type="button" className="flex items-center gap-1" aria-expanded={open} aria-controls={panelId} aria-busy={pending || undefined} onClick={() => setOpen((o) => !o)}>
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
          id={panelId}
          role="dialog"
          aria-label="Choose your location"
          className="absolute top-[calc(100%+10px)] right-0 z-[60] flex w-[min(340px,calc(100vw-32px))] flex-col gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-3 text-left text-sm text-ink shadow-[0_24px_44px_-22px_rgba(15,23,42,.35)]"
        >
          <p className="px-1 text-xs font-bold tracking-wide text-muted uppercase">Choose your location</p>
          <div className="flex gap-1 rounded-xl bg-surface p-1" role="tablist" aria-label="Area">
            {options.map((o) => (
              <button
                key={o.area}
                type="button"
                role="tab"
                aria-selected={o.area === area?.area}
                onClick={() => {
                  setTab(o.area);
                  setFilter("");
                }}
                className="flex-1 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-soft aria-selected:bg-white aria-selected:text-brand aria-selected:shadow-sm"
              >
                {o.area}
              </button>
            ))}
          </div>

          {area && (
            <div role="tabpanel" className="flex flex-col gap-2">
              {area.localities.length >= SEARCH_FROM && (
                <label className="relative">
                  <span className="sr-only">Search localities in {area.area}</span>
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
                  <input
                    type="search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={`Search sectors in ${area.area}`}
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white pr-2 pl-9 text-base outline-none focus:border-brand sm:text-sm"
                  />
                </label>
              )}
              <ul className="flex max-h-64 flex-col overflow-y-auto">
                <Option on={isOn(area.area, null)} count={area.count} onClick={() => pick({ area: area.area, locality: null })}>
                  All of {area.area}
                </Option>
                {localities.map((l) => (
                  <Option key={l.name} on={isOn(area.area, l.name)} count={l.count} onClick={() => pick({ area: area.area, locality: l.name })}>
                    {l.name}
                  </Option>
                ))}
              </ul>
              {area.localities.length === 0 && <p className="px-1 text-xs text-muted">No sectors listed in {area.area} yet.</p>}
              {term && localities.length === 0 && <p className="px-1 text-xs text-muted">No sector matches “{filter}”.</p>}
            </div>
          )}

          {location && (
            <button type="button" onClick={() => pick(null)} className="self-start px-1 text-[13px] font-semibold text-brand hover:underline">
              Show all locations
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Option({ on, count, onClick, children }: { on: boolean; count: number; onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface aria-pressed:bg-brand-soft aria-pressed:font-semibold aria-pressed:text-brand"
      >
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <span className="text-xs text-muted tabular-nums">{count}</span>
        {on && <Check className="size-4 shrink-0" aria-hidden />}
      </button>
    </li>
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
