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
    <div className="rl-panel flex flex-col items-center justify-center gap-1.75 px-4 py-10 text-center">
      <p className="text-base leading-6 text-[#9da2b4]">{t(tile.labelKey)}</p>
      <p className="text-[36px] leading-11 font-bold tracking-[-0.72px] tabular-nums text-[#f4fffb]">
        {tile.value}
      </p>
    </div>
  );
};

export default StatCard;
