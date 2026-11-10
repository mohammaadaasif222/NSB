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
  /** The modals' clear glass instead of the solid stacked disc, for a disc on its own. */
  glass?: boolean;
  children: ReactNode;
}

/**
 * One disc in an overlapping stack of provider shortcuts. The stack is drawn
 * with a negative margin on every disc but the first, so each ring sits over
 * the previous one's edge. Each disc is the header's glass button
 * (`rl-glass-btn`) on a solid base, so the disc behind does not show through.
 */
const SocialDot: FC<SocialDotProps> = ({
  label,
  colour,
  onClick,
  first,
  size = 37,
  glass = false,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`${glass ? 'rl-glass-disc' : 'rl-glass-btn [--rl-btn-base:#121317]'} relative flex items-center justify-center rounded-full transition-[transform,filter] hover:z-10 hover:scale-110 ${colour} ${
      size === 40 ? 'h-12 w-12 sm:h-10 sm:w-10' : 'h-[37px] w-[37px]'
    } ${first ? '' : size === 40 ? '-ms-[13px] sm:-ms-[9px]' : '-ms-[9px]'}`}
  >
    {children}
  </button>
);

export default SocialDot;
