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
 * The top bar's strip. It overflows on narrow bars by design, so it is a
 * horizontal scroller rather than something that wraps or truncates; the mask
 * fades the last chip out at the trailing edge instead of slicing it mid-glyph.
 */
const TopWinnersTicker: FC = () => (
  <div
    className="scrollbar-none flex items-center gap-[calc(var(--u)*11)] overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0,#000_16px,#000_calc(100%-16px),transparent_100%)]"
    aria-hidden="true"
  >
    {SAMPLE_WINNERS.map((w) => (
      <Chip key={w.name} {...w} size="bar" />
    ))}
  </div>
);

/**
 * A full-width row of winners: the phone's small chips running edge to edge
 * under the bar, and — with `desktop` — the signed-in lobby's 42px row across
 * the content column.
 */
export const WinnersStrip: FC<{ desktop?: boolean }> = ({ desktop = false }) => (
  <div className={desktop ? '' : 'lg:hidden'} aria-hidden="true">
    <div className="rl-shelf -mx-4 flex gap-[3px] px-4 lg:hidden">
      {ROW.map((w) => (
        <Chip key={w.id} {...w} size="strip" />
      ))}
    </div>
    {desktop && (
      <div className="rl-shelf hidden gap-[calc(var(--u)*10)] lg:flex">
        {ROW.map((w) => (
          <Chip key={w.id} {...w} size="bar" />
        ))}
      </div>
    )}
  </div>
);

export default TopWinnersTicker;
