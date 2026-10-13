import type { CSSProperties, FC } from 'react';

import { StarIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  value: number;
  size: number;
  lgSize: number;
  className?: string;
  glow?: boolean;
}

const StarRating: FC<Props> = ({ value, size, lgSize, className = '', glow = false }) => {
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
            i < Math.floor(value)
              ? `text-[#f9d028] ${glow ? 'drop-shadow-[0_0_6px_rgba(249,208,40,0.45)]' : ''}`
              : 'text-white/25'
          }`}
        />
      ))}
    </span>
  );
};

export default StarRating;
