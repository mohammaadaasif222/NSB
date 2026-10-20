import type { FC } from 'react';
import Link from 'next/link';

import { StarIcon } from '@/components/icons';
import CountdownBar, { countdownParts } from '@/components/promotions/CountdownBar';
import { useTranslation } from '@/context/I18nContext';
import { useCountdown } from '@/hooks/useCountdown';
import type { PromotionItem } from '@/services/promotions';

import promoArt from '@/assets/promotions/promo-horse-racing.webp';

/** One promotion, as the design's 370×495 card. */
const PromotionCard: FC<{ promo: PromotionItem }> = ({ promo }) => {
  const { t } = useTranslation();
  const live = promo.status === 'live';
  // Ticks once a second while the promotion runs; an ended one shows zeros.
  const remaining = useCountdown(live ? promo.ends_at : null);

  return (
    <article className="rl-liquid flex flex-col overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
      {/* 370×222 in the design — kept as a ratio so the art scales with the card. */}
      <div className="relative aspect-[370/222]">
        {/* A plain <img>: artwork is uploaded from the console to the asset
            CDN, which the image optimiser's host allowlist should not have to
            track. Without artwork the design's own picture stands in. */}
        <img
          src={promo.image_url || promoArt.src}
          alt={promo.title}
          // A dead or deleted upload falls back to the default artwork.
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(promoArt.src)) {
              e.currentTarget.src = promoArt.src;
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between lg:inset-x-[calc(var(--u)*20)] lg:top-[calc(var(--u)*20)]">
          {live && (
            <span className="rl-liquid flex h-[26px] items-center rounded-full px-3 text-[13px] leading-5 text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)] lg:h-[calc(var(--u)*31)] lg:px-[calc(var(--u)*12)] lg:text-[length:max(11px,calc(var(--u)*14))]">
              {t('promo.live')}
            </span>
          )}
          <span className="ml-auto flex items-center gap-[5px] text-[14px] leading-6 text-[#f0f1f5] lg:text-[length:max(11px,calc(var(--u)*16))]">
            {/* The design draws a solid star; the app's own mark is an outline,
                so it is filled here rather than carried in as a second asset. */}
            <StarIcon size={15} className="fill-current" />
            {t('promo.rating', { value: (promo.rating?.average ?? 0).toFixed(1) })}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 lg:px-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*15)]">
        <h3 className="mt-3 text-[20px] font-semibold leading-7 text-[#f0f1f5] lg:mt-[calc(var(--u)*14)] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {promo.title}
        </h3>
        <p className="mt-1.5 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*9)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
          {promo.description}
        </p>

        {/* Pinned to the foot so a longer headline cannot shunt the controls
            out of line with the cards beside it. */}
        <div className="mt-auto pt-5 lg:pt-[calc(var(--u)*23)]">
          <CountdownBar value={countdownParts(remaining ?? 0)} />

          <Link
            href={`/promotions/${promo.slug}`}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-[18px] bg-white/10 text-[15px] font-medium text-[#f0f1f5] transition-colors hover:bg-white/15 lg:mt-[calc(var(--u)*14)] lg:h-[calc(var(--u)*48)] lg:rounded-[calc(var(--u)*24)] lg:text-[length:max(12px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
          >
            {t('promo.learnMore')}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PromotionCard;
