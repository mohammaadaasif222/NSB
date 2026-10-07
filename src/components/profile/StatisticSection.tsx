import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import RangeFilter from '@/components/profile/statistic/RangeFilter';
import StatCard from '@/components/profile/statistic/StatCard';
import RequestStatsRow from '@/components/profile/statistic/RequestStatsRow';
import RequestStatsModal from '@/components/profile/statistic/RequestStatsModal';
import {
  AMOUNT_TILES,
  HEADLINE_TILES,
  type StatRange,
} from '@/components/profile/statistic/mockStats';

/**
 * Play statistics.
 *
 * NOT WIRED — every figure is mock. The backend records balances but not a bet
 * history, so there is nothing to total up yet; each tile needs a wagering
 * endpoint behind it. The numbers live in `statistic/mockStats.ts`, which is
 * the one file to replace when that lands.
 */
const StatisticSection: FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<StatRange>('lifetime');
  // Section-local: the page's modal state is for the settings dialogs, and
  // this one is only reachable from here.
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <div>
      {/* Title, chips and the date pill share a line in the design rather than
          stacking — the chips sit against the title's shoulder and the pill is
          pushed to the far edge.

          That line wants 908px: 175 of title, 437 of chips, 223 of pill and 73
          of gaps. The design's panel is 1268 and has room to spare; a 14"
          laptop's is about 740, which leaves 680 inside the padding. Closing
          228px of that would mean a 26px title and 11px chips — not the design
          a size smaller, a different one — so below the width where it fits,
          the title takes its own line and the chips keep the pill company on
          the next. The grouping the design cares about survives; only the
          title moves. */}
      {/* `lg:`, not the `@panel` container query this used to carry.
          That rule existed because a fixed 44px title and a fixed-size range
          filter together needed 908 while a laptop's panel has ~860, so the
          pair had to stack. Both are sized in `--u` now: at 1251 the title is
          44 × 0.651 and the chips shrink by the same factor, so the pair needs
          ~592 of the same 860 and cannot collide at any desktop width. The
          query was holding a laptop at the phone's stacked layout for a
          collision that can no longer happen — which is what put the chips on
          their own row instead of beside the title, as the design draws them. */}
      <div className="flex flex-col items-start gap-[calc(var(--u)*12)] lg:flex-row lg:items-center lg:gap-[calc(var(--u)*18)]">
        <h2 className={SECTION_HEADING}>{t('profile.statistic')}</h2>
        <RangeFilter active={range} onSelect={setRange} />
      </div>

      {/* Two wide tiles, then three narrower ones — as the design splits them.
          The gaps differ because the tile widths do: 2×593 and 3×392 each
          leave a different remainder across the same 1208. */}
      <div className="mt-[calc(var(--u)*29)] grid gap-[calc(var(--u)*22)] sm:grid-cols-2">
        {HEADLINE_TILES.map((tile) => (
          <StatCard key={tile.key} tile={tile} />
        ))}
      </div>

      <div className="mt-[calc(var(--u)*20)] grid gap-[calc(var(--u)*16)] sm:grid-cols-3">
        {AMOUNT_TILES.map((tile) => (
          <StatCard key={tile.key} tile={tile} />
        ))}
      </div>

      <div className="mt-[calc(var(--u)*45)]">
        <RequestStatsRow onOpen={() => setRequestOpen(true)} />
      </div>

      {requestOpen && <RequestStatsModal onClose={() => setRequestOpen(false)} />}
    </div>
  );
};

export default StatisticSection;
