import type { FC, ReactNode } from 'react';
import ScrollShelf from '@/components/player/ScrollShelf';
import MatchCard from '@/components/sports/MatchCard';
import type { Fixture } from '@/services/sportsbook.sample';

/** One row: a card across on a phone, two on a tablet, four at the design's width. */
const ONE_ROW =
  'rl-shelf rl-track flex [--cols:1] [--gap:11px] md:[--cols:2] lg:[--cols:4] lg:[--gap:calc(var(--u)*17)]';

/**
 * Two rows of four on desktop, filled down then across, so the arrows page a
 * whole block of eight; a single row below that.
 */
const TWO_ROWS =
  'rl-shelf grid auto-cols-[100%] grid-flow-col grid-rows-1 gap-x-[11px] snap-x snap-mandatory [&>*]:snap-start md:auto-cols-[calc((100%-11px)/2)] lg:auto-cols-[calc((100%-var(--u)*51)/4)] lg:grid-rows-2 lg:gap-x-[calc(var(--u)*17)] lg:gap-y-[calc(var(--u)*14)]';

interface Props {
  title: string;
  fixtures: Fixture[];
  rows?: 1 | 2;
  viewAll?: string;
  /** A row between the heading and the cards — Top Sports' chips. */
  toolbar?: ReactNode;
  /** Classes for the heading's end cluster ("View All" and arrows). */
  endClassName?: string;
}

/** A titled, scrollable shelf of match cards — every section of the sportsbook. */
const MatchShelf: FC<Props> = ({ title, fixtures, rows = 1, viewAll, toolbar, endClassName }) => (
  <ScrollShelf
    title={title}
    href={viewAll}
    track={rows === 2 ? TWO_ROWS : ONE_ROW}
    toolbar={toolbar}
    endClassName={endClassName}
    tight
  >
    {fixtures.map((fixture, i) => (
      // The sample repeats one match, so its position completes the key.
      <MatchCard key={`${fixture.id}-${i}`} fixture={fixture} />
    ))}
  </ScrollShelf>
);

export default MatchShelf;
