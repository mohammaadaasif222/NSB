import { useEffect, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
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
import { fetchLiveBets, type LiveBet } from '@/services/liveBets';
import { formatAmount, withCurrency } from '@/utils/money';

/**
 * The "Recent Winners" row, running as a live feed the way Rainbet's Live
 * Wins does: rounds that just paid out on the site (GET /live-bets), each
 * with the game it was played on and the masked player. New wins land on the
 * left one at a time — sliding in a little way and fading up — while the rest
 * step along by one card, the oldest falling off the far end.
 *
 * The tabs switch state but filter nothing yet.
 */

/** The feed carries no avatars, so each player keeps one picked from their name. */
const AVATARS: StaticImageData[] = [
  amara,
  zeus,
  john,
  lion,
  alice,
  dragon,
  tony,
  monkey,
  mark,
  pharaoh,
  cowboy,
  jester,
];

const avatarFor = (player: string): StaticImageData => {
  let hash = 0;
  for (const char of player) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
};

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

/** The card's frame, shared by a win and its loading placeholder. */
const CARD_FRAME = 'relative block aspect-[198/261] overflow-hidden rounded-[11.1cqw] bg-[#333333]';

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

const WinnerCard: FC<{ bet: LiveBet; fresh?: boolean; slot?: boolean }> = ({
  bet,
  fresh,
  slot,
}) => {
  const { t } = useTranslation();
  const { game } = bet;
  const payout = withCurrency(formatAmount(bet.payout_usd), 'USD');
  const jackpot = slot && parseFloat(bet.multiplier) >= JACKPOT_AT;

  return (
    <div className={`@container ${fresh ? (slot ? 'rl-reel-in' : 'rl-winner-in') : ''}`}>
      <Link
        href={gameHref(game.slug)}
        title={t('lobby.winners.cardTitle', { user: bet.player, payout, game: game.title })}
        className={`group ${CARD_FRAME} ${jackpot ? 'rl-jackpot' : ''}`}
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
        <span className="absolute inset-x-0 bottom-0 flex h-[39.5%] flex-col justify-between rounded-b-[11.1cqw] bg-black/[0.40] px-[6.57cqw] pb-[6.57cqw] pt-[5.56cqw] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[3cqw]">
          <span className="truncate text-[max(10px,7.07cqw)] font-semibold leading-[1.43] text-white">
            {game.title}
          </span>
          <span className="flex min-w-0 items-center gap-[4.04cqw]">
            <Image
              src={avatarFor(bet.player)}
              alt=""
              className="h-[18.2cqw] w-[18.2cqw] flex-shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-[max(10px,7.07cqw)] font-medium leading-[1.43] text-[#f0f1f5]">
              {bet.player}
            </span>
          </span>
          <span className="flex items-center justify-between gap-[calc(var(--u)*4)] text-[max(10px,7.07cqw)] leading-[1.43] tabular-nums">
            <span className={`font-medium ${jackpot ? 'text-[#f9d028]' : 'text-[#f4fffb]'}`}>
              <ReelText text={`${bet.multiplier}x`} spin={!!(fresh && slot)} />
            </span>
            <span className="truncate font-medium text-[#f0f1f5]">{payout}</span>
          </span>
        </span>
      </Link>
    </div>
  );
};

/** A new win every this many milliseconds while some are waiting — Rainbet's pace. */
const FEED_INTERVAL = 500;
/** How often the feed is asked for new wins; the backend caches it for 5 s. */
const POLL_MS = 10_000;
/** Cards kept: the widest row shows seven; the rest are off the end. */
const KEPT = 9;
/** Placeholders while the first answer is on its way: the widest row's seven. */
const PLACEHOLDERS = 7;

interface Feed {
  bets: LiveBet[];
  /** The win that has just landed, which slides in. */
  fresh: string | null;
  /** The first fetch has answered (successfully or not). */
  loaded: boolean;
}

/**
 * The feed: polled every POLL_MS while the tab is visible. The first answer
 * is shown as it is; wins that arrive after it wait in a queue and land one
 * every FEED_INTERVAL, held while the pointer is over the row (so a card can
 * be clicked) and while the tab is hidden. A failed poll keeps what is shown.
 */
const useLiveBets = (paused: boolean): Feed => {
  const [feed, setFeed] = useState<Feed>({ bets: [], fresh: null, loaded: false });
  /** Wins fetched but not yet shown, oldest first. */
  const queue = useRef<LiveBet[]>([]);
  /** The ids in the last answer: anything else in the next one is new. */
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async (): Promise<void> => {
      if (document.hidden && known.current) return;
      const bets = await fetchLiveBets();
      if (!alive) return;
      if (!bets) {
        setFeed((current) => (current.loaded ? current : { ...current, loaded: true }));
        return;
      }
      const seen = known.current;
      known.current = new Set(bets.map((bet) => bet.id));
      if (!seen) {
        setFeed({ bets: bets.slice(0, KEPT), fresh: null, loaded: true });
        return;
      }
      const arrived = bets.filter((bet) => !seen.has(bet.id)).reverse();
      queue.current = [...queue.current, ...arrived].slice(-KEPT);
    };

    void poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const bet = queue.current.shift();
      if (!bet) return;
      setFeed((current) => ({
        ...current,
        bets: [bet, ...current.bets.filter((shown) => shown.id !== bet.id)].slice(0, KEPT),
        fresh: bet.id,
      }));
    }, FEED_INTERVAL);
    return () => window.clearInterval(id);
  }, [paused]);

  return feed;
};

interface Props {
  /** Which design's tabs to show. */
  tabs?: keyof typeof WINNER_TABS;
  title?: string;
}

const RecentWinners: FC<Props> = ({ tabs = 'landing', title }) => {
  const { t } = useTranslation();
  const labels = WINNER_TABS[tabs];
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { bets, fresh, loaded } = useLiveBets(hovered);
  const slot = labels[tab] === 'lobby.winners.activeWins';

  // Nothing has paid out lately: no row rather than an empty one.
  if (loaded && bets.length === 0) {
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
          {loaded
            ? bets.map((bet, i) => (
                <WinnerCard
                  key={bet.id}
                  bet={bet}
                  fresh={i === 0 && bet.id === fresh}
                  slot={slot}
                />
              ))
            : Array.from({ length: PLACEHOLDERS }, (_, i) => (
                <div key={i} className="@container" aria-hidden="true">
                  <span className={`${CARD_FRAME} animate-pulse`} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default RecentWinners;
