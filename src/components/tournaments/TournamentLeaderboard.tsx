import type { FC } from 'react';
import Image, { type StaticImageData } from 'next/image';

import { useTranslation } from '@/context/I18nContext';

export interface PodiumPlace {
  rank: 1 | 2 | 3;
  /** Already masked where the player asked to stay anonymous. */
  name: string;
  /** Already formatted — "$87,742.90". */
  wagered: string;
  /** Already formatted — "2,350". */
  points: string;
  avatar: StaticImageData;
  /** A withheld name — shown as the translated "Hidden" in place of `name`. */
  masked?: boolean;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  /** Already formatted — "$87,742.9". */
  wager: string;
  /** Already formatted — "$1,200", or "—" where none was won. */
  prize: string;
  /** A withheld name, which the design greys out and labels "Hidden" in the reader's language. */
  masked?: boolean;
}

/* The design raises first place out of the row and gives it the larger
   portrait and badge; second and third are identical to each other. A phone
   keeps the three in one row — 96 portraits, 28 badges, first raised 25. */
const PLACES = {
  1: {
    card: 'order-2 lg:mb-[calc(var(--u)*41)]',
    avatar: 'h-24 w-24 lg:h-[calc(var(--u)*96)] lg:w-[calc(var(--u)*96)]',
    badge:
      '-top-[17px] h-7 w-7 bg-[#f9d028] text-[16px] text-[#030407] drop-shadow-[0_4px_5px_rgba(248,166,49,0.4)] lg:-top-[calc(var(--u)*25)] lg:h-[calc(var(--u)*38)] lg:w-[calc(var(--u)*38)] lg:text-[max(12px,calc(var(--u)*16))]',
    pts: 'lg:mt-[calc(var(--u)*8)]',
  },
  2: {
    card: 'order-1 mt-[25px] lg:mt-0',
    avatar: 'h-24 w-24 lg:h-[calc(var(--u)*84)] lg:w-[calc(var(--u)*84)]',
    badge:
      '-top-[17px] h-7 w-7 bg-[#f0f1f5] text-[16px] text-[#030407] drop-shadow-[0_4px_5px_rgba(0,0,0,0.25)] lg:-top-[calc(var(--u)*13)] lg:h-[calc(var(--u)*26)] lg:w-[calc(var(--u)*26)] lg:text-[max(11px,calc(var(--u)*14))] lg:text-[#07080a] lg:drop-shadow-none',
    pts: 'lg:mt-[calc(var(--u)*4)]',
  },
  3: {
    card: 'order-3 mt-[25px] lg:mt-0',
    avatar: 'h-24 w-24 lg:h-[calc(var(--u)*84)] lg:w-[calc(var(--u)*84)]',
    badge:
      '-top-[17px] h-7 w-7 bg-[#f0f1f5] text-[16px] text-[#030407] drop-shadow-[0_4px_5px_rgba(0,0,0,0.25)] lg:-top-[calc(var(--u)*13)] lg:h-[calc(var(--u)*26)] lg:w-[calc(var(--u)*26)] lg:text-[max(11px,calc(var(--u)*14))] lg:text-[#07080a] lg:drop-shadow-none',
    pts: 'lg:mt-[calc(var(--u)*4)]',
  },
} as const;

