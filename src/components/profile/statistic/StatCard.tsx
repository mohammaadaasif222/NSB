import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { StatTile } from '@/components/profile/statistic/mockStats';

/**
 * One figure and what it counts, centred in a glass tile.
 *
 * The tile is the same surface as the panel it floats on — the design stacks
 * the two rather than giving the tile an edge of its own, so a tile reads as
 * the panel lifted rather than a card dropped onto it.
 */
const StatCard: FC<{ tile: StatTile }> = ({ tile }) => {
  const { t } = useTranslation();

  return (
    <div className="rl-panel flex flex-col items-center justify-center gap-[calc(var(--u)*7)] px-[calc(var(--u)*16)] py-[calc(var(--u)*40)] text-center">
      <p className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-[#9da2b4]">
        {t(tile.labelKey)}
      </p>
      {/* 36/44 in the design, and the largest thing on the tab — it escaped the
          sweep to `--u` because an arbitrary `text-[36px]` is not part of the
          type scale the pass rewrote, so it stayed at a fixed 36 while the card
          around it came down to 0.64 of its size on a laptop. */}
      <p className="text-[length:max(min(11px,36px),calc(var(--u)*36))] leading-[1.22] font-bold tracking-[-0.72px] tabular-nums text-[#f4fffb]">
        {tile.value}
      </p>
    </div>
  );
};

export default StatCard;
