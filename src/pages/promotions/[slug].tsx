import { useState, type FC } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import GameTile from '@/components/player/GameTile';
import { ShelfHeading, SHELF_TRACK, ARROW_CLASS, ArrowGlyph } from '@/components/player/GameRow';
import CountdownBar from '@/components/promotions/CountdownBar';
import PromoTextPanel from '@/components/promotions/PromoTextPanel';
import ReviewCard from '@/components/promotions/ReviewCard';
import StarRating from '@/components/promotions/StarRating';
import RatePromotionModal from '@/components/promotions/RatePromotionModal';
import { ChevronLeftIcon, StarIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import { fetchShelfList } from '@/services/games.server';
import type { Game } from '@/types';
import { DETAIL_COPY, REVIEWS, findPromotion } from '@/constants/promotions';

import promoArt from '@/assets/promotions/promo-horse-racing.png';

interface Props {
  /** Which of the design's two states to draw. */
  status: 'live' | 'expired';
  /** The run dates, shown in place of the Live flag once a promotion has ended. */
  runs: { from: string; to: string } | null;
  /** The Qualifying Games shelf — real catalogue games, seven as the design draws. */
  games: Game[];
}

/**
 * One promotion.
 *
 * PLACEHOLDER, except the games. There is no promotions table and no endpoint,
 * so the headline, the banner, the rating, the countdown, both copy panels and
 * every review are the design's own, identical whatever `slug` asks for. The
 * Qualifying Games row is real: it reads the catalogue the lobby reads, so the
 * shelf is never a mock even while the promotion around it is.
 *
 * Replace DETAIL_COPY and REVIEWS with the feed when there is one; nothing in
 * the layout has to change.
 */
const PromotionDetailPage: FC<Props> = ({ status, runs, games }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(false);
  const ended = status === 'expired';

  return (
    <PlayerLayout>
      <Head>
        <title>{`${DETAIL_COPY.title} · ROLLUCK`}</title>
      </Head>

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
              {DETAIL_COPY.title}
            </h1>

            {/* A running promotion flies the green Live flag; an ended one
                states the window it ran in, which is the only thing left to
                say about it. */}
            {ended ? (
              <span className="flex h-[26px] shrink-0 items-center rounded-full bg-white/5 px-3 text-[13px] leading-5 text-[#f0f1f5] lg:h-[calc(var(--u)*29)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
                {t('promo.runs', { from: runs?.from ?? '—', to: runs?.to ?? '—' })}
              </span>
            ) : (
              <span className="rl-liquid flex h-[26px] shrink-0 items-center rounded-full px-3 text-[13px] leading-5 text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)] lg:h-[calc(var(--u)*30)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))]">
                {t('promo.live')}
              </span>
            )}

            {/* The design puts a "rate this" row, a rule and the average at the
                far end. The row is the handle for the rating dialog — that is
                the only thing in the frame that opens it. */}
            <div className="ml-auto hidden shrink-0 items-center gap-[calc(var(--u)*20)] lg:flex">
              <button
                type="button"
                onClick={() => setRating(true)}
                aria-label={t('promo.rateTitle')}
                className="rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#f9d028]"
              >
                <StarRating value={0} size={18} lgSize={30} />
              </button>
              <span aria-hidden="true" className="h-[calc(var(--u)*32)] w-px bg-white/15" />
              <span className="flex items-center gap-[calc(var(--u)*5)] text-[max(11px,calc(var(--u)*16))] leading-[calc(var(--u)*28)] text-[#f0f1f5]">
                <StarIcon className="h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] fill-current" />
                {t('promo.rating', { value: DETAIL_COPY.rating })}
              </span>
            </div>
          </div>

          {/* --- Banner, with the two calls to action over its foot --------
              An ended promotion has nothing to opt into and no time left to
              count, so the frame drops both and the banner loses the ten
              pixels it was carrying for them. */}
          <div className="relative mt-4 lg:mt-[calc(var(--u)*15)]">
            <div
              className={`relative overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)] ${
                ended ? 'aspect-[1548/330]' : 'aspect-[1548/340]'
              }`}
            >
              <Image
                src={promoArt}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 81vw, 98vw"
                className="object-cover"
              />
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
              value={DETAIL_COPY.endsIn}
              size="lg"
              className="mx-auto mt-5 max-w-90 lg:mt-[calc(var(--u)*33)] lg:w-[calc(var(--u)*478)] lg:max-w-none"
            />
          )}
        </section>

        <PromoTextPanel title={t('promo.details')} paragraphs={DETAIL_COPY.details} />

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

        <PromoTextPanel title={t('promo.terms')} paragraphs={DETAIL_COPY.terms} />

        <section className="space-y-4 lg:space-y-[calc(var(--u)*19)]">
          <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(14px,calc(var(--u)*36))] lg:leading-[calc(var(--u)*44)]">
            {t('promo.reviews')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(var(--u)*24)]">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>

      <RatePromotionModal open={rating} onClose={() => setRating(false)} />
    </PlayerLayout>
  );
};

/**
 * The Qualifying Games row only. The promotion itself has no endpoint, so
 * there is nothing else to fetch — and a failed catalogue read drops the row
 * rather than the page.
 */
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const promo = findPromotion(String(context.params?.slug ?? ''));
  if (!promo) {
    return { notFound: true };
  }

  const { data } = await fetchShelfList({ category: 'SLOTS' }, 1, 7);

  return {
    props: {
      status: promo.status,
      runs: promo.runs ?? null,
      games: data,
    },
  };
};

export default PromotionDetailPage;
