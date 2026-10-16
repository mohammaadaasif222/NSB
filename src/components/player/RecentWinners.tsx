import { useEffect, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';
import { gameHref } from '@/constants/games';
import { SHELF_TRACK } from '@/components/player/ShelfHeading';
import avatar from '@/assets/lobby/winner-avatar.webp';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

/**
 * Illustrative "Recent Winners" row, running as a live feed the way Rainbet's
 * Live Wins does: twice a second a new win lands on the left — sliding in a
 * little way and fading up — while the rest step along by one card at once,
 * the oldest falling off the far end.
 *
 * There is no bets feed yet, so the wins are generated from the design's
 * sample rows, paired with real games from the lobby's own shelves so each
 * card opens a game that exists. The tabs switch state but filter nothing
 * until a feed lands.
 */
interface Win {
  id: string;
  user: string;
  multiplier: string;
  payout: string;
}

const SAMPLE: Win[] = [
  { id: 'w1', user: 'Crimson Raiders', multiplier: '2.01x', payout: '0.47390026 SOL' },
  { id: 'w2', user: 'Crimson Raiders', multiplier: '2.01x', payout: '0.47390026 SOL' },
  { id: 'w3', user: 'Azure Sentinels', multiplier: '2.02x', payout: '0.52130045 SOL' },
  { id: 'w4', user: 'Golden Valkyries', multiplier: '1.98x', payout: '0.46210000 SOL' },
  { id: 'w5', user: 'Shadow Legion', multiplier: '2.10x', payout: '0.49890012 SOL' },
  { id: 'w6', user: 'Emerald Enforcers', multiplier: '1.95x', payout: '0.45075000 SOL' },
  { id: 'w7', user: 'Obsidian Wolves', multiplier: '2.05x', payout: '0.48500000 SOL' },
];

/** Each design's tab set: the landing page's, and the signed-in lobby's. */
export const WINNER_TABS: Record<'landing' | 'player', readonly TranslationKey[]> = {
  landing: ['lobby.winners.activeWins', 'lobby.winners.allBets', 'lobby.winners.casinoWins'],
  player: ['lobby.winners.allBets', 'lobby.winners.casinoBets', 'lobby.winners.sportsBets'],
};

/** The pulsing green "Live Bets" badge. */
const LiveBadge: FC = () => {
  const { t } = useTranslation();

  return (
    <span className="inline-flex h-[calc(var(--u)*36)] flex-shrink-0 items-center gap-[calc(var(--u)*3)] rounded-[calc(var(--u)*34)] bg-[#038f2d]/10 px-[calc(var(--u)*12)] text-[length:max(min(11px,12px),calc(var(--u)*12))] font-medium leading-[calc(var(--u)*20)] text-[#03b739]">
      <span
        className="relative flex h-[calc(var(--u)*15)] w-[calc(var(--u)*15)] items-center justify-center"
        aria-hidden="true"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#03b739]/50" />
        <span className="absolute inset-0 rounded-full bg-[#03b739]/50" />
        <span className="h-[calc(var(--u)*7.5)] w-[calc(var(--u)*7.5)] rounded-full bg-[#03b739]" />
      </span>
      {t('lobby.winners.liveBets')}
    </span>
  );
};

/*
 * The card is laid out in `cqw` of the design's 198px card, like the game
 * tiles, so the phone's 122px card is the same card scaled — with floors on
 * the text so it stays readable there.
 */
const WinnerCard: FC<{ game: Game; win: Win; fresh?: boolean }> = ({ game, win, fresh }) => {
  const { t } = useTranslation();

  return (
    // `fresh`: the card that has just arrived, which slides and fades in.
    <div className={`@container ${fresh ? 'rl-winner-in' : ''}`}>
      <Link
        href={gameHref(game.slug)}
        title={t('lobby.winners.cardTitle', {
          user: win.user,
          payout: win.payout,
          game: game.title,
        })}
        className="group relative block aspect-[198/261] overflow-hidden rounded-[11.1cqw] bg-[#333333]"
      >
        <Image
          src={game.image_url || '/images/placeholder.png'}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />

        {/* The design's "Liquid Glass" band: the artwork blurred through a
            faint white frost, a hairline of light along its top — not a dark
            pane, so each card's band takes its own game's colours. */}
        <span className="absolute inset-x-0 bottom-0 flex h-[31.8%] flex-col justify-between rounded-b-[11.1cqw] bg-black/[0.40] px-[6.57cqw] pb-[6.57cqw] pt-[5.56cqw] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[3cqw]">
          <span className="flex min-w-0 items-center gap-[4.04cqw]">
            <Image
              src={avatar}
              alt=""
              className="h-[18.2cqw] w-[18.2cqw] flex-shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-[max(10px,7.07cqw)] font-medium leading-[1.43] text-[#f0f1f5]">
              {win.user}
            </span>
          </span>
          <span className="flex items-center justify-between gap-[calc(var(--u)*4)] text-[max(10px,7.07cqw)] leading-[1.43] tabular-nums">
            <span className="font-medium text-[#f4fffb]">{win.multiplier}</span>
            <span className="truncate font-medium text-[#f0f1f5]">{win.payout}</span>
          </span>
        </span>
      </Link>
    </div>
  );
};

/** A new win every this many milliseconds — Rainbet's pace, measured off its feed. */
const FEED_INTERVAL = 500;
/** Cards kept: the widest row shows seven; the rest are off the end. */
const KEPT = 9;

interface FeedItem {
  key: string;
  win: Win;
  /** Index into the games the row was given. */
  game: number;
}

/**
 * The n-th generated win: a sample player on a rotating game, with a
 * multiplier and payout that vary from one to the next. Deterministic, so a
 * render and its re-render agree.
 */
const winAt = (n: number, games: number): FeedItem => {
  // A stride coprime with the list, so consecutive wins go to different players.
  const base = SAMPLE[(n * 3) % SAMPLE.length];
  const multiplier = 1.5 + ((n * 37) % 250) / 100;
  const payout = 0.2 + ((n * 7919) % 90000) / 100000;
  return {
    key: `feed-${n}`,
    win: {
      ...base,
      id: `feed-${n}`,
      multiplier: `${multiplier.toFixed(2)}x`,
      payout: `${payout.toFixed(8)} SOL`,
    },
    game: (n * 3) % Math.max(1, games),
  };
};

/** The row as the server renders it: the design's seven, in order. */
const initialFeed = (games: number): FeedItem[] =>
  SAMPLE.map((win, i) => ({ key: win.id, win, game: i % Math.max(1, games) }));

/**
 * The feed: a new win at the front every FEED_INTERVAL, held while the
 * pointer is over the row (so a card can be clicked) and while the tab is
 * hidden. Starts after hydration, so the first paint matches the server's.
 */
const useWinnerFeed = (games: number, paused: boolean): FeedItem[] => {
  const [items, setItems] = useState<FeedItem[]>(() => initialFeed(games));
  const next = useRef(SAMPLE.length);

  useEffect(() => {
    if (paused || games === 0) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const item = winAt(next.current++, games);
      setItems((current) => [item, ...current].slice(0, KEPT));
    }, FEED_INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, games]);

  return items;
};

