import { useMemo, useState, type FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import PromotionCard from '@/components/promotions/PromotionCard';
import PromotionFilters, {
  type PromoCategory,
  type PromoStatus,
} from '@/components/promotions/PromotionFilters';
import { useTranslation } from '@/context/I18nContext';
import { PROMOTIONS } from '@/constants/promotions';

/**
 * Promotions.
 *
 * The design's frame: the title, the category chips, the Live / Expired tabs,
 * then the cards four across in the 1548 column, and the shared footer.
 */
const PromotionsPage: FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<PromoCategory>('all');
  const [status, setStatus] = useState<PromoStatus>('live');

  const shown = useMemo(
    () =>
      PROMOTIONS.filter(
        (p) => p.status === status && (category === 'all' || p.category === category)
      ),
    [category, status]
  );

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('promo.title')} · ROLLUCK`}</title>
      </Head>

      {/* The design's 1548px content column, the same one the lobby and the
          footer use; `--u` (set by PlayerLayout) scales it on a narrower
          desktop so the four-across grid stays four across. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        {/* Explicit margins rather than `space-y`: the design's three gaps down
            this column are 20, 32 and 28, and one `space-y` cannot be all
            three. The 32 belongs to PromotionFilters, between its own two rows. */}
        <section>
          <h1 className="rl-h-section">{t('promo.title')}</h1>

          <div className="mt-5 lg:mt-[calc(var(--u)*20)]">
            <PromotionFilters
              category={category}
              onCategory={setCategory}
              status={status}
              onStatus={setStatus}
            />
          </div>

          {/* 370 wide, 23 across and 21 down — the design's four up, two down. */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-[calc(var(--u)*28)] lg:grid-cols-4 lg:gap-x-[calc(var(--u)*23)] lg:gap-y-[calc(var(--u)*21)]">
            {shown.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>

          {/* Not in the frame, which only draws a full grid — but Expired has
              nothing behind it yet, and a tab that empties the page without
              saying why reads as a fault. */}
          {shown.length === 0 && (
            <p className="rl-glass-deep mt-6 rounded-[24px] px-6 py-16 text-center text-sm text-white/50 lg:mt-[calc(var(--u)*28)] lg:rounded-[calc(var(--u)*34)]">
              {t('promo.none')}
            </p>
          )}
        </section>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default PromotionsPage;
