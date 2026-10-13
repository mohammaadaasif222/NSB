import type { FC } from 'react';

import StarRating from '@/components/promotions/StarRating';
import { useTranslation } from '@/context/I18nContext';
import type { PromotionReview } from '@/services/promotionReviews';

import defaultAvatar from '@/assets/lobby/player/avatar-default.webp';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

const ago = (iso: string, locale: string): string => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  const [unit, size] = UNITS.find(([, s]) => seconds >= s) ?? ['second', 1];
  return formatter.format(-Math.floor(seconds / size), unit);
};

const ReviewCard: FC<{ review: PromotionReview }> = ({ review }) => {
  const { locale } = useTranslation();

  return (
    <article className="rl-liquid rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*30)]">
      <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*20)]">
        <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#252937] lg:h-[calc(var(--u)*66.5)] lg:w-[calc(var(--u)*66.5)]">
          <img
            src={review.avatar_url || defaultAvatar.src}
            alt=""
            className="h-full w-full object-cover"
          />
        </span>

        <h3 className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-7 text-white lg:text-[length:max(13px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {review.username}
        </h3>

        <span
          suppressHydrationWarning
          className="flex-shrink-0 text-[12px] leading-5 text-[#9da2b4] lg:text-[length:max(10px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]"
        >
          {ago(review.created_at, locale)}
        </span>
      </div>

      {/* Indented to the username's column, as the design sets it. */}
      <div className="mt-3 lg:ml-[calc(var(--u)*78)] lg:mt-[calc(var(--u)*14)]">
        <StarRating value={review.rating} size={28} lgSize={55} />
        {review.remark && (
          <p className="mt-2 break-words text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*11)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
            {review.remark}
          </p>
        )}
      </div>
    </article>
  );
};

export default ReviewCard;
