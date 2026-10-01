import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import ScrollShelf from '@/components/player/ScrollShelf';
import {
  BaseballIcon,
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  GlobeIcon,
  HockeyIcon,
  HorseIcon,
  TennisIcon,
  type IconProps,
} from '@/components/icons';

/**
 * The sportsbook teasers.
 *
 * Nothing here is live: there is no fixtures feed and no odds provider, so the
 * disciplines below are a fixed list and the matches are sample rows. The
 * lobby shows both sections as a teaser; /sports shows them on their own.
 * English-only copy on purpose — it is replaced wholesale when the real
 * sportsbook lands.
 */

const DISCIPLINES: { label: string; Icon: FC<IconProps> }[] = [
  { label: 'Football', Icon: FootballIcon },
  { label: 'Basketball', Icon: BasketballIcon },
  { label: 'Tennis', Icon: TennisIcon },
  { label: 'Cricket', Icon: CricketIcon },
  { label: 'Horse Racing', Icon: HorseIcon },
  { label: 'Baseball', Icon: BaseballIcon },
  { label: 'Hockey', Icon: HockeyIcon },
];

/**
 * A flag as three bands in a disc.
 *
 * Drawn rather than set as a regional-indicator emoji: Windows has no colour
 * glyphs for those and renders the two letters instead, which would leave a
 * different design on the most common desktop platform.
 */
const FlagDisc: FC<{ bands: [string, string, string]; label: string }> = ({ bands, label }) => (
  <span
    role="img"
    aria-label={label}
    title={label}
    className="block h-4 w-4 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-white/20"
  >
    <span className="block h-1/3 w-full" style={{ background: bands[0] }} />
    <span className="block h-1/3 w-full" style={{ background: bands[1] }} />
    <span className="block h-1/3 w-full" style={{ background: bands[2] }} />
  </span>
);

const GERMANY: [string, string, string] = ['#111111', '#dd0000', '#ffce00'];

interface Match {
  id: string;
  country: string;
  league: string;
  home: string;
  away: string;
  time: string;
  date: string;
  odds: [string, string, string];
  more: string;
}

const MATCHES: Match[] = [
  {
    id: 'm1',
    country: 'Germany',
    league: 'Bundesliga',
    home: 'Bayern Munich',
    away: 'Union Berlin',
    time: '12:00 AM',
    date: '29/10/2026',
    odds: ['1.04', '14.00', '30.00'],
    more: '+55',
  },
  {
    id: 'm2',
    country: 'Germany',
    league: 'Bundesliga',
    home: 'Bayer Leverkusen',
    away: 'VfB Stuttgart',
    time: '02:30 AM',
    date: '29/10/2026',
    odds: ['1.72', '4.10', '4.55'],
    more: '+48',
  },
  {
    id: 'm3',
    country: 'Germany',
    league: 'Bundesliga',
    home: 'Borussia Dortmund',
    away: 'RB Leipzig',
    time: '06:00 PM',
    date: '29/10/2026',
    odds: ['2.05', '3.60', '3.30'],
    more: '+61',
  },
  {
    id: 'm4',
    country: 'Germany',
    league: 'Bundesliga',
    home: 'Eintracht Frankfurt',
    away: 'SC Freiburg',
    time: '08:30 PM',
    date: '29/10/2026',
    odds: ['1.95', '3.75', '3.55'],
    more: '+42',
  },
];

/** One outcome chip — label on the left, price on the right. */
const Odd: FC<{ label: string; price: string }> = ({ label, price }) => (
  <span className="rl-glass rl-glass-hover flex h-8 min-w-0 flex-1 items-center justify-between gap-1 rounded-lg px-2">
    <span className="truncate text-[10px] text-white/40">{label}</span>
    <span className="text-[11px] font-semibold tabular-nums text-white/85">{price}</span>
  </span>
);

const MatchCard: FC<{ match: Match }> = ({ match }) => (
  <Link
    href="/sports"
    className="rl-glass rl-glass-hover flex w-[248px] flex-shrink-0 flex-col gap-2.5 rounded-xl p-3"
  >
    <span className="flex items-center gap-1.5 text-[10px] text-white/40">
      <GlobeIcon size={11} />
      <span className="truncate">
        {match.country} • {match.league}
      </span>
    </span>

    <span className="grid grid-cols-3 items-start gap-1 text-center">
      <span className="flex min-w-0 flex-col items-center gap-1.5">
        <FlagDisc bands={GERMANY} label={match.country} />
        <span className="line-clamp-2 text-[10.5px] leading-tight text-white/80">{match.home}</span>
      </span>
      <span className="flex flex-col items-center gap-1">
        <span className="text-[12px] font-semibold text-white">{match.time}</span>
        <span className="text-[9.5px] tabular-nums text-white/35">{match.date}</span>
      </span>
      <span className="flex min-w-0 flex-col items-center gap-1.5">
        <FlagDisc bands={GERMANY} label={match.country} />
        <span className="line-clamp-2 text-[10.5px] leading-tight text-white/80">{match.away}</span>
      </span>
    </span>

    <span className="text-[9.5px] uppercase tracking-wide text-white/30">1x2</span>

    <span className="flex items-center gap-1.5">
      <Odd label="1" price={match.odds[0]} />
      <Odd label="draw" price={match.odds[1]} />
      <Odd label="2" price={match.odds[2]} />
      <span className="rl-glass flex h-8 flex-shrink-0 items-center rounded-lg px-2 text-[11px] font-semibold text-white/50">
        {match.more}
      </span>
    </span>
  </Link>
);

interface Props {
  /**
   * Rendered on /sports itself. Drops the "View all" links, which would only
   * point back at the page they are on.
   */
  standalone?: boolean;
}

const SportsRow: FC<Props> = ({ standalone = false }) => {
  const { t } = useTranslation();
  const viewAll = standalone ? undefined : '/sports';

  return (
    <>
      <ScrollShelf id="sports" title={t('nav.sports')} href={viewAll}>
        {DISCIPLINES.map(({ label, Icon }) => (
          <Link
            key={label}
            href="/sports"
            title={`${label} — ${t('common.soon')}`}
            className="rl-glass rl-glass-hover flex h-[92px] w-[118px] flex-shrink-0 flex-col items-center justify-center gap-2.5 rounded-xl text-white/70 hover:text-white sm:w-[130px]"
          >
            <Icon size={26} />
            <span className="text-[11.5px] font-medium">{label}</span>
          </Link>
        ))}
      </ScrollShelf>

      <ScrollShelf id="live-games" title="Live Games" href={viewAll}>
        {MATCHES.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </ScrollShelf>
    </>
  );
};

export default SportsRow;
