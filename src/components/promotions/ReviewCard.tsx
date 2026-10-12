import type { FC } from 'react';
import Image, { type StaticImageData } from 'next/image';

import StarRating from '@/components/promotions/StarRating';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

export interface Review {
  id: string;
  avatar: StaticImageData;
  username: string;
  /** How long ago, as the design's "3 hours ago" — worded per locale. From a timestamp once reviews are real. */
  when: { value: number; unit: Intl.RelativeTimeFormatUnit };
  stars: number;
  /** An i18n key while the copy is the design's placeholder. */
  body: TranslationKey;
}

/** One review, as the design's 500×265 glass card. */
const ReviewCard: FC<{ review: Review }> = ({ review }) => {
  const { t, locale } = useTranslation();
  const when = new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(
    -review.when.value,
    review.when.unit
  );

  return (
    <article className="rl-liquid rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*30)]">
      <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*20)]">
        <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#252937] lg:h-[calc(var(--u)*66.5)] lg:w-[calc(var(--u)*66.5)]">
          <Image src={review.avatar} alt="" fill sizes="67px" className="object-cover" />
        </span>

        <h3 className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-7 text-white lg:text-[length:max(13px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {review.username}
        </h3>

        <span className="flex-shrink-0 text-[12px] leading-5 text-[#9da2b4] lg:text-[length:max(10px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
          {when}
        </span>
      </div>

      {/* Indented to the username's column, as the design sets it. */}
      <div className="mt-3 lg:ml-[calc(var(--u)*78)] lg:mt-[calc(var(--u)*14)]">
        <StarRating value={review.stars} size={28} lgSize={55} />
        <p className="mt-2 text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*11)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
          {t(review.body)}
        </p>
      </div>
    </article>
  );
};

export default ReviewCard;
