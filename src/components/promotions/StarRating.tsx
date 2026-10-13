import type { CSSProperties, FC } from 'react';

import { StarIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  /** How many of the five are lit. Rounded down — 4.5 lights four. */
  value: number;
  /** Star edge on a phone, in px. */
  size: number;
  /** Star edge in design pixels, scaled through `--u` from lg up. */
  lgSize: number;
  className?: string;
}

/**
 * Five stars, the lit ones in the design's Primary 1.
 *
 * The app's own star is an outline and the design's is solid, so it is filled
 * here rather than carried in as a second asset. Sized through CSS rather than
 * the icon's `size` prop so it can scale with `--u` — a width class beats the
 * width attribute the icon writes.
 */
const StarRating: FC<Props> = ({ value, size, lgSize, className = '' }) => {
  const { t } = useTranslation();
  const vars = {
    '--star': `${size}px`,
    '--star-lg': `calc(var(--u) * ${lgSize})`,
  } as CSSProperties;

  return (
    <span
      className={`flex items-center gap-[calc(var(--star)*0.14)] lg:gap-[calc(var(--star-lg)*0.14)] ${className}`}
      role="img"
      aria-label={t('content.promo.starsOutOf5', { value })}
      style={vars}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon
          key={i}
          className={`h-[var(--star)] w-[var(--star)] flex-shrink-0 fill-current lg:h-[var(--star-lg)] lg:w-[var(--star-lg)] ${
            i < Math.floor(value) ? 'text-[#f9d028]' : 'text-white/15'
          }`}
        />
      ))}
    </span>
  );
};

export default StarRating;
