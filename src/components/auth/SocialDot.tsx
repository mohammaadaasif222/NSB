import type { FC, ReactNode } from 'react';

interface SocialDotProps {
  label: string;
  /** Tailwind text-colour class carrying the brand colour, e.g. `text-[#2aabee]`. */
  colour: string;
  onClick: () => void;
  /** The first disc in a stack has no overlap. */
  first?: boolean;
  /** Disc diameter in px. */
  size?: 37 | 40;
  children: ReactNode;
}

/**
 * One disc in an overlapping stack of provider shortcuts. The stack is drawn
 * with a negative margin on every disc but the first, so each ring sits over
 * the previous one's edge.
 */
const SocialDot: FC<SocialDotProps> = ({ label, colour, onClick, first, size = 37, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative flex items-center justify-center rounded-full border border-white/10 bg-[#121317] transition-transform hover:z-10 hover:scale-110 ${colour} ${
      size === 40 ? 'h-10 w-10' : 'h-[37px] w-[37px]'
    } ${first ? '' : '-ms-[9px]'}`}
  >
    {children}
  </button>
);

export default SocialDot;
