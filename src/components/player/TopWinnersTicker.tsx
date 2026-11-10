import { useEffect, useState, type FC } from 'react';
import type { StaticImageData } from 'next/image';
import alice from '@/assets/lobby/rail/winner-alice.webp';
import mark from '@/assets/lobby/rail/winner-mark.webp';
import rey from '@/assets/lobby/rail/winner-rey.webp';
import zeus from '@/assets/profile/avatars/zeus.webp';
import lion from '@/assets/profile/avatars/lion.webp';
import dragon from '@/assets/profile/avatars/dragon.webp';
import pharaoh from '@/assets/profile/avatars/pharaoh.webp';
import { fetchTopWins, type TopWin } from '@/services/topWins';
import { formatAmount, withCurrency } from '@/utils/money';

/**
 * The "top wins" chips — in the top bar, the phone hero's strip and the
 * signed-in lobby's row.
 *
 * Real settled wins of players on the platform (GET /top-wins), which
 * operators load and curate on the console's Top wins screen. Names come
 * masked; while there are no wins the strip is not drawn.
 */

/** Players who never uploaded a picture keep one picked from their name. */
const AVATARS: StaticImageData[] = [alice, mark, rey, zeus, lion, dragon, pharaoh];

const avatarFor = (win: TopWin): string => {
  if (win.avatar_url) return win.avatar_url;
  let hash = 0;
  for (const char of win.player + win.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length].src;
};

/**
 * The strips on a page (the top bar's and the lobby's) mount together and
 * share the one read in flight; the next page asks again (the backend caches).
 */
let inFlight: Promise<TopWin[] | null> | null = null;

const useTopWins = (): TopWin[] => {
  const [wins, setWins] = useState<TopWin[]>([]);
  useEffect(() => {
    let alive = true;
    const read = (inFlight ??= fetchTopWins().finally(() => {
      inFlight = null;
    }));
    void read.then((result) => {
      if (alive && result) setWins(result);
    });
    return () => {
      alive = false;
    };
  }, []);
  return wins;
};

/**
 * The two sizes the designs draw a chip at: `bar` — 42px, 16px type, the
 * desktop bar and row — and `strip`, the phone's 26px chips.
 */
const SIZES = {
  bar: {
    chip: 'h-[calc(var(--u)*42)] gap-[calc(var(--u)*10)] pl-[calc(var(--u)*6.25)] pr-[calc(var(--u)*15)]',
    avatar: 'h-[calc(var(--u)*27.5)] w-[calc(var(--u)*27.5)]',
    name: 'text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)]',
    amount: 'text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)]',
  },
  strip: {
    chip: 'h-[26px] gap-1 pl-0.5 pr-[15px]',
    avatar: 'h-[22px] w-[22px]',
    name: 'text-[10px] leading-5',
    amount: 'text-[12px] leading-5',
  },
} as const;

type ChipSize = keyof typeof SIZES;

/** One winner: avatar, masked name, amount, on the design's #13171f pill. */
const Chip: FC<{ win: TopWin; size: ChipSize }> = ({ win, size }) => {
  const s = SIZES[size];
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-full bg-[#13171f] ${s.chip}`}
      title={win.game.title}
    >
      <img
        src={avatarFor(win)}
        alt=""
        className={`rounded-full bg-[#464e61] object-cover ${s.avatar}`}
      />
      <span className={`whitespace-nowrap font-medium text-[#c9cdd9] ${s.name}`}>{win.player}</span>
      <span className={`whitespace-nowrap font-semibold tabular-nums text-white ${s.amount}`}>
        {withCurrency(formatAmount(win.payout_usd, 2, 'casino.bets'), 'USD')}
      </span>
    </span>
  );
};

/**
 * Enough chips to run past the edge of the widest row the designs draw: a
 * short list repeats until the row is this long.
 */
const MIN_CHIPS = 8;

const rowOf = (wins: TopWin[]): { key: string; win: TopWin }[] =>
  Array.from({ length: Math.max(wins.length, MIN_CHIPS) }, (_, i) => ({
    key: `${wins[i % wins.length].id}-${i}`,
    win: wins[i % wins.length],
  }));

/**
 * A row of chips that runs on its own, like a live feed.
 *
 * The chips are drawn twice, back to back, and the track slides by exactly
 * one copy before starting over (`rl-marquee` in index.css), so the loop has
 * no seam. Each copy ends in the same space that sits between chips, which is
 * what makes "one copy" exactly half the track. Pauses under the pointer;
 * stands still, as a plain scroller, for anyone who asks for reduced motion.
 */
const Marquee: FC<{ size: ChipSize; gap: string; seconds: number; className?: string }> = ({
  size,
  gap,
  seconds,
  className = '',
}) => {
  const wins = useTopWins();
  if (wins.length === 0) return null;
  const row = rowOf(wins);
  return (
    <div
      className={`rl-marquee min-w-0 [mask-image:linear-gradient(to_right,transparent_0,#000_16px,#000_calc(100%-16px),transparent_100%)] ${className}`}
      style={{ ['--rl-marquee-duration' as string]: `${seconds}s` }}
      aria-hidden="true"
    >
      <div className="rl-marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className={`flex ${gap}`} style={{ paddingInlineEnd: 'var(--rl-gap)' }}>
            {row.map(({ key, win }) => (
              <Chip key={key} win={win} size={size} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * The phone and tablet row: the design's small 26px chips, 8 apart, running
 * like the desktop strip does rather than three standing still — a fixed
 * three-up grid either cut the names short on a phone or left a tablet's
 * width half empty.
 */
export const WinnersRow: FC = () => (
  <Marquee size="strip" gap="gap-[var(--rl-gap)] [--rl-gap:8px]" seconds={30} />
);

/** The top bar's strip, shown signed out. */
const TopWinnersTicker: FC = () => (
  <Marquee size="bar" gap="gap-[var(--rl-gap)] [--rl-gap:calc(var(--u)*11)]" seconds={40} />
);

/**
 * The signed-in pages' full-width row of winners: the phone's small chips
 * running edge to edge under the bar, the desktop's 42px chips across the
 * content column.
 */
export const WinnersStrip: FC = () => {
  // No wins: no row, rather than an empty slot in the page's spacing.
  if (useTopWins().length === 0) return null;
  return (
    <div>
      {/* Phones and tablets get the same running row the signed-out hero does. */}
      <div className="lg:hidden">
        <WinnersRow />
      </div>
      <Marquee
        size="bar"
        gap="gap-[var(--rl-gap)] [--rl-gap:calc(var(--u)*10)]"
        seconds={40}
        className="hidden lg:block"
      />
    </div>
  );
};

export default TopWinnersTicker;
