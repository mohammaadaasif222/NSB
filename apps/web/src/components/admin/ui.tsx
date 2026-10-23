import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="a-hd">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** One KPI tile in an .a-kp row: icon, label, big value and a note. */
export function Kpi({ label, value, note, icon }: { label: string; value: ReactNode; note: string; icon: ReactNode }) {
  return (
    <div className="a-card">
      <div className="a-ic">{icon}</div>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>{note}</small>
      </div>
    </div>
  );
}

export interface Column<T> {
  header: string;
  headerContent?: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  empty,
  rowClassName,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  empty: string;
  rowClassName?: (row: T) => string;
  /** Mouse shortcut only: keep a button or link in the row for keyboard users. */
  onRowClick?: (row: T) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
        {empty}
      </p>
    );
  }
  // Below `sm` each row is a stacked card: the header becomes a label before each cell (data-label).
  const mobileCell =
    "max-sm:flex max-sm:w-auto max-sm:items-start max-sm:gap-3 max-sm:px-0 max-sm:py-1 max-sm:text-left max-sm:whitespace-normal";
  const mobileLabel =
    "max-sm:before:w-24 max-sm:before:shrink-0 max-sm:before:pt-0.5 max-sm:before:text-xs max-sm:before:font-semibold max-sm:before:tracking-wide max-sm:before:text-zinc-500 max-sm:before:uppercase max-sm:before:content-[attr(data-label)]";
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm sm:min-w-150">
        <thead className="hidden bg-zinc-50 text-xs text-zinc-500 sm:table-header-group">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={`px-3.5 py-3 font-bold whitespace-nowrap ${c.className ?? ""}`}>
                {c.headerContent ?? c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 max-sm:block">
          {rows.map((row, index) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick && (() => onRowClick(row))}
              className={`align-middle hover:bg-zinc-50 max-sm:block max-sm:px-4 max-sm:py-3 ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row) ?? ""}`}
            >
              {columns.map((c) => {
                const content = c.cell(row, index);
                const empty = content === null || content === undefined || content === false || content === "";
                return (
                  <td
                    key={c.header}
                    data-label={c.header || undefined}
                    className={`px-3.5 py-3 text-zinc-700 ${c.className ?? ""} ${mobileCell} ${c.header ? mobileLabel : "max-sm:justify-end"} ${empty ? "max-sm:hidden" : ""}`}
                  >
                    {/* One wrapper so a multi-part cell stays one block beside its label. */}
                    <div className="min-w-0">{content}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" }) {
  const tones = { neutral: "a-pl draft", good: "a-pl live" };
  return <span className={tones[tone]}>{children}</span>;
}

/** Previous / page x of y / Next. `href` builds the URL for a page, keeping the current filters. */
export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (page: number) => string }) {
  if (pageCount <= 1) return null;
  const link = "a-btn g s";
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3 text-sm">
      {page > 1 && (
        <Link href={href(page - 1)} className={link}>
          Previous
        </Link>
      )}
      <span className="text-zinc-500">
        Page {page} of {pageCount}
      </span>
      {page < pageCount && (
        <Link href={href(page + 1)} className={link}>
          Next
        </Link>
      )}
    </nav>
  );
}
