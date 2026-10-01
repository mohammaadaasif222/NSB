import type { FC } from 'react';

/**
 * Illustrative "big winners" chips in the top bar.
 *
 * There is no leaderboard API yet, so this is static sample data rather than a
 * live feed — purely decorative chrome until a real endpoint exists. Names and
 * amounts are placeholders, not real accounts, which is also why the avatars
 * are generated initials rather than photographs of anybody.
 */
const SAMPLE_WINNERS = [
  { name: 'Alice Twister', amount: '$15,750', tint: 'from-[#7c5cff] to-[#4a3bd6]' },
  { name: 'Mark Jenga', amount: '$12,401', tint: 'from-[#f06a4d] to-[#c2371d]' },
  { name: 'Rey Solstice', amount: '$8,930', tint: 'from-[#2fb5a0] to-[#1a7a6c]' },
];

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Chip: FC<{ name: string; amount: string; tint: string }> = ({ name, amount, tint }) => (
  <span className="inline-flex h-[30px] flex-shrink-0 items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.05] py-0 pl-1 pr-3">
    <span
      className={`flex h-[22px] w-[22px] items-center justify-center rounded-full bg-gradient-to-br text-[8px] font-bold text-white ${tint}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
    <span className="whitespace-nowrap text-[12.5px] text-white/70">{name}</span>
    <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-white">
      {amount}
    </span>
  </span>
);

/**
 * The strip overflows on narrow bars by design, so it is a horizontal scroller
 * rather than something that wraps or truncates. The mask fades the last chip
 * out at the trailing edge instead of slicing it mid-glyph, and is used in
 * place of a gradient overlay so it stays correct over any backdrop.
 */
const TopWinnersTicker: FC = () => (
  <div
    className="scrollbar-none flex items-center gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0,#000_28px,#000_calc(100%-28px),transparent_100%)]"
    aria-hidden="true"
  >
    {SAMPLE_WINNERS.map((w) => (
      <Chip key={w.name} {...w} />
    ))}
  </div>
);

export default TopWinnersTicker;
