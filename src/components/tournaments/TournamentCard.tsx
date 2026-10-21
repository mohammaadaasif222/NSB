import type { FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import { UserIcon } from '@/components/icons';
import CountdownBar, { type Countdown } from '@/components/promotions/CountdownBar';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

export interface Tournament {
  id: string;
  /** Tournament artwork. Becomes a URL from the API once tournaments are served. */
  image: StaticImageData;
  active: boolean;
  /** An i18n key while the copy is the design's placeholder. */
  title: TranslationKey;
  /** Already formatted — "$40 000". */
  prizePool: string;
  /** Seats taken and seats total, as the design's "15/50". */
  joined: number;
  capacity: number;
  endsIn: Countdown;
  /** When it ran, as ISO dates — an ended card shows them instead of a countdown. */
  startDate?: string;
  endDate?: string;
}

/**
 * A date as the design writes it: 31/07/2026 — day first in English too (the
 * design's), every other language in its own order.
 */
export const useDay = (): ((iso: string) => string) => {
  const { locale } = useTranslation();
  return (iso) =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
};

/** The pill on the art: green Active while it runs, red Ended after. */
const BADGE =
  'rl-liquid absolute left-4 top-4 flex h-[26px] items-center rounded-full px-3 text-[13px] leading-5 lg:left-[calc(var(--u)*20)] lg:top-[calc(var(--u)*20)] lg:h-[calc(var(--u)*31)] lg:px-[calc(var(--u)*12)] lg:text-[length:max(11px,calc(var(--u)*14))]';

/**
 * One tournament, as the design's 370×495 card. Ended, as the Expired tab's
 * frame draws it: a red Ended pill on the art, and the dates it ran in place
 * of the countdown.
 */
const TournamentCard: FC<{ tournament: Tournament }> = ({ tournament }) => {
  const { t } = useTranslation();
  const day = useDay();

  return (
    <article className="rl-liquid flex flex-col overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
      {/* 370×222 in the design — kept as a ratio so the art scales with the card. */}
      <div className="relative aspect-[370/222]">
        <Image
          src={tournament.image}
          alt={t(tournament.title)}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />

        {tournament.active ? (
          <span className={`${BADGE} text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)]`}>
            {t('tournament.active')}
          </span>
        ) : (
          <span className={`${BADGE} text-[#e33827] drop-shadow-[0_0_8.5px_rgba(227,56,39,0.2)]`}>
            {t('tournament.ended')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 lg:px-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*15)]">
        <h3 className="mt-3 text-[20px] font-semibold leading-7 text-[#f0f1f5] lg:mt-[calc(var(--u)*14)] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {t(tournament.title)}
        </h3>

        {/* The prize block and the seat count share a top edge in the design,
            not a baseline — hence `items-start` rather than `items-center`. */}
        <div className="mt-3 flex items-start justify-between gap-3 lg:mt-[calc(var(--u)*14)]">
          <div>
            <p className="text-[13px] leading-5 text-[#9da2b4] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
              {t('tournament.prizePool')}
            </p>
            <p className="text-[20px] font-bold leading-7 text-[#f0f1f5] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
              {tournament.prizePool}
            </p>
          </div>

          {/* The design draws this glyph as a circle over a rounded-top bar —
              the same mark the app's own UserIcon already draws, so it is used
              rather than carried in as a second asset. */}
          <span className="flex shrink-0 items-center gap-1 text-[14px] leading-6 text-[#f0f1f5] tabular-nums lg:text-[length:max(11px,calc(var(--u)*16))]">
            <UserIcon size={18} />
            {tournament.joined}/{tournament.capacity}
          </span>
        </div>

        {/* Pinned to the foot so a longer headline cannot shunt the controls
            out of line with the cards beside it. */}
        <div className="mt-auto pt-5 lg:pt-[calc(var(--u)*14)]">
          {tournament.active ? (
            <CountdownBar value={tournament.endsIn} />
          ) : (
            // The design's one line: Starts on the left, Ends after a gap.
            <p className="flex flex-wrap gap-x-8 gap-y-1 text-[13px] leading-5 text-white tabular-nums lg:gap-x-[calc(var(--u)*36)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
              {tournament.startDate && (
                <span>{t('tournament.starts', { date: day(tournament.startDate) })}</span>
              )}
              {tournament.endDate && (
                <span>{t('tournament.ends', { date: day(tournament.endDate) })}</span>
              )}
            </p>
          )}

          <Link
            href={`/tournaments/${tournament.id}`}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-[18px] bg-white/10 text-[15px] font-medium text-[#f0f1f5] transition-colors hover:bg-white/15 lg:mt-[calc(var(--u)*14)] lg:h-[calc(var(--u)*48)] lg:rounded-[calc(var(--u)*24)] lg:text-[length:max(12px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
          >
            {t('tournament.viewDetail')}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TournamentCard;
