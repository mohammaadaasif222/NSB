import type { FC } from 'react';
import type { StaticImageData } from 'next/image';
import alice from '@/assets/lobby/rail/winner-alice.webp';
import mark from '@/assets/lobby/rail/winner-mark.webp';
import rey from '@/assets/lobby/rail/winner-rey.webp';

/**
 * Illustrative "big winners" chips — in the top bar, the phone hero's strip
 * and the signed-in lobby's row.
 *
 * There is no leaderboard API yet, so this is static sample data rather than a
 * live feed — purely decorative chrome until a real endpoint exists. Names,
 * amounts and avatars are the design's placeholders, not real accounts.
 */
export const SAMPLE_WINNERS: { name: string; amount: string; avatar: StaticImageData }[] = [
  { name: 'Alice Twister', amount: '$15,750', avatar: alice },
  { name: 'Mark Jenga', amount: '$12,401', avatar: mark },
  { name: 'Rey Solstice', amount: '$8,930', avatar: rey },
];

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

/** One winner: avatar, name, amount, on the design's #13171f pill. */
const Chip: FC<(typeof SAMPLE_WINNERS)[number] & { size: ChipSize }> = ({
  name,
  amount,
  avatar,
  size,
}) => {
  const s = SIZES[size];
  return (
    <span className={`inline-flex flex-shrink-0 items-center rounded-full bg-[#13171f] ${s.chip}`}>
      <img
        src={avatar.src}
        alt=""
        className={`rounded-full bg-[#464e61] object-cover ${s.avatar}`}
      />
      <span className={`whitespace-nowrap text-[#9da2b4] ${s.name}`}>{name}</span>
      <span className={`whitespace-nowrap font-medium tabular-nums text-[#f0f1f5] ${s.amount}`}>
        {amount}
      </span>
    </span>
  );
};

/** Enough chips to run past the edge of the widest row the designs draw. */
const ROW = Array.from({ length: 8 }, (_, i) => ({ ...SAMPLE_WINNERS[i % 3], id: `w${i}` }));

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
}) => (
  <div
    className={`rl-marquee min-w-0 [mask-image:linear-gradient(to_right,transparent_0,#000_16px,#000_calc(100%-16px),transparent_100%)] ${className}`}
    style={{ ['--rl-marquee-duration' as string]: `${seconds}s` }}
    aria-hidden="true"
  >
    <div className="rl-marquee-track flex w-max">
      {[0, 1].map((copy) => (
        <div key={copy} className={`flex ${gap}`} style={{ paddingInlineEnd: 'var(--rl-gap)' }}>
          {ROW.map((w) => (
            <Chip key={w.id} {...w} size={size} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

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
export const WinnersStrip: FC = () => (
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

export default TopWinnersTicker;
