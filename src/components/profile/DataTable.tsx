import type { ReactElement, ReactNode } from 'react';

/**
 * The account area's ledger.
 *
 * Referral and Transactions are the same table drawn twice in the design —
 * same 46px header band, same 42px rows, same hairline between them, same
 * right-aligned figure closing the row. Only the surface under it and the
 * columns differ, so those are the props and everything else lives here.
 */

export interface DataColumn<T> {
  key: string;
  header: ReactNode;
  /**
   * Track width in the design's own units. The tracks share them as `fr`, so
   * the table keeps its proportions at whatever width it is given.
   */
  width: number;
  /** Right-aligned. Both ledgers close with a figure. */
  end?: boolean;
  cell: (row: T) => ReactNode;
}

interface Props<T> {
  columns: readonly DataColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** The card's surface utility — the two ledgers sit on different ones. */
  surface: string;
  /**
   * Narrowest the tracks compress to before the table scrolls instead. Set it
   * to the width at which the longest value in every column still fits.
   */
  minWidth: string;
  /** Heading inside the card, above the header band. */
  title?: ReactNode;
  /** Shown in place of the rows when there are none. */
  empty?: ReactNode;
}

/* No gap between the tracks — the design's column positions already carry
   their own spacing, so adding one steals it back and the last column is the
   one that loses. 26 of inset at the opening edge, 55 at the closing one,
   which is where the design right-aligns the final figure. */
/* The design's insets are generous — 26 in, 55 out — and across six columns
   that is 486px of air. Worth it in the 1268 panel it was drawn for; on a
   laptop's it is most of a column, so the insets close up and the table keeps
   more of its content on screen before it starts scrolling. */
const CELLS = 'grid items-center ps-4 pe-6 @panel:ps-6.5 @panel:pe-13.75';

/** Every status reads the same in the design — the word carries it, not a colour. */
export const TableBadge = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="inline-flex h-6 w-fit items-center rounded-full bg-white/10 px-2.5 text-xs leading-5 text-white">
    {children}
  </span>
);

const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  surface,
  minWidth,
  title,
  empty,
}: Props<T>): ReactElement => {
  const tracks = { gridTemplateColumns: columns.map((c) => `${c.width}fr`).join(' ') };

  return (
    <div className={`${surface} overflow-hidden`}>
      {title && <p className="px-6.5 pt-3.5 pb-3.75 rl-h-card text-white">{title}</p>}

      {/* The table keeps its width and scrolls inside the card rather than
          pushing the page sideways or crushing the columns. */}
      <div className="thin-scrollbar overflow-x-auto">
        <div style={{ minWidth }}>
          <div className={`${CELLS} h-11.5 bg-white/10`} style={tracks}>
            {columns.map((c) => (
              <span
                key={c.key}
                className={`truncate text-sm leading-5 text-white/70 ${c.end ? 'text-end' : ''}`}
              >
                {c.header}
              </span>
            ))}
          </div>

          {rows.length === 0
            ? empty && (
                <div className="px-6 py-14 text-center text-sm leading-5 text-[#9da2b4]">
                  {empty}
                </div>
              )
            : rows.map((row) => (
                <div
                  key={rowKey(row)}
                  className={`${CELLS} h-10.5 border-b border-white/15 backdrop-blur-[7px] last:border-b-0`}
                  style={tracks}
                >
                  {columns.map((c) => (
                    <span key={c.key} className={c.end ? 'text-end' : 'min-w-0'}>
                      {c.cell(row)}
                    </span>
                  ))}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
