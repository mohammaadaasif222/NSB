import { useCallback, useEffect, useState, type FC } from 'react';
import { toast } from 'react-toastify';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import GameTile from '@/components/player/GameTile';
import {
  ShelfHeading,
  SHELF_TRACK,
  ARROW_CLASS,
  ArrowGlyph,
} from '@/components/player/ShelfHeading';
import CountdownBar, { countdownParts } from '@/components/promotions/CountdownBar';
import PromoTextPanel from '@/components/promotions/PromoTextPanel';
import ReviewCard from '@/components/promotions/ReviewCard';
import StarRating from '@/components/promotions/StarRating';
import RatePromotionModal from '@/components/promotions/RatePromotionModal';
import { ChevronLeftIcon, StarIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { useCountdown } from '@/hooks/useCountdown';
import { fetchShelfList } from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import { fetchPromotionServer } from '@/services/promotions.server';
import { paragraphsOf, type PromotionItem } from '@/services/promotions';
import {
  fetchReviewsEnabledServer,
  fetchReviewsServer,
} from '@/services/promotionReviews.server';
import {
  fetchMyReview,
  fetchReviews,
  type PromotionReview,
  type RatingSummary,
  type ReviewsPage,
  type SubmittedReview,
} from '@/services/promotionReviews';
import type { Game } from '@/types';
import Seo from '@/components/seo/Seo';
import { clip } from '@/constants/site';

import promoArt from '@/assets/promotions/promo-horse-racing.webp';

const NO_REVIEWS: ReviewsPage = {
  summary: { average: 0, count: 0 },
  data: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
};

interface Props {
  promotion: PromotionItem | null;
  reviews: ReviewsPage;
  reviewsFailed: boolean;
  reviewsEnabled: boolean;
  games: Game[];
}

const PromotionDetail: FC<Props & { promotion: PromotionItem }> = ({
  promotion,
  reviews: firstPage,
  reviewsFailed,
  reviewsEnabled,
  games,
}) => {
  const { t, locale } = useTranslation();
  const { token } = useAuth();
  const { openLogin } = useAuthModal();
  const [rating, setRating] = useState(false);
  const [items, setItems] = useState<PromotionReview[]>(firstPage?.data ?? []);
  const [summary, setSummary] = useState<RatingSummary>(
    firstPage?.summary ?? NO_REVIEWS.summary
  );
  const [page, setPage] = useState(firstPage?.pagination?.page ?? 1);
  const [totalPages, setTotalPages] = useState(firstPage?.pagination?.totalPages ?? 1);
  const [loadingMore, setLoadingMore] = useState(false);
  // The signed-in player's own review, so the dialog opens on it and saving
  // updates it. Null signed out or until they have rated.
  const [mine, setMine] = useState<PromotionReview | null>(null);
  const promotionId = promotion.slug;
  const ended = promotion.status === 'expired';
  const title = promotion.title;

  // The countdown starts after mount: a figure computed on the server would
  // be a few seconds off by the time the page hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const remaining = useCountdown(mounted && !ended ? promotion.ends_at : null);
  const detailParagraphs = paragraphsOf(promotion.details);
  const termsParagraphs = paragraphsOf(promotion.terms);

  // Signed out, the rating handle asks for a login instead of opening a form
  // that could only be refused.
  const openRating = (): void => {
    if (!token) {
      openLogin();
      return;
    }
    setRating(true);
  };

  useEffect(() => {
    setMine(null);
    if (!token || !reviewsEnabled) return undefined;
    let active = true;
    fetchMyReview(promotionId)
      .then((review) => active && setMine(review))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [token, promotionId, reviewsEnabled]);

  const onRemoved = useCallback(
    (next: RatingSummary) => {
      // Only the player's own card goes; every other player's stays.
      setItems((list) => list.filter((r) => r.id !== mine?.id));
      setMine(null);
      setSummary(next);
    },
    [mine?.id]
  );

  const onSubmitted = useCallback(({ review, summary: next }: SubmittedReview) => {
    setMine(review);
    // Rating again replaces the player's earlier card rather than adding a second.
    setItems((list) =>
      list.some((r) => r.id === review.id)
        ? list.map((r) => (r.id === review.id ? review : r))
        : [review, ...list]
    );
    setSummary(next);
  }, []);

  const loadMore = async (): Promise<void> => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = await fetchReviews(promotionId, page + 1);
      // A review submitted since the first page loaded may already be on screen.
      setItems((list) => {
        const seen = new Set(list.map((r) => r.id));
        return [...list, ...next.data.filter((r) => !seen.has(r.id))];
      });
      setPage(next.pagination?.page ?? page);
      setTotalPages(next.pagination?.totalPages ?? totalPages);
      setSummary(next.summary);
    } catch (error) {
      toast.error((error as { message?: string }).message || t('promo.reviewsFailed'));
    } finally {
      setLoadingMore(false);
    }
  };

  const ratingRow = (
    <>
      {reviewsEnabled && (
        <>
          <button
            type="button"
            onClick={openRating}
            aria-label={t('promo.rateTitle')}
            title={t('promo.rateTitle')}
            className="rounded-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#f9d028]"
          >
            <StarRating value={Math.round(summary.average)} size={22} lgSize={30} glow />
          </button>
          <span aria-hidden="true" className="h-[calc(var(--u)*32)] w-px bg-white/15" />
        </>
      )}
      <span className="flex items-center gap-[calc(var(--u)*5)] text-[14px] leading-6 text-[#f0f1f5] lg:text-[max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*28)]">
        <StarIcon className="h-4 w-4 fill-current text-[#f9d028] lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)]" />
        {t('promo.rating', { value: summary.average.toFixed(1) })}
      </span>
    </>
  );

  // The window is held as ISO dates and written out the way the reader's locale writes them.
  const day = (iso: string | undefined): string =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : '—';

  return (
    <PlayerLayout>
      <Seo
        title={title}
        description={clip(promotion.description || promotion.details || '') || undefined}
        image={promotion.image_url || promoArt.src}
        imageAlt={title}
      />

      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <section>
          {/* --- Title row ------------------------------------------------ */}
          <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*19)]">
            <Link
              href="/promotions"
              aria-label={t('promo.back')}
              className={`${ARROW_CLASS} flex-shrink-0 hover:bg-white/10`}
            >
              <ChevronLeftIcon size={20} />
            </Link>

            <h1 className="min-w-0 truncate text-[22px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(16px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
              {title}
            </h1>

            {ended ? (
              <span className="flex h-[26px] shrink-0 items-center rounded-full bg-white/5 px-3 text-[13px] leading-5 text-[#f0f1f5] lg:h-[calc(var(--u)*29)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
                {t('promo.runs', { from: day(promotion.starts_at), to: day(promotion.ends_at) })}
              </span>
            ) : (
              <span className="rl-liquid flex h-[26px] shrink-0 items-center rounded-full px-3 text-[13px] leading-5 text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)] lg:h-[calc(var(--u)*30)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))]">
                {t('promo.live')}
              </span>
            )}

            
            <div className="ml-auto hidden shrink-0 items-center gap-[calc(var(--u)*20)] lg:flex">
              {ratingRow}
            </div>
          </div>

          
          <div className="mt-3 flex items-center justify-end gap-4 lg:hidden">{ratingRow}</div>

          <div className="relative mt-4 lg:mt-[calc(var(--u)*15)]">
            <div
              className={`relative overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)] ${
                ended ? 'aspect-[1548/330]' : 'aspect-[1548/340]'
              }`}
            >
              {promotion.image_url ? (
                // Uploaded artwork lives on the asset CDN; a plain <img> keeps
                // the image optimiser's host allowlist out of it.
                <img
                  src={promotion.image_url}
                  alt={title}
                  // A dead or deleted upload falls back to the default artwork.
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith(promoArt.src)) {
                      e.currentTarget.src = promoArt.src;
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={promoArt}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 81vw, 98vw"
                  className="object-cover"
                />
              )}
            </div>

            {!ended && (
              <div className="mt-4 flex flex-wrap justify-center gap-2.5 lg:absolute lg:inset-x-0 lg:top-[calc(var(--u)*267)] lg:mt-0 lg:gap-[calc(var(--u)*10)]">
                {[t('promo.optIn'), t('promo.claimNow')].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rl-btn-gold h-12 w-full rounded-full text-[15px] font-medium sm:w-62 lg:h-[calc(var(--u)*56)] lg:w-[calc(var(--u)*248)] lg:rounded-[calc(var(--u)*34)] lg:text-[max(12px,calc(var(--u)*16))]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!ended && (
            <CountdownBar
              value={countdownParts(remaining ?? 0)}
              size="lg"
              className={`mx-auto mt-5 max-w-90 lg:mt-[calc(var(--u)*33)] lg:w-[calc(var(--u)*478)] lg:max-w-none ${
                mounted ? '' : 'invisible'
              }`}
            />
          )}
        </section>

        {detailParagraphs.length > 0 && (
          <PromoTextPanel title={t('promo.details')} paragraphs={detailParagraphs} />
        )}

        <section className="space-y-[calc(var(--u)*14)] lg:space-y-[calc(var(--u)*20)]">
          <ShelfHeading
            title={t('promo.qualifyingGames')}
            href="/casino"
            controls={
              <div className="flex items-center gap-[calc(var(--u)*8)] lg:gap-[calc(var(--u)*14)]">
                {/* The track scrolls; the design's arrows have no pages to move
                    between here, so they are shown in their inert state rather
                    than wired to a pager this row does not have. */}
                <span aria-hidden="true" className={`${ARROW_CLASS} opacity-40`}>
                  <ArrowGlyph dir="prev" />
                </span>
                <span aria-hidden="true" className={`${ARROW_CLASS} opacity-40`}>
                  <ArrowGlyph dir="next" />
                </span>
              </div>
            }
          />
          {games.length > 0 && (
            <div className={SHELF_TRACK}>
              {games.map((game) => (
                <GameTile key={game.id} game={game} surface="promo-qualifying" />
              ))}
            </div>
          )}
        </section>

        {termsParagraphs.length > 0 && (
          <PromoTextPanel title={t('promo.terms')} paragraphs={termsParagraphs} />
        )}

        <section className="space-y-4 lg:space-y-[calc(var(--u)*19)]">
          <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(14px,calc(var(--u)*36))] lg:leading-[calc(var(--u)*44)]">
            {t('promo.reviews')}
          </h2>
          {items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(var(--u)*24)]">
              {items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p
              role={reviewsFailed ? 'alert' : undefined}
              className="rl-glass-deep rounded-[24px] px-6 py-12 text-center text-sm text-white/50 lg:rounded-[calc(var(--u)*34)]"
            >
              {t(reviewsFailed ? 'promo.reviewsFailed' : 'promo.noReviews')}
            </p>
          )}

          {page < totalPages && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-full bg-white/5 px-6 py-3 text-[15px] text-[#f0f1f5] transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                {t('promo.loadMore')}
              </button>
            </div>
          )}
        </section>

        <SiteFooter />
      </div>

      {reviewsEnabled && (
        <RatePromotionModal
          open={rating}
          onClose={() => setRating(false)}
          promotionId={promotionId}
          onSubmitted={onSubmitted}
          existing={mine}
          onRemoved={onRemoved}
        />
      )}
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const slug = String(context.params?.slug ?? '');

  let promotion: PromotionItem | null;
  try {
    promotion = await fetchPromotionServer(slug);
  } catch (error) {
    // The API is down or erroring. That is not "no such promotion" — say so on
    // the page rather than 404 a promotion that exists, or throw a 500.
    console.error('[promotions] detail failed:', error instanceof Error ? error.message : error);
    markUnavailable(context);
    return {
      props: { promotion: null, reviews: NO_REVIEWS, reviewsFailed: true, reviewsEnabled: false, games: [] },
    };
  }
  if (!promotion) {
    return { notFound: true };
  }

  const [{ data }, reviews, reviewsEnabled] = await Promise.all([
    fetchShelfList({ category: 'SLOTS' }, 1, 7),
    fetchReviewsServer(promotion.slug),
    fetchReviewsEnabledServer(),
  ]);

  return {
    props: {
      promotion,
      reviews: reviews ?? NO_REVIEWS,
      reviewsFailed: reviews === null,
      reviewsEnabled,
      games: data,
    },
  };
};

/**
 * Wraps the detail page so an API failure draws a message inside the normal
 * layout, with a way back, instead of a blank error page.
 */
const PromotionDetailRoute: FC<Props> = (props) => {
  const { t } = useTranslation();

  if (!props.promotion) {
    return (
      <PlayerLayout>
        <Seo title={t('promo.title')} noindex />
        <div className="mx-auto max-w-[1548px] space-y-6 px-1 py-10 text-center lg:max-w-[calc(var(--u)*1548)] lg:px-0">
          <p role="alert" className="rl-glass-deep rounded-[24px] px-6 py-16 text-sm text-white/60">
            {t('promo.unavailable')}
          </p>
          <Link
            href="/promotions"
            className="inline-flex h-11 items-center rounded-full bg-white/10 px-6 text-[15px] text-[#f0f1f5] transition-colors hover:bg-white/15"
          >
            {t('promo.back')}
          </Link>
        </div>
      </PlayerLayout>
    );
  }

  return <PromotionDetail {...props} promotion={props.promotion} />;
};

export default PromotionDetailRoute;
