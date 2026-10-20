import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page numbers to show: always the first and last, the current page and its neighbours, gaps as "gap". */
export function pageItems(page: number, pageCount: number): Array<number | "gap"> {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

const box = "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm";

/** Numbered pagination: Previous, 1 … 4 5 6 … 12, Next (arrows only on phones). `href` builds the link for a page. */
export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (page: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} aria-label="Previous page" className={`${box} gap-1 border-[#e5e7eb] text-ink-soft hover:border-brand hover:text-brand`}>
          <ChevronLeft className="size-4" aria-hidden /> <span className="hidden sm:inline">Previous</span>
        </Link>
      )}
      {pageItems(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={`${box} border-brand bg-brand font-semibold text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} aria-label={`Page ${p}`} className={`${box} border-[#e5e7eb] text-ink-soft hover:border-brand hover:text-brand`}>
            {p}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link href={href(page + 1)} aria-label="Next page" className={`${box} gap-1 border-[#e5e7eb] text-ink-soft hover:border-brand hover:text-brand`}>
          <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
