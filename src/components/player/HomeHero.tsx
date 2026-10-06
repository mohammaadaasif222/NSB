import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { fullNameOf } from '@/types/profile';
import defaultAvatar from '@/assets/lobby/player/avatar-default.webp';
import casinoArt from '@/assets/lobby/player/panel-casino.webp';
import sportsArt from '@/assets/lobby/player/panel-sports.webp';
import casinoLine from '@/assets/lobby/player/panel-casino-line.svg';
import sportsLine from '@/assets/lobby/player/panel-sports-line.svg';
import promoArt from '@/assets/lobby/player/promo-banner.webp';
import promoArtMobile from '@/assets/lobby/player/promo-banner-mobile.webp';

/**
 * Wagering requirement on the player's active bonus.
 *
 * There is no wagering endpoint yet — /balance/me returns the two pot totals
 * and nothing about bonus progress — so these figures are illustrative, in the
 * same spirit as the winners strip. Every number rendered below is derived
 * from this one object, so swapping it for the real payload is the whole of
 * the change once the endpoint exists.
 */
const WAGERING = { wagered: 650, required: 1000 };

const usd = (value: number, locale: string): string => `$${value.toLocaleString(locale)}`;

/*
 * Sized in `--u` (see PlayerLayout): the design's px on desktop, scaled with
 * the page. The phone layout is the phone design's own, at its own sizes.
 */

/* ==================================================================== */
/* Pieces                                                                */
/* ==================================================================== */