interface Props {
  /** Games to pair the sample winners with — any of the lobby's shelves. */
  games: Game[];
  /** Which design's tabs to show. */
  tabs?: keyof typeof WINNER_TABS;
}

const RecentWinners: FC<Props> = ({ games, tabs = 'landing' }) => {
  const { t } = useTranslation();
  const labels = WINNER_TABS[tabs];
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState(false);
  const items = useWinnerFeed(games.length, hovered);

  if (games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-[calc(var(--u)*17)] lg:space-y-[calc(var(--u)*20)]">
      <div className="flex flex-wrap items-center justify-between gap-y-[calc(var(--u)*11)] lg:flex-nowrap">
        <div className="flex w-full items-center justify-between gap-[calc(var(--u)*20)] lg:w-auto lg:justify-start">
          <h2 className="text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-white">
            {t('lobby.winners.title')}
          </h2>
          <LiveBadge />
        </div>

        <div className="flex w-full justify-center gap-[calc(var(--u)*6)] lg:w-auto" role="tablist">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`h-[calc(var(--u)*36)] rounded-[calc(var(--u)*24)] px-[calc(var(--u)*16)] text-[length:max(min(11px,12px),calc(var(--u)*12))] font-medium leading-[calc(var(--u)*20)] transition-colors ${
                tab === i
                  ? 'bg-[#f0f1f5] text-[#07080a]'
                  : 'border border-[#333849] text-[#f0f1f5] hover:border-[#4a5068]'
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {/* A ticker rather than a scroller: the row moves by itself, so it
          clips instead of scrolling. The feed holds while the pointer is on
          it, so a card stays put long enough to be clicked. */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-live="off"
      >
        <div className={`${SHELF_TRACK} !overflow-visible`}>
          {items.map((item, i) => (
            <WinnerCard
              key={item.key}
              game={games[item.game % games.length]}
              win={item.win}
              fresh={i === 0 && item.key.startsWith('feed-')}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentWinners;
