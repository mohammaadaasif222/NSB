import type { FC } from 'react';

import PrizeDropCard from '@/components/player/PrizeDropCard';
import { ShelfHeading } from '@/components/player/ShelfHeading';
import { DROPS_WINS_PATH } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { usePrizeDrops } from '@/hooks/usePrizeDrops';

/** Campaigns on the lobby row; the rest are on the Drops & Wins page. */
const SHELF_DROPS = 3;
const CARD_GAMES = 4;

/**
 * The lobby's Drops & Wins row: the biggest campaigns running now, each
 * with a few of its games, and "View all" to the Drops & Wins page. Says so
 * plainly when nothing runs.
 */
const PrizeDropShelf: FC<{ title?: string }> = ({ title }) => {
  const { t } = useTranslation();
  const { drops, loaded } = usePrizeDrops();
  const heading = title ?? t('lobby.rail.dropsWins');

  return (
    <section aria-label={heading} id="drops-wins">
      <ShelfHeading title={heading} href={DROPS_WINS_PATH} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-[calc(var(--u)*20)] lg:grid-cols-3 lg:gap-[calc(var(--u)*20)]">
        {!loaded ? (
          <div aria-hidden="true" className="rl-glass h-48 animate-pulse rounded-[20px]" />
        ) : drops.length === 0 ? (
          <p className="rl-glass rounded-[20px] px-4 py-6 text-sm text-[#9da2b4] sm:col-span-2 lg:col-span-3">
            {t('lobby.drops.empty')}
          </p>
        ) : (
          drops
            .slice(0, SHELF_DROPS)
            .map((drop) => <PrizeDropCard key={drop.id} drop={drop} maxGames={CARD_GAMES} />)
        )}
      </div>
    </section>
  );
};

export default PrizeDropShelf;
