import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { text } from '@/components/player/typeScale';
import { TRACKED_MATCH } from '@/services/sportsbook.sample';

/** A glass side card, the betslip column's other panels. */
const PANEL =
  'rl-liquid rounded-[34px] px-[22px] pb-[22px] pt-[25px] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*22)] lg:pb-[calc(var(--u)*22)] lg:pt-[calc(var(--u)*25)]';

/**
 * Live Match Tracker: the court, the score and two stats for one game in
 * play. Sample content until a live-data feed exists (see sportsbook.sample).
 */
export const MatchTracker: FC = () => {
  const { t } = useTranslation();
  const match = TRACKED_MATCH;

  return (
    <section aria-label={t('sports.tracker')} className={PANEL}>
      <header className="flex items-center justify-between">
        <h2 className={`${text(14)} font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}>
          {t('sports.tracker')}
        </h2>
        <span
          className="h-[calc(var(--u)*8)] w-[calc(var(--u)*8)] animate-pulse rounded-full bg-white"
          aria-hidden="true"
        />
      </header>

      <div className="relative mt-[calc(var(--u)*13)] flex h-[calc(var(--u)*239)] flex-col items-center justify-end overflow-hidden rounded-[calc(var(--u)*28)] border-2 border-white/20 bg-white/5 pb-[calc(var(--u)*10)]">
        {/* Half-way line and centre circle. */}
        <span
          className="absolute left-1/2 top-[calc(var(--u)*13)] h-[calc(var(--u)*142)] w-px -translate-x-1/2 bg-[#c9c9c9]"
          aria-hidden="true"
        />
        <span
          className="absolute left-1/2 top-[calc(var(--u)*50)] h-[calc(var(--u)*60)] w-[calc(var(--u)*60)] -translate-x-1/2 rounded-full border-2 border-[#c9c9c9]"
          aria-hidden="true"
        />
        <span className={`${text(14)} font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}>
          {match.title}
        </span>
        <span className={`${text(12)} leading-[calc(var(--u)*20)] text-[#f0f1f5]`}>
          {t(match.period.key)} - {match.period.clock}
        </span>
        <span
          className={`${text(24)} font-bold leading-[calc(var(--u)*32)] tabular-nums text-[#f0f1f5]`}
        >
          {match.score}
        </span>
      </div>

      <dl className="mt-[calc(var(--u)*14)] flex flex-col gap-[calc(var(--u)*8)]">
        {match.stats.map((stat) => (
          <div
            key={stat.key}
            className={`${text(12)} flex justify-between leading-[calc(var(--u)*14)]`}
          >
            <dt className="text-[#9da2b4]">{t(stat.key)}</dt>
            <dd className="font-semibold tabular-nums text-[#f0f1f5]">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

/** "Keep it Fun. Keep it Safe." — the way into the player's own limits. */
export const SafePlayCard: FC = () => {
  const { t } = useTranslation();

  return (
    <section className={PANEL}>
      <h2 className={`${text(14)} font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}>
        {t('sports.safeTitle')}
      </h2>
      <p className={`${text(12)} mt-[calc(var(--u)*7)] leading-[calc(var(--u)*20)] text-[#9da2b4]`}>
        {t('sports.safeBody')}
      </p>
      <Link
        href="/responsible-gambling"
        className={`${text(12)} mt-[calc(var(--u)*4)] inline-flex h-[calc(var(--u)*36)] items-center rounded-full bg-[#252937] px-[calc(var(--u)*12)] font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5] transition-colors hover:bg-[#2f3446]`}
      >
        {t('sports.safeCta')}
      </Link>
    </section>
  );
};

/**
 * The sport page's offer: the copy on the left, the claim button on the
 * right on desktop; stacked on a phone.
 */
export const OfferBanner: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="rl-liquid flex flex-col items-start gap-6 rounded-[34px] px-5 pb-6 pt-7 lg:h-[calc(var(--u)*220)] lg:flex-row lg:items-center lg:justify-between lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*40)] lg:py-0 lg:pe-[calc(var(--u)*46)]">
      <div className="max-w-[calc(var(--u)*500)]">
        <p className={`${text(12)} uppercase leading-[calc(var(--u)*20)] text-[#ffe779]`}>
          {t('sports.offerEyebrow')}
        </p>
        <h2
          className={`${text(32)} mt-[calc(var(--u)*10)] font-bold leading-[calc(var(--u)*40)] text-[#f0f1f5]`}
        >
          {t('sports.offerTitle')}
        </h2>
        <p
          className={`${text(14)} mt-[calc(var(--u)*9)] leading-[calc(var(--u)*20)] text-[#9da2b4]`}
        >
          {t('sports.offerBody')}
        </p>
      </div>
      <Link
        href="/promotions"
        className={`${text(16)} inline-flex h-[calc(var(--u)*56)] flex-shrink-0 items-center rounded-full bg-[#f9d028] px-[calc(var(--u)*28)] font-medium leading-[calc(var(--u)*24)] text-[#07080a] transition-[filter] hover:brightness-110`}
      >
        {t('sports.offerCta')}
      </Link>
    </section>
  );
};
