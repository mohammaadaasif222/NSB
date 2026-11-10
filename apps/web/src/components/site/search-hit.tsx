import Link from "next/link";
import type { ListingSummary, ProjectSummary } from "@nsb/shared";
import { formatPrice } from "@nsb/shared/client";

/**
 * One row of the site search: a vendor, a real estate project or a category. Used by the header's
 * dropdown and the /search page. Imports only types from "@nsb/shared", so the dropdown's
 * JavaScript stays free of Zod.
 */
export interface SearchHit {
  key: string;
  href: string;
  title: string;
  /** e.g. "Wedding Venues · Sector 18, Noida". */
  meta: string;
  imageUrl: string | null;
  kind: "Vendor" | "Project" | "Category";
}

const place = (p: { area: string; locality?: string | null }) => [p.locality, p.area].filter(Boolean).join(", ");

/** A vendor, or null when it has no public address (outside a vertical). */
export function listingHit(l: ListingSummary): SearchHit | null {
  if (!l.vertical) return null;
  return {
    key: `l-${l.id}`,
    href: `/${l.vertical}/${l.category.slug}/${l.slug}`,
    title: l.name,
    meta: `${l.category.name} · ${place(l)}`,
    imageUrl: l.coverImageUrl,
    kind: "Vendor",
  };
}

export function projectHit(p: ProjectSummary): SearchHit {
  const from = p.minPrice === null ? "Price on request" : `From ₹${formatPrice(p.minPrice)}`;
  return {
    key: `p-${p.id}`,
    href: `/real-estate/${p.slug}`,
    title: p.name,
    meta: `${p.builder} · ${place(p)} · ${from}`,
    imageUrl: p.coverImageUrl,
    kind: "Project",
  };
}

/** A category the search box can jump to: "Wedding Venues" under "Wedding". */
export interface SearchCategory {
  name: string;
  href: string;
  parent: string | null;
}

export const categoryHit = (c: SearchCategory): SearchHit => ({
  key: `c-${c.href}`,
  href: c.href,
  title: c.name,
  meta: c.parent ? `Category in ${c.parent}` : "Category",
  imageUrl: null,
  kind: "Category",
});

/** Categories whose name holds every word typed, best (name starts with the query) first. */
export function matchCategories(categories: SearchCategory[], q: string, limit: number): SearchCategory[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const words = query.split(/\s+/);
  return categories
    .filter((c) => {
      const name = c.name.toLowerCase();
      return words.every((w) => name.includes(w));
    })
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(query)) - Number(a.name.toLowerCase().startsWith(query)))
    .slice(0, limit);
}

/** Photo, or the first letter on a tinted tile. */
function Thumb({ hit }: { hit: SearchHit }) {
  return (
    <span className="sh-th" aria-hidden style={hit.imageUrl ? { backgroundImage: `url("${hit.imageUrl}")` } : undefined}>
      {hit.imageUrl ? null : hit.title.charAt(0).toUpperCase()}
    </span>
  );
}

export function SearchHitRow({ hit, active, onPick }: { hit: SearchHit; active?: boolean; onPick?: () => void }) {
  return (
    <Link href={hit.href} className={`sh-row${active ? " on" : ""}`} tabIndex={onPick ? -1 : undefined} onClick={onPick}>
      <Thumb hit={hit} />
      <span className="sh-tx">
        <span className="sh-t">{hit.title}</span>
        <span className="sh-m">{hit.meta}</span>
      </span>
      <span className="sh-k">{hit.kind}</span>
    </Link>
  );
}
