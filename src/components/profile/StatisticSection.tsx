import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import RangeFilter from '@/components/profile/statistic/RangeFilter';
import StatCard from '@/components/profile/statistic/StatCard';
import RequestStatsRow from '@/components/profile/statistic/RequestStatsRow';
import RequestStatsModal from '@/components/profile/statistic/RequestStatsModal';
import {
  apiRangeOf,
  type StatRange,
  type StatTile,
} from '@/components/profile/statistic/statRanges';
import { getMyStatistics } from '@/services/statistics';
import type { ApiError, MyStatistics } from '@/types';

const EMPTY = '—';

const StatisticSection: FC = () => {
  const { t, locale } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const [range, setRange] = useState<StatRange>('lifetime');
  const [stats, setStats] = useState<MyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tRef = useRef(t);
  tRef.current = t;
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    getMyStatistics(apiRangeOf(range))
      .then((res) => {
        if (id !== request.current) return;
        if (res?.success && res.data) {
          setStats(res.data);
        } else {
          setError(res?.message || tRef.current('stats.loadFailed'));
        }
      })
      .catch((err) => {
        if (id !== request.current) return;
        setError((err as ApiError)?.message || tRef.current('stats.loadFailed'));
      })
      .finally(() => {
        if (id === request.current) setLoading(false);
      });
  }, [range]);

  const count = (value: number | undefined): string =>
    value === undefined ? EMPTY : value.toLocaleString(locale);
  const money = (value: string | undefined): string =>
    value === undefined ? EMPTY : formatCurrencyDisplay(value);
  const day = (iso: string): string =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });

  const headlineTiles: StatTile[] = [
    { key: 'totalBets', labelKey: 'stats.totalBets', value: count(stats?.bet_count) },
    { key: 'totalWins', labelKey: 'stats.totalWins', value: count(stats?.win_count) },
  ];
  const amountTiles: StatTile[] = [
    { key: 'bestBetWin', labelKey: 'stats.bestBetWin', value: money(stats?.best_round_win) },
    { key: 'bestGameWin', labelKey: 'stats.bestGameWin', value: money(stats?.best_game_win) },
    { key: 'totalWagered', labelKey: 'stats.totalWagered', value: money(stats?.wagered) },
  ];
  const rangeLabel = stats?.starts_at ? `${day(stats.starts_at)} - ${day(stats.ends_at)}` : '';
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
      <div className="relative flex flex-col items-start gap-[calc(var(--u)*12)] lg:flex-row lg:items-center lg:gap-[calc(var(--u)*18)]">
        <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.statistic')}</h2>
        <RangeFilter active={range} onSelect={setRange} rangeLabel={rangeLabel} />
      </div>

      {error && (
        <p role="alert" className="mt-[calc(var(--u)*16)] text-sm leading-6 text-[#ff6b6b]">
          {error}
        </p>
      )}

      {/* Two wide tiles, then three narrower ones — as the design splits them.
          The gaps differ because the tile widths do: 2×593 and 3×392 each
          leave a different remainder across the same 1208. */}
      <div
        aria-busy={loading}
        className={`transition-opacity ${loading && stats ? 'opacity-60' : ''}`}
      >
        <div className="mt-[18px] grid grid-cols-2 gap-x-3 gap-y-2.5 lg:mt-[calc(var(--u)*29)] lg:gap-[calc(var(--u)*22)]">
          {headlineTiles.map((tile) => (
            <StatCard key={tile.key} tile={tile} size="lg" />
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3 lg:mt-[calc(var(--u)*20)] lg:gap-[calc(var(--u)*16)]">
          {amountTiles.map((tile) => (
            <StatCard key={tile.key} tile={tile} size="md" />
          ))}
        </div>
      </div>

      <div className="mt-5 lg:mt-[calc(var(--u)*45)]">
        <RequestStatsRow onOpen={() => setRequestOpen(true)} />
      </div>

      {requestOpen && (
        <RequestStatsModal range={apiRangeOf(range)} onClose={() => setRequestOpen(false)} />
      )}
    </div>
  );
};

export default StatisticSection;
