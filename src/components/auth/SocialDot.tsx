import type { FC, ReactNode } from 'react';

interface SocialDotProps {
  label: string;
  /** Tailwind text-colour class carrying the brand colour, e.g. `text-[#2aabee]`. */
  colour: string;
  onClick: () => void;
  /** The first disc in a stack has no overlap. */
  first?: boolean;
  /** Disc diameter in px; `40` is 48 on a phone, as its design draws it. */
  size?: 37 | 40;
  children: ReactNode;
}

/**
 * One disc in an overlapping stack of provider shortcuts. The stack is drawn
 * with a negative margin on every disc but the first, so each ring sits over
 * the previous one's edge. Each disc is the header's glass button
 * (`rl-glass-btn`) on a solid base, so the disc behind does not show through.
 */
const SocialDot: FC<SocialDotProps> = ({ label, colour, onClick, first, size = 37, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`rl-glass-btn relative flex items-center justify-center rounded-full transition-[transform,filter] [--rl-btn-base:#121317] hover:z-10 hover:scale-110 ${colour} ${
      size === 40 ? 'h-12 w-12 sm:h-10 sm:w-10' : 'h-[37px] w-[37px]'
    } ${first ? '' : size === 40 ? '-ms-[13px] sm:-ms-[9px]' : '-ms-[9px]'}`}
  >
    {children}
  </button>
);

export default SocialDot;