/** The player's picture: their own if they set one, the design's otherwise. */
const Avatar: FC<{ ringed?: boolean }> = ({ ringed }) => {
  const { me } = useMe();
  const src = me?.avatar_url || defaultAvatar.src;

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full ${
        ringed ? 'h-[calc(var(--u)*85)] w-[calc(var(--u)*85)] ring-1 ring-[#9da2b4]' : ''
      }`}
    >
      <img
        src={src}
        alt=""
        className="h-[81px] w-[81px] rounded-full bg-[#666666] object-cover lg:h-[calc(var(--u)*81)] lg:w-[calc(var(--u)*81)]"
      />
    </span>
  );
};

const useDisplayName = (): string => {
  const { me } = useMe();
  const { t } = useTranslation();
  return (me && (me.display_name || fullNameOf(me) || me.username)) || t('account.account');
};

/**
 * A section shortcut in the panel. Desktop: the design's 125×158 glass tile
 * with the section's 3D render and its glow. Phone: a 174×110 tile with the
 * line mark.
 */
const SectionTile: FC<{
  href: string;
  label: string;
  art: string;
  mark: string;
}> = ({ href, label, art, mark }) => (
  <Link
    href={href}
    className="rl-liquid group relative flex h-[110px] flex-1 flex-col items-center rounded-[24px] pt-[14px] transition-colors hover:bg-white/[0.11] lg:h-[calc(var(--u)*158)] lg:w-[calc(var(--u)*125)] lg:flex-none lg:rounded-[calc(var(--u)*24)] lg:pt-0"
  >
    <img src={mark} alt="" className="h-[49px] w-[49px] lg:hidden" />
    {/* The render carries its glow, so the image is the art plus a 34px
        margin of light on every side — hence the negative offset. */}
    <img
      src={art}
      alt=""
      className="absolute left-1/2 top-[calc(var(--u)*-18)] hidden h-[calc(var(--u)*169)] w-[calc(var(--u)*169)] max-w-none -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-1 lg:block"
    />
    <span className="mt-auto pb-3 text-[18px] leading-7 text-[#f0f1f5] lg:pb-[calc(var(--u)*16)] lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
      {label}
    </span>
  </Link>
);

/**
 * The remaining amount as the design's odometer: a dollar cell and six glass
 * digit cells on a dark plate with a slate rim, lit from behind.
 */
const Odometer: FC<{ value: number }> = ({ value }) => {
  const digits = String(Math.max(0, Math.round(value)))
    .padStart(6, '0')
    .slice(-6)
    .split('');
  const cell =
    'flex h-[calc(var(--u)*61)] items-center justify-center rounded-[calc(var(--u)*3)] bg-white/10 font-bold text-[#f0f1f5] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-2px_2px_rgba(0,0,0,0.3)]';

  return (
    <div
      className="flex h-[calc(var(--u)*68)] w-[calc(var(--u)*342)] items-center gap-[calc(var(--u)*2)] rounded-[calc(var(--u)*10)] border-[length:calc(var(--u)*2.5)] border-[#6a7287] bg-[#14191c] px-[calc(var(--u)*1.5)] shadow-[0_0_35px_rgba(255,255,255,0.2)]"
      aria-label={`$${value}`}
    >
      <span
        className={`${cell} w-[calc(var(--u)*50)] text-[length:max(min(11px,36px),calc(var(--u)*36))] leading-[calc(var(--u)*44)] tracking-[-0.02em]`}
      >
        $
      </span>
      {digits.map((d, i) => (
        <span
          // Positional digits: the index is their identity.
          key={i}
          className={`${cell} flex-1 text-[length:max(min(11px,48px),calc(var(--u)*48))] leading-[calc(var(--u)*52)] tracking-[-0.02em]`}
        >
          {d}
        </span>
      ))}
    </div>
  );
};

/** The phone's progress bar: the design's glowing gold fill on a glass track. */
const ProgressBar: FC<{ percent: number; label: string }> = ({ percent, label }) => (
  <div
    className="rl-liquid h-[17px] w-full rounded-[34px]"
    role="progressbar"
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
  >
    <div
      className="h-full rounded-[34px] bg-[#d1ba3e] shadow-[0_2px_15px_rgba(249,208,40,0.8)]"
      style={{ width: `${percent}%` }}
    />
  </div>
);

/** A pale pill under the progress: "$350 remaining to unlock your bonus". */
const RemainingPill: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex h-[38px] items-center rounded-[24px] bg-white/10 px-[38px] text-[12px] leading-5 text-white lg:h-[calc(var(--u)*34)] lg:rounded-[calc(var(--u)*24)] lg:px-[calc(var(--u)*18)] lg:text-[length:max(min(11px,12px),calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]">
    {children}
  </span>
);

/* ==================================================================== */
/* Player panel                                                          */
/* ==================================================================== */

/**
 * Who the player is, where to play, and how their bonus is going — laid out
 * as each design draws it: the desktop panel puts the identity beside the two
 * tiles and shows the remaining amount on an odometer; the phone stacks
 * everything and uses a progress bar.
 */
const PlayerPanel: FC = () => {
  const { t, locale } = useTranslation();
  const name = useDisplayName();

  const { wagered, required } = WAGERING;
  const percent = Math.min(100, Math.round((wagered / required) * 100));
  const remaining = Math.max(0, required - wagered);

  return (
    <section className="rl-liquid relative overflow-hidden rounded-[34px] lg:h-[calc(var(--u)*415)] lg:rounded-[calc(var(--u)*34)]">
      {/* --- Identity and tiles ----------------------------------------- */}
      <div className="flex flex-col items-center px-[15px] pt-5 lg:h-[calc(var(--u)*212)] lg:flex-row lg:items-start lg:justify-between lg:px-[calc(var(--u)*20)] lg:pl-[calc(var(--u)*18)] lg:pt-[calc(var(--u)*20)]">
        <div className="flex flex-col items-center gap-px lg:mt-[calc(var(--u)*42)] lg:flex-row lg:gap-[calc(var(--u)*14)]">
          <Avatar ringed />
          <span className="max-w-[calc(var(--u)*140)] truncate text-[18px] font-medium leading-7 text-white lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
            {name}
          </span>
        </div>

        <div className="mt-[20px] flex w-full gap-[11px] lg:mt-0 lg:w-auto lg:gap-[calc(var(--u)*12)]">
          <SectionTile
            href="/casino"
            label={t('nav.casino')}
            art={casinoArt.src}
            mark={casinoLine.src}
          />
          <SectionTile
            href="/sports"
            label={t('nav.sports')}
            art={sportsArt.src}
            mark={sportsLine.src}
          />
        </div>
      </div>

      {/* --- Wagering --------------------------------------------------- */}
      <div className="mt-[15px] flex flex-col bg-white/[0.07] px-[15px] pb-[21px] pt-4 lg:absolute lg:inset-x-px lg:bottom-0 lg:mt-0 lg:h-[calc(var(--u)*203)] lg:rounded-b-[calc(var(--u)*34)] lg:border-t lg:border-white/[0.08] lg:bg-[#2c2c2c]/[0.26] lg:px-[calc(var(--u)*20)] lg:pb-0 lg:pt-[calc(var(--u)*17)]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-[calc(var(--u)*4)]">
            <span className="text-[16px] font-medium leading-6 text-white lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
              {t('dash.wageringProgress')}
            </span>
            <span className="hidden h-[calc(var(--u)*16)] items-center rounded-full border border-[#03b739] bg-[#03b739]/10 px-[calc(var(--u)*5)] text-[length:max(min(11px,10px),calc(var(--u)*10))] leading-none text-[#03b739] lg:inline-flex">
              {percent}%
            </span>
          </span>
          <span className="text-[12px] font-medium leading-5 text-white lg:hidden">
            {t('dash.percentComplete', { percent })}
          </span>
          <span className="hidden text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4] lg:block">
            {t('dash.wagered', { amount: usd(wagered, locale) })}
          </span>
        </div>

        {/* Phone: the bar, with its ends and the amount so far. */}
        <div className="mt-[22px] lg:hidden">
          <ProgressBar percent={percent} label={t('dash.wageringProgress')} />
          <div className="mt-[14px] flex items-center justify-between text-[12px] leading-5 text-[#9da2b4]">
            <span>{usd(0, locale)}</span>
            <span className="text-[14px] font-medium text-white">
              {t('dash.wagered', { amount: usd(wagered, locale) })}
            </span>
            <span>{usd(required, locale)}</span>
          </div>
          <div className="mt-4 flex justify-center">
            <RemainingPill>
              {t('dash.remainingToUnlock', { amount: usd(remaining, locale) })}
            </RemainingPill>
          </div>
        </div>

        {/* Desktop: the remaining amount on the odometer. */}
        <div className="hidden flex-col items-center gap-[calc(var(--u)*16)] lg:mt-[calc(var(--u)*24)] lg:flex">
          <Odometer value={remaining} />
          <RemainingPill>{t('dash.remainingToUnlockShort')}</RemainingPill>
        </div>
      </div>
    </section>
  );
};

/* ==================================================================== */
/* Promo                                                                 */
/* ==================================================================== */

/**
 * The promotion artwork beside the panel — each design's own crop — opening
 * the promotions page.
 */
const PromoBanner: FC = () => (
  <Link
    href="/promotions"
    aria-label="Promotions"
    className="group relative block h-[168px] overflow-hidden rounded-[34px] lg:h-[calc(var(--u)*416)] lg:rounded-[calc(var(--u)*34)]"
  >
    <Image
      src={promoArtMobile}
      alt=""
      fill
      sizes="100vw"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02] lg:hidden"
    />
    <Image
      src={promoArt}
      alt=""
      fill
      priority
      sizes="(max-width: 1024px) 100vw, 60vw"
      className="hidden object-cover transition-transform duration-500 group-hover:scale-[1.02] lg:block"
    />
  </Link>
);

/* ==================================================================== */
/* The hero                                                              */
/* ==================================================================== */

/**
 * The signed-in lobby's hero: the player panel and the promotion beside it —
 * 558 and 966 of the design's 1548px — stacked on a phone.
 */
const HomeHero: FC = () => (
  <div className="flex flex-col gap-[15px] lg:grid lg:grid-cols-[calc(var(--u)*558)_minmax(0,1fr)] lg:gap-[calc(var(--u)*24)]">
    <PlayerPanel />
    <PromoBanner />
  </div>
);

export default HomeHero;
