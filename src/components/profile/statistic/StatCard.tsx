import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { StatTile } from '@/components/profile/statistic/statRanges';

/**
 * One figure and what it counts, centred in a glass tile.
 *
 * The tile is the same surface as the panel it floats on — the design stacks
 * the two rather than giving the tile an edge of its own, so a tile reads as
 * the panel lifted rather than a card dropped onto it.
 */
const StatCard: FC<{ tile: StatTile; size: 'lg' | 'md' }> = ({ tile, size }) => {
  const { t } = useTranslation();

  return (
    <div className="rl-panel flex flex-col gap-2 rounded-[24px] px-4 py-[19px] text-start lg:items-center lg:justify-center lg:gap-[calc(var(--u)*7)] lg:rounded-[34px] lg:px-[calc(var(--u)*16)] lg:py-[calc(var(--u)*40)] lg:text-center">
      <p className="text-[13px] leading-4 text-[#cccccc] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5] lg:text-[#9da2b4]">
        {t(tile.labelKey)}
      </p>
      {/* 36/44 in the design, and the largest thing on the tab — it escaped the
          sweep to `--u` because an arbitrary `text-[36px]` is not part of the
          type scale the pass rewrote, so it stayed at a fixed 36 while the card
          around it came down to 0.64 of its size on a laptop. */}
      <p
        className={`truncate font-bold tabular-nums text-[#f4fffb] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:leading-[1.22] lg:tracking-[-0.72px] ${size === 'lg' ? 'text-[28px] leading-[34px]' : 'text-[22px] leading-[27px]'}`}
      >
        {tile.value}
      </p>
    </div>
  );
};

export default StatCard;
