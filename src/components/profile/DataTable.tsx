import type { ReactElement, ReactNode } from 'react';

/**
 * The account area's ledger.
 *
 * Referral and Transactions are the same table drawn twice in the design —
 * same 47px header band, same 42px rows, same hairline between them, same
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
   one that loses. 28 of inset at the opening edge, 55 at the closing one,
   which is where the design right-aligns the final figure. */
/* The design’s insets — 28 in, 55 out. They used to close up to 16/24 below
   the `@panel` query, because at a fixed 28/55 they ate most of a column on a
   laptop's narrower panel. In `--u` they shrink with the panel by themselves,
   so the design's own numbers hold from `lg` up and the tighter pair is left
   to the phone, where the unit is 1px and 55 really would be too much. */
const CELLS =
  'grid items-center ps-[calc(var(--u)*16)] pe-[calc(var(--u)*24)] lg:ps-[calc(var(--u)*28)] lg:pe-[calc(var(--u)*55)]';

/** Every status reads the same in the design — the word carries it, not a colour. */
export const TableBadge = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="inline-flex h-[calc(var(--u)*24)] w-fit items-center rounded-full bg-white/10 px-[calc(var(--u)*10)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-white">
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
      {title && (
        <p className="px-[calc(var(--u)*28)] pt-[calc(var(--u)*14)] pb-[calc(var(--u)*15)] text-[length:max(min(11px,20px),calc(var(--u)*20))] leading-[calc(var(--u)*28)] font-medium text-white">
          {title}
        </p>
      )}

      {/* The table keeps its width and scrolls inside the card rather than
          pushing the page sideways or crushing the columns. */}
      <div className="thin-scrollbar overflow-x-auto">
        <div style={{ minWidth }}>
          <div className={`${CELLS} h-[calc(var(--u)*47)] bg-white/10`} style={tracks}>
            {columns.map((c) => (
              <span
                key={c.key}
                className={`truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-white/70 ${c.end ? 'text-end' : ''}`}
              >
                {c.header}
              </span>
            ))}
          </div>

          {rows.length === 0
            ? empty && (
                <div className="px-[calc(var(--u)*24)] py-[calc(var(--u)*56)] text-center text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]">
                  {empty}
                </div>
              )
            : rows.map((row) => (
                <div
                  key={rowKey(row)}
                  /* The blur stays at a fixed 7: it is an optical effect, not
                     a measurement, and scaling it with the row would thin it
                     to nothing on a laptop for no reason the design asks for. */
                  className={`${CELLS} h-[calc(var(--u)*42)] border-b border-white/15 backdrop-blur-[7px] last:border-b-0`}
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