const Podium: FC<{ place: PodiumPlace }> = ({ place }) => {
  const { t } = useTranslation();
  const s = PLACES[place.rank];

  return (
    <div
      className={`flex w-24 flex-col items-center pt-[17px] lg:rl-glass-deep lg:h-[calc(var(--u)*289)] lg:w-[calc(var(--u)*272)] lg:rounded-[calc(var(--u)*34)] lg:px-0 lg:pb-0 lg:pt-[calc(var(--u)*61)] ${s.card}`}
    >
      <div className="relative">
        <Image
          src={place.avatar}
          alt=""
          className={`rounded-full object-cover ${s.avatar}`}
          sizes="(min-width: 1024px) 6vw, 96px"
        />
        <span
          className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full font-['Roboto',sans-serif] font-black ${s.badge}`}
        >
          {place.rank}
        </span>
      </div>

      <p className="mt-1 max-w-full truncate text-[12px] font-medium leading-5 text-[#f0f1f5] lg:mt-[calc(var(--u)*8)] lg:text-[max(14px,calc(var(--u)*20))] lg:font-normal lg:leading-[calc(var(--u)*28)] lg:tracking-[-0.02em]">
        {place.masked ? t('content.tournament.hidden') : place.name}
      </p>
      <p className="mt-px text-[12px] leading-5 text-[#6a7287] lg:mt-[calc(var(--u)*4)] lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
        {place.wagered}
      </p>
      <p
        className={`-mt-0.5 text-[18px] font-medium leading-7 text-[#f0f1f5] lg:text-[max(16px,calc(var(--u)*24))] lg:font-semibold lg:leading-[calc(var(--u)*32)] lg:tracking-[-0.02em] ${s.pts}`}
      >
        {t('tournament.pts', { value: place.points })}
      </p>
    </div>
  );
};

/* The design sets the two groups apart rather than spreading four even
   columns, so the header and the rows share these.

   Note the rank slot differs on purpose: the header reserves 60 for the word
   RANK, a row only the 32 of its badge, which leaves the NAME heading sitting
   28 to the right of the names under it. That is what the frame draws. */
const LEFT_GROUP = 'flex shrink-0 gap-6 lg:gap-[calc(var(--u)*48)]';
const RIGHT_GROUP = 'flex shrink-0 gap-10 text-right lg:gap-[calc(var(--u)*80)]';
const RANK_COL = 'w-[60px] lg:w-[calc(var(--u)*60)]';
const NAME_COL = 'w-[180px] lg:w-[calc(var(--u)*180)]';
const WAGER_COL = 'w-[120px] lg:w-[calc(var(--u)*160)]';
const PRIZE_COL = 'w-[90px] lg:w-[calc(var(--u)*120)]';

interface Props {
  podium: readonly PodiumPlace[];
  rows: readonly LeaderboardRow[];
}

/**
 * The ended tournament's leaderboard: the top three on a podium over the full
 * standings table.
 *
 * Ranks four and below drop the row tint, the badge disc and the lilac prize —
 * the design reserves all three for the places that were actually paid.
 */
const TournamentLeaderboard: FC<Props> = ({ podium, rows }) => {
  const { t } = useTranslation();

  return (
    <section className="rl-glass-deep rounded-[34px] px-4 pb-[31px] pt-[26px] lg:rounded-[calc(var(--u)*34)] lg:px-0 lg:pb-[calc(var(--u)*110)] lg:pt-[calc(var(--u)*46)]">
      <h2 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:text-[max(18px,calc(var(--u)*36))] lg:leading-[calc(var(--u)*44)]">
        {t('tournament.leaderboard')}
      </h2>

      {/* Ranked order in the markup, podium order on screen — a screen reader
          and a narrow viewport both want first place first. */}
      <div className="mt-3 flex items-start justify-between px-3 lg:mt-[calc(var(--u)*46)] lg:items-end lg:justify-center lg:gap-[calc(var(--u)*22)] lg:px-0">
        {podium.map((place) => (
          <Podium key={place.rank} place={place} />
        ))}
      </div>

      {/* A phone lists the standings as cards: the rank in a disc, the
          player over their wager, the prize at the end. The paid three keep
          the tint. */}
      <ol className="mt-5 flex flex-col gap-2 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.rank}
            className={`flex h-16 items-center gap-2.5 rounded-xl border border-[#252937] px-3 ${
              row.rank <= 3 ? 'bg-white/5' : ''
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#333] text-[15.5px] leading-[22px] text-[#c4c4c4]">
              {row.rank}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-[13px] font-bold leading-4 ${
                  row.masked ? 'text-[#696969]' : 'text-white'
                }`}
              >
                {row.masked ? t('content.tournament.hidden') : row.name}
              </span>
              <span className="mt-0.5 block truncate text-[11px] leading-[13px] text-[#b3b3b3]">
                {t('tournament.wager')} {row.wager}
              </span>
            </span>
            <span className="shrink-0 text-end">
              <span className="block text-[13px] font-bold leading-4 text-white tabular-nums">
                {row.prize}
              </span>
              <span className="mt-0.5 block text-[11px] leading-[13px] text-[#b3b3b3]">
                {t('tournament.prize')}
              </span>
            </span>
          </li>
        ))}
      </ol>

      {/* 1100 wide in the design and four columns deep — a desktop table. */}
      <div className="mt-8 hidden overflow-x-auto lg:mt-[calc(var(--u)*37)] lg:block">
        <div className="mx-auto min-w-[640px] overflow-hidden rounded-[24px] lg:w-[calc(var(--u)*1100)] lg:min-w-0 lg:rounded-[calc(var(--u)*24)]">
          <div className="flex items-start justify-between border-b border-white/5 bg-white/10 px-5 py-4 text-[13px] font-medium uppercase leading-5 text-[#9da2b4] lg:px-[calc(var(--u)*32)] lg:py-[calc(var(--u)*20)] lg:text-[max(11px,calc(var(--u)*14))]">
            <div className={LEFT_GROUP}>
              <span className={RANK_COL}>{t('tournament.rank')}</span>
              <span className={NAME_COL}>{t('tournament.name')}</span>
            </div>
            <div className={RIGHT_GROUP}>
              <span className={WAGER_COL}>{t('tournament.wager')}</span>
              <span className={PRIZE_COL}>{t('tournament.prize')}</span>
            </div>
          </div>

          {rows.map((row) => {
            const paid = row.rank <= 3;
            return (
              <div
                key={row.rank}
                className={`flex items-center justify-between border-b border-[#252937] px-5 py-1 text-[13px] leading-5 last:border-b-0 lg:px-[calc(var(--u)*32)] lg:py-[calc(var(--u)*8)] lg:text-[max(11px,calc(var(--u)*14))] ${
                  paid ? 'bg-white/5' : ''
                }`}
              >
                <div className={`${LEFT_GROUP} items-center`}>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#f0f1f5] lg:h-[calc(var(--u)*32)] lg:w-[calc(var(--u)*32)] ${
                      paid ? 'bg-[#333849]' : ''
                    }`}
                  >
                    {row.rank}
                  </span>
                  <span
                    className={`${NAME_COL} ${
                      row.masked ? 'text-[#696969] opacity-60' : 'text-[#f0f1f5]'
                    }`}
                  >
                    {row.masked ? t('content.tournament.hidden') : row.name}
                  </span>
                </div>
                <div className={`${RIGHT_GROUP} items-center`}>
                  <span className={`${WAGER_COL} text-[#f0f1f5]`}>{row.wager}</span>
                  <span className={`${PRIZE_COL} ${paid ? 'text-[#ede0ff]' : 'text-[#f0f1f5]'}`}>
                    {row.prize}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TournamentLeaderboard;
