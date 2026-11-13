"use client";

import Form from "next/form";
import { usePathname, useRouter } from "next/navigation";
import { type KeyboardEvent, memo, useCallback, useId, useMemo, useState } from "react";
import type { ListingSummary, Paginated, ProjectSummary } from "@nsb/shared";
import { useLiveSearch } from "@/components/shared/use-live-search";
import { categoryHit, listingHit, matchCategories, projectHit, type SearchCategory, type SearchHit, SearchHitRow } from "./search-hit";
import { Icon } from "./nsb-home/bits";
import { ICON } from "./nsb-home/content";

/** How many of each the dropdown shows; the rest are on /search. */
const SHOWN = { categories: 3, listings: 5, projects: 3 };

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(res.statusText);
  return (await res.json()) as T;
}

/** Vendors and projects matching `q`, in every location, as one list of rows. */
async function searchSite(q: string, _page: number, signal: AbortSignal): Promise<Paginated<SearchHit>> {
  const query = encodeURIComponent(q);
  const [listings, projects] = await Promise.all([
    getJson<Paginated<ListingSummary>>(`/api/listings?q=${query}&pageSize=${SHOWN.listings}`, signal),
    getJson<Paginated<ProjectSummary>>(`/api/projects?q=${query}&pageSize=${SHOWN.projects}`, signal),
  ]);
  const items = [...listings.items.map(listingHit).filter((h) => h !== null), ...projects.items.map(projectHit)];
  return { items, total: listings.total + projects.total, page: 1, pageSize: items.length };
}

/**
 * The header's search box: as the visitor types it lists matching categories, vendors and real
 * estate projects. Arrow keys move through them; Enter opens the chosen one, or every result on
 * /search. Without JavaScript the box still submits to /search.
 */
export function HeaderSearch({ categories }: { categories: SearchCategory[] }) {
  const router = useRouter();
  const listId = useId();
  // Wedding vendor pages (/wedding/<category>/<vendor>) word it as in Makeup-Vendor-Page.html.
  const parts = usePathname().split("/").filter(Boolean);
  const placeholder = parts[0] === "wedding" && parts.length === 3 ? "Search wedding vendors" : "Search wedding venues, salons, AC repair…";
  const { q, searched, change, loading, error, items } = useLiveSearch(searchSite);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const query = q.trim();
  // Categories follow the same pause in typing as the API search, so the list changes once per
  // pause, not on every key.
  const hits = useMemo(
    () => [...matchCategories(categories, searched, SHOWN.categories).map(categoryHit), ...(items ?? [])],
    [categories, searched, items],
  );
  const allHref = `/search?q=${encodeURIComponent(query)}`;
  // The last option is "See all results".
  const optionCount = hits.length + 1;
  const shown = open && query.length > 0;

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!query) return;
      e.preventDefault();
      setOpen(true);
      // Cycles through the options and back to the box itself (-1).
      const states = optionCount + 1;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => ((i + 1 + step + states) % states) - 1);
    } else if (e.key === "Enter" && shown && active >= 0 && active < hits.length) {
      e.preventDefault();
      close();
      router.push(hits[active].href);
    }
  };

  return (
    <Form
      action="/search"
      role="search"
      className="sb"
      onSubmit={(e) => {
        if (!query) e.preventDefault();
        close();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <Icon d={ICON.search} size={18} />
      <input
        type="search"
        name="q"
        value={q}
        maxLength={100}
        autoComplete="off"
        placeholder={placeholder}
        aria-label="Search"
        role="combobox"
        aria-expanded={shown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => {
          change(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {shown && (
        // mousedown would blur the input before the click lands, closing the list.
        <div className="sh-dd" onMouseDown={(e) => e.preventDefault()}>
          <HitList id={listId} hits={hits} active={active} onPick={close} />
          {loading && hits.length === 0 && <p className="sh-msg">Searching…</p>}
          {!loading && error && <p className="sh-msg">{error}</p>}
          {!loading && !error && items && hits.length === 0 && <p className="sh-msg">No results for “{searched}”.</p>}
          <a
            id={`${listId}-${hits.length}`}
            href={allHref}
            className={`sh-all${active === hits.length ? " on" : ""}`}
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              close();
              router.push(allHref);
            }}
          >
            See all results for “{query}”
          </a>
        </div>
      )}
    </Form>
  );
}

/** The result rows. Memoised: typing re-renders only the box until the next results arrive. */
const HitList = memo(function HitList({ id, hits, active, onPick }: { id: string; hits: SearchHit[]; active: number; onPick: () => void }) {
  return (
    <ul id={id} role="listbox" aria-label="Search results">
      {hits.map((hit, i) => (
        <li key={hit.key} id={`${id}-${i}`} role="option" aria-selected={i === active}>
          <SearchHitRow hit={hit} active={i === active} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
});
