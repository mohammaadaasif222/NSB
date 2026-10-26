import type { CSSProperties, FC, ReactNode } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import ScrollShelf from '@/components/player/ScrollShelf';
import type { TranslationKey } from '@/i18n/locales';
import { sportHref, type SportKey } from '@/constants/sportsbook';

import leagueIcon from '@/assets/lobby/league-soccer.svg';
import crestBayern from '@/assets/lobby/crest-bayern.webp';
import crestUnion from '@/assets/lobby/crest-union-berlin.webp';
// Bundled rather than on the CDN: the renders are cut out, and the CDN's
// copies are JPEGs flattened onto black, which shows as a square behind each
// one on the glass tile.
import soccer from '@/assets/lobby/sports/soccer.webp';
import basketball from '@/assets/lobby/sports/basketball.webp';
import football from '@/assets/lobby/sports/football.webp';
import tennis from '@/assets/lobby/sports/tennis.webp';
import esport from '@/assets/lobby/sports/esport.webp';
import cs2 from '@/assets/lobby/sports/cs2.webp';
import fifa from '@/assets/lobby/sports/fifa.webp';
import cricket from '@/assets/lobby/sports/cricket.webp';
import tableTennis from '@/assets/lobby/sports/table-tennis.webp';
import valorant from '@/assets/lobby/sports/valorant.webp';
import chess from '@/assets/lobby/sports/chess.webp';
import dota2 from '@/assets/lobby/sports/dota2.webp';
import lol from '@/assets/lobby/sports/lol.webp';
import golf from '@/assets/lobby/sports/golf.webp';
import live from '@/assets/lobby/sports/live.webp';
import boxing from '@/assets/lobby/sports/boxing.webp';
import iceHockey from '@/assets/lobby/sports/ice-hockey.webp';
import volleyball from '@/assets/lobby/sports/volleyball.webp';
import wrestling from '@/assets/lobby/sports/wrestling.webp';
import sportsbook from '@/assets/lobby/sports/sportsbook.webp';
import mma from '@/assets/lobby/sports/mma.webp';

/**
 * The sportsbook teasers.
 *
 * Nothing here is live: there is no fixtures feed and no odds provider, so the
 * disciplines below are a fixed list and the matches are the design's sample
 * rows. The lobby shows both sections as a teaser; /sports shows them on their
 * own. It is replaced wholesale when the real sportsbook lands.
 */

/* ==================================================================== */
/* Disciplines                                                           */
/* ==================================================================== */

interface Discipline {
  label: TranslationKey;
  art: StaticImageData;
  /**
   * Where the design places the artwork inside its 198×192 tile: left, top
   * and width in design pixels. Kept per sport because the renders are not
   * cut to a common box — the rifle is wide, the trophy narrow.
   */
  box: [x: number, y: number, w: number];
  /** The sport's own page, where the sportsbook has one; else the lobby. */
  page?: SportKey;
}

/** In the design's order, which is also the order the shelf scrolls in. */
const DISCIPLINES: Discipline[] = [
  { label: 'lobby.sport.soccer', art: soccer, box: [48, 21, 99], page: 'football' },
  { label: 'lobby.sport.basketball', art: basketball, box: [48, 21, 99], page: 'basketball' },
  { label: 'lobby.sport.americanFootball', art: football, box: [48, 21, 99] },
  { label: 'lobby.sport.tennis', art: tennis, box: [46, 21, 102], page: 'tennis' },
  { label: 'lobby.sport.esports', art: esport, box: [42, 18, 110] },
  { label: 'lobby.sport.cs2', art: cs2, box: [26, 21, 143] },
  { label: 'lobby.sport.fifa', art: fifa, box: [48, 21, 99] },
  { label: 'lobby.sport.cricket', art: cricket, box: [48, 21, 99], page: 'cricket' },
  { label: 'lobby.sport.tableTennis', art: tableTennis, box: [48, 21, 99] },
  { label: 'lobby.sport.valorant', art: valorant, box: [48, 21, 99] },
  { label: 'lobby.sport.chess', art: chess, box: [48, 21, 99] },
  { label: 'lobby.sport.dota2', art: dota2, box: [38, 15, 118] },
  { label: 'lobby.sport.lol', art: lol, box: [48, 21, 99] },
  { label: 'lobby.sport.golf', art: golf, box: [43, 18, 109] },
  { label: 'lobby.sport.live', art: live, box: [41, 33, 113] },
  { label: 'lobby.sport.boxing', art: boxing, box: [48, 21, 99] },
  { label: 'lobby.sport.iceHockey', art: iceHockey, box: [47, 20, 101], page: 'hockey' },
  { label: 'lobby.sport.volleyball', art: volleyball, box: [48, 21, 99] },
  { label: 'lobby.sport.wrestling', art: wrestling, box: [45, 21, 108] },
  { label: 'lobby.sport.sportsbook', art: sportsbook, box: [48, 21, 99] },
  { label: 'lobby.sport.mma', art: mma, box: [35, 27, 129] },
];

