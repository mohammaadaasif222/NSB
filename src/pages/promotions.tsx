import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import type { GetServerSideProps } from 'next';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import PromotionCard from '@/components/promotions/PromotionCard';
import PromotionFilters, {
  type PromoCategory,
  type PromoStatus,
} from '@/components/promotions/PromotionFilters';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import Seo from '@/components/seo/Seo';
import {
  fetchPromotions,
  PROMOTIONS_PAGE_SIZE,
  type PromotionItem,
} from '@/services/promotions';
import { fetchPromotionsPageServer } from '@/services/promotions.server';
import { markUnavailable } from '@/utils/unavailable.server';

interface Props {
  initial: { items: PromotionItem[]; page: number; totalPages: number } | null;
}

const PromotionsPage: FC<Props> = ({ initial }) => {
  const { t } = useTranslation();
  const { promotions: promotionsOn, promotion_filters: filters } = usePlatformFeatures();
  const [chosenCategory, setCategory] = useState<PromoCategory>('all');
  const [chosenStatus, setStatus] = useState<PromoStatus>('live');
  
  const statuses = useMemo<PromoStatus[]>(
    () => [...(filters.live ? (['live'] as const) : []), ...(filters.expired ? (['expired'] as const) : [])],
    [filters.live, filters.expired]
  );
  const categories = useMemo<Exclude<PromoCategory, 'all'>[]>(
    () => [...(filters.casino ? (['casino'] as const) : []), ...(filters.sports ? (['sports'] as const) : [])],
    [filters.casino, filters.sports]
  );
  const status: PromoStatus = statuses.includes(chosenStatus) ? chosenStatus : (statuses[0] ?? 'live');
  const category: PromoCategory =
    chosenCategory === 'all' || categories.includes(chosenCategory) ? chosenCategory : 'all';
  // Both tabs, or both categories, switched off leaves nothing to show.
  const available = promotionsOn && statuses.length > 0 && categories.length > 0;

  const [items, setItems] = useState<PromotionItem[]>(initial?.items ?? []);
  const [page, setPage] = useState(initial?.page ?? 0);
  const [totalPages, setTotalPages] = useState(initial?.totalPages ?? 0);
  const [loading, setLoading] = useState(!initial);
  const serverRendered = useRef(!!initial);
  const [failed, setFailed] = useState(false);

  // Bumped on every new query so a slow answer to an old filter cannot land
  // on top of the list the player is now looking at.
  const generation = useRef(0);

  const load = useCallback(
    async (nextPage: number, replace: boolean): Promise<void> => {
      const mine = ++generation.current;
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetchPromotions({
          status,
          category: category === 'all' ? undefined : category,
          page: nextPage,
          limit: PROMOTIONS_PAGE_SIZE,
        });
        if (mine !== generation.current) return;
        setItems((list) => {
          if (replace) return res.data;
          const seen = new Set(list.map((p) => p.id));
          return [...list, ...res.data.filter((p) => !seen.has(p.id))];
        });
        setPage(res.pagination?.page ?? nextPage);
        setTotalPages(res.pagination?.totalPages ?? 0);
      } catch {
        if (mine !== generation.current) return;
        if (replace) setItems([]);
        setFailed(true);
      } finally {
        if (mine === generation.current) setLoading(false);
      }
    },
    [status, category]
  );

  useEffect(() => {
    if (serverRendered.current) {
      serverRendered.current = false;
      if (available && status === 'live' && category === 'all') {
        return;
      }
    }
    setPage(0);
    setTotalPages(0);
    if (!available) {
      setItems([]);
      setLoading(false);
      return;
    }
    void load(1, true);
  }, [load, available, status, category]);

  const hasMore = page > 0 && page < totalPages;

  return (
    <PlayerLayout>
      <Seo title={t('promo.title')} description={t('misc.meta.promotions')} />
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <section>
          <h1 className="rl-h-section">{t('promo.title')}</h1>

          <div className="mt-5 lg:mt-[calc(var(--u)*20)]">
            <PromotionFilters
              category={category}
              onCategory={setCategory}
              status={status}
              onStatus={setStatus}
              categories={categories}
              statuses={statuses}
            />
          </div>

          {!available && (
            <p className="rl-glass-deep mt-6 rounded-[24px] px-6 py-16 text-center text-sm text-white/50 lg:mt-[calc(var(--u)*28)] lg:rounded-[calc(var(--u)*34)]">
              {t('promo.disabled')}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-[calc(var(--u)*28)] lg:grid-cols-4 lg:gap-x-[calc(var(--u)*23)] lg:gap-y-[calc(var(--u)*21)]">
            {items.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>

         {available && !loading && items.length === 0 && (
            <p
              role={failed ? 'alert' : undefined}
              className="rl-glass-deep mt-6 rounded-[24px] px-6 py-16 text-center text-sm text-white/50 lg:mt-[calc(var(--u)*28)] lg:rounded-[calc(var(--u)*34)]"
            >
              {t(failed ? 'promo.loadFailed' : 'promo.none')}
              {failed && (
                <button
                  type="button"
                  onClick={() => void load(1, true)}
                  className="mx-auto mt-4 block rounded-full bg-white/5 px-5 py-2 text-[14px] text-[#f0f1f5] transition-colors hover:bg-white/10"
                >
                  {t('promo.retry')}
                </button>
              )}
            </p>
          )}

          {available && hasMore && (
            <div className="mt-6 flex justify-center lg:mt-[calc(var(--u)*28)]">
              <button
                type="button"
                onClick={() => void load(page + 1, false)}
                disabled={loading}
                className="flex font-semibold h-10 w-10 flex-shrink-0 items-center justify-center gap-[calc(var(--u)*5)] rounded-full bg-[#f9d028] text-[#07080a] transition-[filter] hover:brightness-110 lg:h-[calc(var(--u)*48)] lg:w-auto lg:px-[calc(var(--u)*18)]"
              >
                {t('promo.loadMorePromotions')}
              </button>
            </div>
          )}
        </section>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  try {
    const result = await fetchPromotionsPageServer({
      status: 'live',
      page: 1,
      limit: PROMOTIONS_PAGE_SIZE,
    });
    return {
      props: {
        initial: {
          items: result.data,
          page: result.pagination?.page ?? 1,
          totalPages: result.pagination?.totalPages ?? 0,
        },
      },
    };
  } catch (error) {
    console.error('[promotions] list fetch failed:', error instanceof Error ? error.message : error);
    markUnavailable({ req, res });
    return { props: { initial: null } };
  }
};

export default PromotionsPage;
