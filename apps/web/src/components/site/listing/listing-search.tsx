import Form from "next/form";
import { Search } from "lucide-react";

/**
 * Search box for one category's listings. Submits as a GET to the same page (`?q=`), which
 * starts again at page 1 and keeps the chosen list/grid layout and tag filter.
 */
export function ListingSearch({ categoryName, q, view, tag }: { categoryName: string; q?: string; view: "grid" | "list"; tag?: string }) {
  return (
    <Form action="" scroll={false} role="search" className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
      <input type="hidden" name="view" value={view} />
      {tag && <input type="hidden" name="tag" value={tag} />}
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={q}
        maxLength={100}
        placeholder={`Search ${categoryName}...`}
        aria-label={`Search ${categoryName}`}
        className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pr-3 pl-9 text-base text-ink sm:text-sm placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft focus:outline-none"
      />
    </Form>
  );
}
