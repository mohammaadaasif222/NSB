import type { FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import PrizeDropCard from '@/components/player/PrizeDropCard';
import { useTranslation } from '@/context/I18nContext';
import { usePrizeDrops } from '@/hooks/usePrizeDrops';
import Seo from '@/components/seo/Seo';

/**
 * Drops & Wins: every prize drop campaign running now, with all its games.
 * The providers pick the winners and pay the prizes into the player's cash
 * balance; this page only says where and when to play for them.
 */
const DropsWinsPage: FC = () => {
  const { t } = useTranslation();
  const { drops, loaded } = usePrizeDrops();

  return (
    <PlayerLayout>
      <Seo title={t('lobby.rail.dropsWins')} description={t('lobby.drops.pageIntro')} />

      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
        <section>
          <h1 className="rl-h-section">{t('lobby.rail.dropsWins')}</h1>
          <p className="mt-3 max-w-[720px] text-sm text-[#9da2b4] lg:mt-[calc(var(--u)*12)] lg:text-[length:max(13px,calc(var(--u)*16))]">
            {t('lobby.drops.pageIntro')}
          </p>

          <div className="mt-6 grid gap-4 lg:mt-[calc(var(--u)*28)] lg:gap-[calc(var(--u)*20)]">
            {!loaded ? (
              <div aria-hidden="true" className="rl-glass h-64 animate-pulse rounded-[20px]" />
            ) : drops.length === 0 ? (
              <p className="rl-glass rounded-[20px] px-4 py-6 text-sm text-[#9da2b4]">
                {t('lobby.drops.empty')}
              </p>
            ) : (
              drops.map((drop) => <PrizeDropCard key={drop.id} drop={drop} />)
            )}
          </div>
        </section>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default DropsWinsPage;
