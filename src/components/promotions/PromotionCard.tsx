import type { FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import { StarIcon } from '@/components/icons';
import CountdownBar, { type Countdown } from '@/components/promotions/CountdownBar';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

export interface Promotion {
  id: string;
  /** Promo artwork. Becomes a URL from the API once promotions are served. */
  image: StaticImageData;
  live: boolean;
  /** Already formatted — "4.5". */
  rating: string;
  /** i18n keys while the copy is the design's placeholder. */
  title: TranslationKey;
  body: TranslationKey;
  endsIn: Countdown;
}

/** One promotion, as the design's 370×495 card. */
const PromotionCard: FC<{ promo: Promotion }> = ({ promo }) => {
  const { t } = useTranslation();

  return (
    <article className="rl-liquid flex flex-col overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
      {/* 370×222 in the design — kept as a ratio so the art scales with the card. */}
      <div className="relative aspect-[370/222]">
        <Image
          src={promo.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between lg:inset-x-[calc(var(--u)*20)] lg:top-[calc(var(--u)*20)]">
          {promo.live && (
            <span className="rl-liquid flex h-[26px] items-center rounded-full px-3 text-[13px] leading-5 text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)] lg:h-[calc(var(--u)*31)] lg:px-[calc(var(--u)*12)] lg:text-[length:max(11px,calc(var(--u)*14))]">
              {t('promo.live')}
            </span>
          )}
          <span className="ml-auto flex items-center gap-[5px] text-[14px] leading-6 text-[#f0f1f5] lg:text-[length:max(11px,calc(var(--u)*16))]">
            {/* The design draws a solid star; the app's own mark is an outline,
                so it is filled here rather than carried in as a second asset. */}
            <StarIcon size={15} className="fill-current" />
            {t('promo.rating', { value: promo.rating })}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 lg:px-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*15)]">
        <h3 className="mt-3 text-[20px] font-semibold leading-7 text-[#f0f1f5] lg:mt-[calc(var(--u)*14)] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {t(promo.title)}
        </h3>
        <p className="mt-1.5 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*9)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
          {t(promo.body)}
        </p>

        {/* Pinned to the foot so a longer headline cannot shunt the controls
            out of line with the cards beside it. */}
        <div className="mt-auto pt-5 lg:pt-[calc(var(--u)*23)]">
          <CountdownBar value={promo.endsIn} />

          <Link
            href={`/promotions/${promo.id}`}
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
