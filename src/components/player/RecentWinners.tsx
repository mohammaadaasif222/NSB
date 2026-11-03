import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import type { Game } from '@/types';
import { gameHref } from '@/constants/games';
import { SHELF_TRACK } from '@/components/player/ShelfHeading';
import amara from '@/assets/lobby/winner-avatar.webp';
import john from '@/assets/lobby/avatar-john.webp';
import tony from '@/assets/lobby/avatar-tony.webp';
import alice from '@/assets/lobby/rail/winner-alice.webp';
import mark from '@/assets/lobby/rail/winner-mark.webp';
import zeus from '@/assets/profile/avatars/zeus.webp';
import lion from '@/assets/profile/avatars/lion.webp';
import monkey from '@/assets/profile/avatars/monkey.webp';
import dragon from '@/assets/profile/avatars/dragon.webp';
import jester from '@/assets/profile/avatars/jester.webp';
import pharaoh from '@/assets/profile/avatars/pharaoh.webp';
import cowboy from '@/assets/profile/avatars/cowboy.webp';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

/**
 * Illustrative "Recent Winners" row, running as a live feed the way Rainbet's
 * Live Wins does: twice a second a new win lands on the left — sliding in a
 * little way and fading up — while the rest step along by one card at once,
 * the oldest falling off the far end.
 *
 * There is no bets feed yet, so the wins are generated from sample players, paired with real games from the lobby's own shelves so each
 * card opens a game that exists. The tabs switch state but filter nothing
 * until a feed lands.
 */
interface Win {
  id: string;
  user: string;
  avatar: StaticImageData;
  multiplier: string;
  payout: string;
}

const PLAYERS: { user: string; avatar: StaticImageData }[] = [
  { user: 'LuckyAmara', avatar: amara },
  { user: 'ZeusMode', avatar: zeus },
  { user: 'jdawg_spins', avatar: john },
  { user: 'LionHeart88', avatar: lion },
  { user: 'AliceTwister', avatar: alice },
  { user: 'DragonHoard', avatar: dragon },
  { user: 'tony.bets', avatar: tony },
  { user: 'CheekyMonkey', avatar: monkey },
  { user: 'MarkJenga', avatar: mark },
  { user: 'PharaohGold', avatar: pharaoh },
  { user: 'WildWestRoll', avatar: cowboy },
  { user: 'JokersWild', avatar: jester },
];

const COINS = [
  { code: 'SOL', min: 0.2, span: 4, digits: 4 },
  { code: 'USDT', min: 5, span: 400, digits: 2 },
  { code: 'BTC', min: 0.0002, span: 0.004, digits: 6 },
  { code: 'ETH', min: 0.004, span: 0.12, digits: 5 },
] as const;

const MULTIPLIERS = [1.35, 2.1, 1.8, 5.5, 3.2, 12.4, 1.55, 2.75, 48.2, 4.1, 1.95, 8.6, 2.4];

const SAMPLE_SIZE = 7;

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
const REEL_STEPS = 7;

const ReelText: FC<{ text: string; spin: boolean }> = ({ text, spin }) => {
  if (!spin) return <>{text}</>;
  let column = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (!/\d/.test(char)) return <span key={i}>{char}</span>;
        const digit = Number(char);
        const delay = column++ * 45;
        return (
          <span key={i} className="rl-reel">
            <span className="rl-reel-strip" style={{ animationDelay: `${delay}ms` }}>
              {Array.from({ length: REEL_STEPS }, (_, k) => (
                <span key={k}>{(digit + (REEL_STEPS - k) * 3) % 10}</span>
              ))}
              <span>{char}</span>
            </span>
          </span>
        );
      })}
    </>
  );
};

const JACKPOT_AT = 10;

const WinnerCard: FC<{ game: Game; win: Win; fresh?: boolean; slot?: boolean }> = ({
  game,
  win,
  fresh,
  slot,
}) => {
  const { t } = useTranslation();
  const jackpot = slot && parseFloat(win.multiplier) >= JACKPOT_AT;

  return (
    <div className={`@container ${fresh ? (slot ? 'rl-reel-in' : 'rl-winner-in') : ''}`}>
      <Link
        href={gameHref(game.slug)}
        title={t('lobby.winners.cardTitle', {
          user: win.user,
          payout: win.payout,
          game: game.title,
        })}
        className={`group relative block aspect-[198/261] overflow-hidden rounded-[11.1cqw] bg-[#333333] ${
          jackpot ? 'rl-jackpot' : ''
        }`}
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
              src={win.avatar}
              alt=""
              className="h-[18.2cqw] w-[18.2cqw] flex-shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-[max(10px,7.07cqw)] font-medium leading-[1.43] text-[#f0f1f5]">
              {win.user}
            </span>
          </span>
          <span className="flex items-center justify-between gap-[calc(var(--u)*4)] text-[max(10px,7.07cqw)] leading-[1.43] tabular-nums">
            <span className={`font-medium ${jackpot ? 'text-[#f9d028]' : 'text-[#f4fffb]'}`}>
              <ReelText text={win.multiplier} spin={!!(fresh && slot)} />
            </span>
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
 * The n-th generated win. Strides coprime with each list keep neighbouring
 * cards on different players, coins and games. Deterministic, so a render and
 * its re-render agree.
 */
const winAt = (n: number, games: number): FeedItem => {
  const player = PLAYERS[(n * 5) % PLAYERS.length];
  const coin = COINS[(n * 3) % COINS.length];
  const multiplier = MULTIPLIERS[(n * 4) % MULTIPLIERS.length];
  const stake = coin.min + (((n * 7919) % 1000) / 1000) * coin.span;
  return {
    key: `feed-${n}`,
    win: {
      id: `feed-${n}`,
      ...player,
      multiplier: `${multiplier.toFixed(2)}x`,
      payout: `${(stake * multiplier).toLocaleString('en-US', { minimumFractionDigits: coin.digits, maximumFractionDigits: coin.digits })} ${coin.code}`,
    },
    game: (n * 7) % Math.max(1, games),
  };
};

/** The row as the server renders it: the first wins of the same sequence. */
const initialFeed = (games: number): FeedItem[] =>
  Array.from({ length: SAMPLE_SIZE }, (_, i) => ({ ...winAt(i, games), key: `w${i}` }));

/**
 * The feed: a new win at the front every FEED_INTERVAL, held while the
 * pointer is over the row (so a card can be clicked) and while the tab is
 * hidden. Starts after hydration, so the first paint matches the server's.
 */
const useWinnerFeed = (games: number, paused: boolean): FeedItem[] => {
  const [items, setItems] = useState<FeedItem[]>(() => initialFeed(games));
  const next = useRef(SAMPLE_SIZE);

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
  title?: string;
}

const RecentWinners: FC<Props> = ({ games: given, tabs = 'landing', title }) => {
  const { t } = useTranslation();
  const labels = WINNER_TABS[tabs];
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState(false);
  const games = useMemo(() => {
    const withArt = given.filter((game) => game.image_url);
    return withArt.length > 0 ? withArt : given;
  }, [given]);
  const items = useWinnerFeed(games.length, hovered);

  if (games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-[calc(var(--u)*17)] lg:space-y-[calc(var(--u)*20)]">
      <div className="flex flex-wrap items-center justify-between gap-y-[calc(var(--u)*11)] lg:flex-nowrap">
        <div className="flex w-full items-center justify-between gap-[calc(var(--u)*20)] lg:w-auto lg:justify-start">
          <h2 className="text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-white">
            {title ?? t('lobby.winners.title')}
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
              slot={labels[tab] === 'lobby.winners.activeWins'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentWinners;