/**
 * A discipline's glass tile — 198×192 on desktop, 122×150 on a phone — with
 * its label at the foot. What sits above the label is the caller's: a 3D
 * render or a line icon.
 */
const TileShell: FC<{ label: string; href: string; children: ReactNode }> = ({
  label,
  href,
  children,
}) => (
  <Link
    href={href}
    title={label}
    className="rl-sport-card group relative block h-[calc(var(--u)*150)] overflow-hidden rounded-[calc(var(--u)*34)] transition-colors hover:bg-white/[0.11] lg:h-[calc(var(--u)*192)]"
  >
    {children}
    <span className="absolute inset-x-1 bottom-[calc(var(--u)*22)] text-center text-[length:max(min(11px,16px),calc(var(--u)*16))] font-medium leading-[calc(var(--u)*24)] text-white lg:bottom-[calc(var(--u)*28)] lg:text-[length:max(min(11px,20px),calc(var(--u)*20))] lg:font-semibold lg:leading-[calc(var(--u)*28)]">
      {label}
    </span>
  </Link>
);

/** A tile with the discipline's 3D render, placed as the design places it. */
const DisciplineTile: FC<{ sport: Discipline; phoneLarge?: boolean }> = ({
  sport,
  phoneLarge = false,
}) => {
  const [x, y, w] = sport.box;
  // The signed-in phone design draws the renders bigger on its 122px tile —
  // a 99px render at 74, 16px from the top, centred — so each box is scaled
  // by 74/99 from the desktop's, keeping wide renders (CS2, MMA) wide.
  const phone = { width: w * (74 / 99), top: 16 + (y - 21) * (74 / 99) };
  const { t } = useTranslation();

  return (
    <TileShell label={t(sport.label)} href={sport.page ? sportHref(sport.page) : '/sports'}>
      <Image
        src={sport.art}
        alt=""
        sizes="(max-width: 1024px) 110px, 150px"
        className={`absolute h-auto transition-transform duration-300 group-hover:-translate-y-1 ${
          phoneLarge
            ? 'left-[var(--pl)] top-[var(--pt)] w-[var(--pw)] lg:left-[var(--dl)] lg:top-[var(--dt)] lg:w-[var(--dw)]'
            : 'left-[var(--dl)] top-[var(--dt)] w-[var(--dw)]'
        }`}
        style={
          {
            '--dl': `${(x / 198) * 100}%`,
            '--dt': `${(y / 192) * 100}%`,
            '--dw': `${(w / 198) * 100}%`,
            '--pl': `calc(50% - ${phone.width / 2}px)`,
            '--pt': `${phone.top}px`,
            '--pw': `${phone.width}px`,
          } as CSSProperties
        }
      />
    </TileShell>
  );
};

/* ==================================================================== */
/* Fixtures                                                              */
/* ==================================================================== */

interface Team {
  name: string;
  crest: StaticImageData;
}

interface Match {
  id: string;
  /** ISO region code, named in the reader's language. */
  country: string;
  league: string;
  home: Team;
  away: Team;
  kickoff: Date;
  odds: [string, string, string];
  more: string;
}

const BAYERN: Team = { name: 'Bayern Munich', crest: crestBayern };
const UNION: Team = { name: 'Union Berlin', crest: crestUnion };

/** The design's sample fixture, repeated as it is there. */
const MATCHES: Match[] = ['m1', 'm2', 'm3', 'm4'].map((id) => ({
  id,
  country: 'DE',
  league: 'Bundesliga',
  home: BAYERN,
  away: UNION,
  kickoff: new Date(2026, 8, 19, 0, 0),
  odds: ['1.04', '14.00', '30.00'],
  more: '+55',
}));

/** One outcome chip — the label on the left, the price on the right. */
const Odd: FC<{ label: string; price: string }> = ({ label, price }) => (
  <span className="flex h-[calc(var(--u)*40)] min-w-0 flex-1 items-center justify-between gap-[calc(var(--u)*4)] rounded-lg bg-[#292d2e] px-[calc(var(--u)*8)] transition-colors group-hover:bg-[#30353a]">
    <span className="truncate text-[length:max(min(11px,12px),calc(var(--u)*12))] lowercase leading-[calc(var(--u)*20)] text-[#6a7287]">
      {label}
    </span>
    <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#f0f1f5]">
      {price}
    </span>
  </span>
);

