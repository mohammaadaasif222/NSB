import type { FC } from 'react';
import Image, { type StaticImageData } from 'next/image';

import { UserIcon } from '@/components/icons';
import CountdownBar, { type Countdown } from '@/components/promotions/CountdownBar';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  image: StaticImageData;
  /** Already formatted — "$40 000". */
  prizePool: string;
  joined: number;
  capacity: number;
  endsIn: Countdown;
}

/**
 * The detail page's 1548×380 header: the prize pool and the seat count on the
 * left, the countdown along the foot of that column, and the artwork filling
 * the right of the panel.
 */
const TournamentHero: FC<Props> = ({ image, prizePool, joined, capacity, endsIn }) => {
  const { t } = useTranslation();

  return (
    <section className="rl-glass-deep relative overflow-hidden rounded-[34px] lg:rounded-[calc(var(--u)*34)]">
      {/* 1057 of the 1548 in the design, flush to the right edge. The frame
          fades it into the panel with an alpha mask rather than a fill, so it
          is masked here too — a gradient overlay would have to guess at the
          glass behind it and would be wrong wherever the page is not black. */}
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

      <div className="relative flex flex-col px-5 pb-[21px] pt-[288px] lg:h-[calc(var(--u)*380)] lg:px-[calc(var(--u)*30)] lg:pb-[calc(var(--u)*42)] lg:pt-[calc(var(--u)*31)]">
        {/* 615 wide in the design — the countdown's width, which is what the
            seat chip is right-aligned to. */}
        <div className="relative lg:w-[calc(var(--u)*615)]">
          <span className="absolute -right-[3px] -top-2 flex h-11 items-center gap-2.5 rounded-[20px] border border-white/[0.08] bg-white/7 px-3.5 text-[16px] font-medium leading-6 lg:right-0 lg:top-0 text-[#f0f1f5] shadow-[0_8px_20px_rgba(0,0,0,0.14)] tabular-nums lg:h-[calc(var(--u)*44)] lg:gap-[calc(var(--u)*10)] lg:rounded-[calc(var(--u)*20)] lg:px-[calc(var(--u)*14)] lg:text-[length:max(11px,calc(var(--u)*16))]">
            {/* The design draws this glyph as a circle over a rounded-top bar —
                the same mark the app's own UserIcon already draws. */}
            <UserIcon size={24} />
            {joined}/{capacity}
          </span>

          <p className="text-[14px] leading-5 text-[#6a7287] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
            {t('tournament.prizePool')}
          </p>
          <p className="mt-[9px] text-[44px] font-semibold leading-[52px] tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*9)] lg:text-[length:max(20px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
            {prizePool}
          </p>
        </div>

        <CountdownBar
          value={endsIn}
          size="wide"
          className="mt-4 lg:mt-auto lg:w-[calc(var(--u)*615)]"
        />

        {/* The phone frame closes the panel on the call to action; it leads
            to the terms below, which is what the detail adds to the card. */}
        <a
          href="#terms"
          className="mt-[17px] flex h-12 items-center justify-center rounded-full bg-[#f9d028] text-[18px] font-semibold leading-6 text-[#07080a] transition-colors hover:bg-[#ffe066] lg:hidden"
        >
          {t('tournament.viewDetail')}
        </a>
      </div>
    </section>
  );
};

export default TournamentHero;
