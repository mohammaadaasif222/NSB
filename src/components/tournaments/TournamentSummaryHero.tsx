import type { FC, ReactNode } from 'react';
import Image, { type StaticImageData } from 'next/image';

import { useTranslation } from '@/context/I18nContext';

/* The design's stat tile: a hairline card with a 5%→0 wash left to right over
   a flat 4% fill. The fourth one sits over the artwork, so it is darker and
   keeps a fixed width instead of sharing the row evenly. */
const CARD =
  'flex flex-col rounded-[22px] border p-4 lg:h-[calc(var(--u)*108)] lg:rounded-[calc(var(--u)*22)] lg:p-[calc(var(--u)*16)] bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_100%)]';
const CARD_LIGHT = `${CARD} border-[#f0f1f5]/[0.08] bg-white/4`;
const CARD_DARK = `${CARD} border-[#f0f1f5]/10 bg-black/28`;
/* `nowrap` only from lg: the design keeps every label on one line even where
   it overruns its tile, but on a phone that would push the tile off-screen. */
const LABEL =
  'text-[14px] leading-5 text-[#6a7287] lg:whitespace-nowrap lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]';
const VALUE =
  'text-[16px] font-medium leading-6 text-[#f0f1f5] lg:text-[max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

const Stat: FC<{ label: string; value: ReactNode; className?: string; dark?: boolean }> = ({
  label,
  value,
  className = '',
  dark,
}) => (
  <div className={`${dark ? CARD_DARK : CARD_LIGHT} ${className}`}>
    <p className={LABEL}>{label}</p>
    <p
      className={`${VALUE} ${dark ? 'mt-2 lg:mt-[calc(var(--u)*8)]' : 'mt-2.5 lg:mt-[calc(var(--u)*10)]'}`}
    >
      {value}
    </p>
  </div>
);

interface Props {
  image: StaticImageData;
  /** Already formatted — "$40 000". */
  prizePool: string;
  /** Already formatted — "31/07/2026". */
  startDate: string;
  endDate: string;
  joined: number;
  capacity: number;
  /** How many tournaments this player has entered, as the design labels it. */
  record: string;
}

/**
 * The ended detail page's 1548×380 header: the summary line, the prize pool,
 * and the four facts left over once there is nothing left to count down to.
 */
const TournamentSummaryHero: FC<Props> = ({
  image,
  prizePool,
  startDate,
  endDate,
  joined,
  capacity,
  record,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rl-glass-deep relative overflow-hidden rounded-[34px] lg:rounded-[calc(var(--u)*34)]">
      {/* A phone sets the artwork as a 254 band across the top, fading out
          downwards, with the panel's content under it. The frame draws the art
          524 x 295, its right edge 21 past the panel's, so the trophy shows. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[254px] overflow-hidden [-webkit-mask-image:linear-gradient(0deg,transparent_4%,#000_64%)] [mask-image:linear-gradient(0deg,transparent_4%,#000_64%)] lg:hidden"
      >
        <div className="absolute -right-[21px] -top-[36px] h-[295px] w-[524px]">
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      {/* Same masked artwork as the live header — see TournamentHero for why
          this is a mask rather than a gradient fill. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68.28%] lg:block [-webkit-mask-image:linear-gradient(90deg,transparent_25%,#000_53%)] [mask-image:linear-gradient(90deg,transparent_25%,#000_53%)]"
      >
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 56vw, 68vw"
          className="object-cover"
        />
      </div>

      <div className="relative px-4 pb-[22px] pt-[288px] lg:h-[calc(var(--u)*380)] lg:p-[calc(var(--u)*30)]">
        <p className={LABEL}>{t('tournament.summary')}</p>
        <p className="mt-[9px] text-[28px] font-medium leading-9 tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*6)] lg:font-semibold lg:text-[max(16px,calc(var(--u)*32))] lg:leading-[calc(var(--u)*40)]">
          {t('tournament.rewardsDistributed')}
        </p>

        {/* 615 wide in the design — the same column the live header's
            countdown occupies. */}
        <div className="mt-[9px] space-y-3 lg:mt-[calc(var(--u)*26)] lg:w-[calc(var(--u)*615)] lg:space-y-[calc(var(--u)*12)]">
          <div className={`${CARD_LIGHT} h-[108px]`}>
            <p className={LABEL}>{t('tournament.prizePool')}</p>
            <p className="mt-2.5 text-[44px] font-semibold leading-[52px] tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*10)] lg:text-[max(20px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
              {prizePool}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:flex lg:gap-[calc(var(--u)*12)]">
            <Stat
              label={t('tournament.startDate')}
              value={startDate}
              className="lg:min-w-0 lg:flex-1"
            />
            <Stat
              label={t('tournament.endDate')}
              value={endDate}
              className="lg:min-w-0 lg:flex-1"
            />
            <Stat
              label={t('tournament.participants')}
              value={`${joined}/${capacity}`}
              className="lg:min-w-0 lg:flex-1"
            />
            <Stat
              label={t('tournament.record')}
              value={record}
              dark
              className="lg:w-[calc(var(--u)*153)] lg:shrink-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TournamentSummaryHero;