const TeamColumn: FC<{ team: Team }> = ({ team }) => (
  <span className="flex min-w-0 flex-col items-center gap-[calc(var(--u)*8)]">
    <Image src={team.crest} alt="" className="h-[calc(var(--u)*48)] w-[calc(var(--u)*48)]" />
    <span className="w-full truncate text-center text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-white">
      {team.name}
    </span>
  </span>
);

/** The design's 423×240 fixture card; a phone shows one at full width. */
const MatchCard: FC<{ match: Match }> = ({ match }) => {
  const { t, locale } = useTranslation();
  const country = new Intl.DisplayNames([locale], { type: 'region' }).of(match.country);

  return (
    <Link
      href="/sports"
      className="rl-sport-card group flex flex-col rounded-[calc(var(--u)*34)] px-px pb-[calc(var(--u)*18)] pt-[calc(var(--u)*18)] transition-colors hover:bg-white/[0.11] lg:px-[calc(var(--u)*19)]"
    >
      <span className="flex h-[calc(var(--u)*36)] items-start justify-center gap-[calc(var(--u)*8)] pb-[calc(var(--u)*12)]">
        <img src={leagueIcon.src} alt="" className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]" />
        <span className="flex translate-y-[calc(var(--u)*1.5)] items-center truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] font-semibold leading-[calc(var(--u)*21)] text-[#b3bec1]">
          {country}
          <span
            className="mx-1.5 h-[calc(var(--u)*4)] w-[calc(var(--u)*4)] flex-shrink-0 rounded-full bg-white"
            aria-hidden="true"
          />
          {match.league}
        </span>
      </span>

      <span className="mt-[calc(var(--u)*22)] grid grid-cols-[1fr_calc(var(--u)*107)_1fr] items-start gap-[calc(var(--u)*4)] px-[calc(var(--u)*16)]">
        <TeamColumn team={match.home} />
        <span className="flex flex-col items-center pt-[calc(var(--u)*12)]">
          <span className="whitespace-nowrap text-[length:max(min(11px,24px),calc(var(--u)*24))] font-bold leading-[calc(var(--u)*32)] text-white">
            {match.kickoff.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
          </span>
          <span className="pt-[calc(var(--u)*4)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#b3bec1]">
            {match.kickoff.toLocaleDateString(locale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        </span>
        <TeamColumn team={match.away} />
      </span>

      <span className="pb-[calc(var(--u)*6)] pt-[calc(var(--u)*4)] text-center text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#849194]">
        1x2
      </span>

      <span className="flex items-center gap-[calc(var(--u)*8)] px-[calc(var(--u)*12)]">
        <Odd label="1" price={match.odds[0]} />
        <Odd label={t('sports.draw')} price={match.odds[1]} />
        <Odd label="2" price={match.odds[2]} />
        <span className="flex h-[calc(var(--u)*40)] flex-shrink-0 items-center rounded-lg bg-[#292d2e] px-[calc(var(--u)*12)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#6a7287]">
          {match.more}
        </span>
      </span>
    </Link>
  );
};

/** One fixture across on a phone, three and a half at the design's width. */
const LIVE_TRACK =
  'rl-shelf rl-track flex [--cols:1] [--gap:calc(var(--u)*11)] md:[--cols:2] lg:[--cols:3.5] lg:[--gap:calc(var(--u)*27)]';

/* ==================================================================== */
/* The rows                                                              */
/* ==================================================================== */

interface ShelfProps {
  /** "View all" destination; omitted on /sports itself. */
  viewAll?: string;
}

/**
 * The disciplines shelf: a tile per sport with its 3D render. Both phone
 * designs run it as one row of three 122×150 tiles, like the game shelves
 * (`paged={false}`); `paged` lays a phone's out three by two instead.
 */
export const SportsShelf: FC<ShelfProps & { paged?: boolean }> = ({ viewAll, paged = true }) => {
  const { t } = useTranslation();

  return (
    <ScrollShelf id="sports" title={t('nav.sports')} href={viewAll} paged={paged}>
      {DISCIPLINES.map((sport) => (
        <DisciplineTile key={sport.label} sport={sport} phoneLarge={!paged} />
      ))}
    </ScrollShelf>
  );
};

/** The live fixtures shelf. */
export const LiveGamesShelf: FC<ShelfProps> = ({ viewAll }) => {
  const { t } = useTranslation();

  return (
    <ScrollShelf
      id="live-games"
      title={t('lobby.sports.liveGames')}
      href={viewAll}
      track={LIVE_TRACK}
    >
      {MATCHES.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </ScrollShelf>
  );
};

/** Both sportsbook teasers together, as the signed-out lobby shows them. */
const SportsRow: FC = () => (
  <>
    <SportsShelf viewAll="/sports" paged={false} />
    <LiveGamesShelf viewAll="/sports" />
  </>
);

export default SportsRow;
