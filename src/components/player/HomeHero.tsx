import { useEffect, useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useWallet } from '@/context/WalletContext';
import { getRolloverSummary } from '@/services/rollover';
import WalletModal from '@/components/wallet/WalletModal';
import { ChevronRightIcon } from '@/components/icons';
import { fullNameOf } from '@/types/profile';
import type { RolloverSummary } from '@/types';
import walletGlyph from '@/assets/lobby/rail/bar-wallet.svg';
import defaultAvatar from '@/assets/lobby/player/avatar-default.webp';
import casinoArt from '@/assets/lobby/player/panel-casino.webp';
import sportsArt from '@/assets/lobby/player/panel-sports.webp';
import casinoMobile from '@/assets/lobby/player/panel-casino-mobile.webp';
import sportsMobile from '@/assets/lobby/player/panel-sports-mobile.webp';
import editPencil from '@/assets/lobby/player/edit-pencil.svg';
import promoArt from '@/assets/lobby/player/promo-banner.webp';
import promoArtMobile from '@/assets/lobby/player/promo-banner-mobile.webp';

const usd = (value: number, locale: string): string =>
  `$${value.toLocaleString(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const useWagering = (enabled: boolean): { rollover: RolloverSummary | null; loaded: boolean } => {
  const [rollover, setRollover] = useState<RolloverSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let active = true;
    getRolloverSummary()
      .then((res) => {
        if (active && res?.success && res.data) {
          setRollover(res.data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { rollover, loaded };
};

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
        ringed ? 'lg:h-[calc(var(--u)*85)] lg:w-[calc(var(--u)*85)] lg:ring-1 lg:ring-[#9da2b4]' : ''
      }`}
    >
      <img
        src={src}
        alt=""
        className="h-20 w-20 rounded-full bg-[#666666] object-cover lg:h-[calc(var(--u)*81)] lg:w-[calc(var(--u)*81)]"
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
 * render at 62px, 12 from the top — the design's own export of it, its glow
 * the 34px margin round it, hence the 130px frame hung 22 above the tile.
 */
const SectionTile: FC<{
  href: string;
  label: string;
  art: string;
  mark: string;
}> = ({ href, label, art, mark }) => (
  <Link
    href={href}
    className={`rl-liquid rl-diag-rim [--rim-radius:24px] lg:[--rim-radius:calc(var(--u)*24)] [--tw-inset-shadow:0_0_#0000]! group relative flex h-[110px] flex-1 flex-col items-center rounded-[24px] pt-[14px] transition-colors hover:bg-white/[0.11] lg:h-[calc(var(--u)*158)] lg:w-[calc(var(--u)*125)] lg:flex-none lg:rounded-[calc(var(--u)*24)] lg:pt-0`}
  >
    <img
      src={mark}
      alt=""
      className="pointer-events-none absolute left-1/2 top-[-22px] h-[130px] w-[130px] max-w-none -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-1 lg:hidden"
    />
    {/* The render carries its glow, so the image is the art plus a 34px
        margin of light on every side — hence the negative offset. */}
    <img
      src={art}
      alt=""
      className="absolute left-1/2 top-[calc(var(--u)*-18)] hidden h-[calc(var(--u)*169)] w-[calc(var(--u)*169)] max-w-none -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-1 lg:block"
    />
    <span className="mt-auto pb-3 text-[18px] leading-7 text-[#f0f1f5] lg:pb-[calc(var(--u)*16)] lg:text-[length:max(min(var(--tf,11px),18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
      {label}
    </span>
  </Link>
);

/**
 * The remaining amount as the design's odometer: a dollar cell and six glass
 * digit cells, each with a polished edge lit from below (`rl-odo-cell`), on a
 * dark plate with a thin slate rim, lit from behind.
 */
const Odometer: FC<{ value: number }> = ({ value }) => {
  const digits = String(Math.max(0, Math.round(value)))
    .padStart(6, '0')
    .slice(-6)
    .split('');
  // Cell widths and gaps land on whole pixels: at a scaled-down size the
  // design's 44 and 2 come out fractional, and cells sitting on different
  // sub-pixel offsets anti-alias differently, which reads as uneven spacing.
  // As drawn: the sign and the last digit 50 wide, the others 44; square
  // cells, but the two ends follow the plate's curve on their outer side.
  // The plate: a hairline slate rim (1px — a browser draws the design's 1.33
  // as 1 anyway, and rounds a scaled-down one up to 1), the cells centred in
  // it so the rounding never eats the space under them, 4 in from the start,
  // and the glass's light catching it along the bottom and end — a thin white
  // edge on the diagonal.
  const cell =
    'rl-odo-cell flex h-[calc(var(--u)*61)] items-center justify-center font-bold text-[#f0f1f5]';

  return (
    <div
      style={{ border: '0.1px solid #6a7287' }}
      className="flex h-[calc(var(--u)*68)] w-max items-center gap-[round(calc(var(--u)*2),1px)] rounded-[calc(var(--u)*10)] bg-[#14191c] pl-[calc(var(--u)*2.67)] pr-[calc(var(--u)*1.67)] shadow-[calc(var(--u)*0.75)_calc(var(--u)*0.75)_0_rgba(255,255,255,0.5),0_0_35px_rgba(255,255,255,0.2)]"
      aria-label={`$${value}`}
    >
      <span
        className={`${cell} w-[round(calc(var(--u)*50),1px)] rounded-l-[calc(var(--u)*7)] text-[length:max(min(var(--tf,11px),36px),calc(var(--u)*36))] leading-[calc(var(--u)*44)] tracking-[-0.02em]`}
      >
        $
      </span>
      {digits.map((d, i) => (
        <span
          // Positional digits: the index is their identity.
          key={i}
          className={`${cell} ${
            i === digits.length - 1
              ? 'w-[round(calc(var(--u)*50),1px)] rounded-r-[calc(var(--u)*7)]'
              : 'w-[round(calc(var(--u)*44),1px)]'
          } text-[length:max(min(var(--tf,11px),48px),calc(var(--u)*48))] leading-[calc(var(--u)*52)] tracking-[-0.02em]`}
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
    className="h-[17px] w-full rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.09))] shadow-[inset_0_1px_0_rgba(255,255,255,0.27),inset_0_-1px_0_rgba(255,255,255,0.09)]"
    role="progressbar"
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
  >
    <div
      className="h-full rounded-[34px] bg-[#d1ba3e] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.15),inset_-1px_0_0_rgba(255,255,255,0.2),0_1px_15.3px_rgba(249,208,40,0.8)]"
      style={{ width: `${percent}%` }}
    />
  </div>
);

/**
 * A pale pill under the progress: "$350 remaining to unlock your bonus".
 * On desktop it is sized off its own text (the design's 34 tall, 18 in, round
 * 12px type), as the percent badge is: on a short window the panel scales down
 * but its text stops at a readable floor, and a box drawn in the panel's unit
 * would then be too small for the words in it.
 */
const RemainingPill: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex h-[38px] items-center rounded-[24px] bg-white/10 px-[38px] text-[12px] leading-5 text-white lg:h-[2.833em] lg:rounded-full lg:px-[1.5em] lg:text-[length:max(calc(var(--tf,11px)*0.75),calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]">
    {children}
  </span>
);

const JourneyPrompt: FC<{ onDeposit: () => void }> = ({ onDeposit }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center lg:pt-[calc(var(--u)*4)]">
      <h2 className="text-[20px] font-semibold leading-7 text-white lg:text-[length:max(min(var(--tf,11px),28px),calc(var(--u)*28))] lg:leading-[calc(var(--u)*36)] lg:text-[#f0f1f5]">
        {t('dash.journeyTitle')}
      </h2>
      <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*12)] lg:max-w-[max(240px,calc(var(--u)*282))] lg:text-[length:max(min(var(--tf,11px),14px),calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
        {t('dash.journeyBody')}
      </p>
      <div className="mt-5 flex items-center gap-3 lg:mt-[calc(var(--u)*27)] lg:gap-[calc(var(--u)*12)]">
        <button
          type="button"
          onClick={onDeposit}
          className="rl-btn-gold inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-medium lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*5)] lg:px-[calc(var(--u)*18)] lg:text-[length:max(min(var(--tf,11px),18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
        >
          <img
            src={walletGlyph.src}
            alt=""
            className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
          />
          <span className="[text-box:trim-both_cap_alphabetic]">{t('dash.depositNow')}</span>
        </button>
        <Link
          href="/casino"
          className="rl-btn-ghost [--tw-inset-shadow:0_0_#0000] inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-full px-4 text-[13px] font-medium lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*6)] lg:bg-white/10 lg:ps-[calc(var(--u)*18)] lg:pe-[calc(var(--u)*14)] lg:text-[length:max(min(var(--tf,11px),12px),calc(var(--u)*12))] lg:font-normal lg:leading-[calc(var(--u)*20)]"
        >
          <span className="[text-box:trim-both_cap_alphabetic]">{t('dash.exploreGames')}</span>
          <ChevronRightIcon size={16} className="rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
};

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
  const { summary: wallet } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);

  const newPlayer = wallet?.has_deposited === false;
  const { rollover, loaded } = useWagering(!newPlayer);
  const required = Number(rollover?.total_required ?? 0);
  const wagered = Number(rollover?.total_completed ?? 0);
  const remaining = Number(rollover?.total_remaining ?? 0);
  const percent = Math.round(rollover?.progress ?? 0);

  return (
    <section className="rl-liquid before:hidden [--tw-inset-shadow:var(--hero-panel-rim)]! relative overflow-hidden rounded-[34px] lg:h-[calc(var(--u)*415)] lg:rounded-[calc(var(--u)*34)]">
      {/* --- Identity and tiles ----------------------------------------- */}
      <div className="flex flex-col items-center px-[15px] pt-5 lg:h-[calc(var(--u)*212)] lg:flex-row lg:items-start lg:justify-between lg:px-[calc(var(--u)*20)] lg:pl-[calc(var(--u)*18)] lg:pt-[calc(var(--u)*20)]">
        <div className="flex flex-col items-center gap-1.5 lg:mt-[calc(var(--u)*42)] lg:flex-row lg:gap-[calc(var(--u)*14)]">
          <Avatar ringed />
          {/* The profile's pencil sits 8 after the name; on a phone it hangs
              there so the name stays centred. */}
          <span className="relative flex max-w-full items-center">
            <span className="max-w-[calc(var(--u)*240)] truncate text-[18px] font-medium leading-7 text-white lg:max-w-[calc(var(--u)*140)] lg:text-[length:max(min(var(--tf,11px),18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
              {name}
            </span>
            <Link
              href="/profile"
              aria-label={t('nav.profile')}
              title={t('nav.profile')}
              className="absolute start-full ms-2 w-[18px] flex-shrink-0 opacity-90 transition-opacity hover:opacity-100 lg:static lg:ms-[calc(var(--u)*8)] lg:w-[calc(var(--u)*18)]"
            >
              <img
                src={editPencil.src}
                alt=""
                className="h-[18px] w-[18px] lg:h-[calc(var(--u)*18)] lg:w-[calc(var(--u)*18)]"
              />
            </Link>
          </span>
        </div>

        <div className="mt-4 flex w-full gap-[11px] lg:mt-0 lg:w-auto lg:gap-[calc(var(--u)*12)]">
          <SectionTile
            href="/casino"
            label={t('nav.casino')}
            art={casinoArt.src}
            mark={casinoMobile.src}
          />
          <SectionTile
            href="/sports"
            label={t('nav.sports')}
            art={sportsArt.src}
            mark={sportsMobile.src}
          />
        </div>
      </div>

      {/* --- Wagering --------------------------------------------------- */}
      <div className="mt-[15px] flex flex-col bg-white/[0.07] px-[15px] pb-[22px] pt-4 lg:absolute lg:inset-x-px lg:bottom-0 lg:mt-0 lg:h-[calc(var(--u)*203)] lg:rounded-b-[calc(var(--u)*34)] lg:border-t lg:border-white/[0.08] lg:bg-[#2c2c2c]/[0.26] lg:px-[calc(var(--u)*20)] lg:pb-0 lg:pt-[calc(var(--u)*16)]">
        {newPlayer ? (
          <JourneyPrompt onDeposit={() => setWalletOpen(true)} />
        ) : (
          <div className={`flex flex-col transition-opacity ${loaded ? '' : 'opacity-0'}`}>
            {/* The small print here keeps the design's proportions to the 16px
            heading when the panel is scaled down: its floor is the heading's
            floor in the same ratio (10/16, 12/16), not the shared one, so the
            badge and the line beside it never outgrow the heading. */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-[calc(var(--u)*4)]">
                <span className="text-[16px] font-medium leading-6 text-white lg:text-[length:max(min(var(--tf,11px),16px),calc(var(--u)*16))] lg:font-normal lg:leading-[calc(var(--u)*24)]">
                  {t('dash.wageringProgress')}
                </span>
                <span className="hidden items-center rounded-full border border-[#03b739] bg-[#03b739]/10 px-[0.5em] text-[length:max(calc(var(--tf,11px)*0.625),calc(var(--u)*10))] leading-[calc(1.6em-2px)] text-[#03b739] lg:inline-flex">
                  {percent}%
                </span>
              </span>
              <span className="text-[12px] font-medium leading-5 text-white lg:hidden">
                {t('dash.percentComplete', { percent })}
              </span>
              <span className="hidden text-[length:max(calc(var(--tf,11px)*0.75),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4] lg:block">
                {t('dash.wagered', { amount: usd(wagered, locale) })}
              </span>
            </div>

            {/* Phone: the bar, with its ends and the amount so far. */}
            <div className="mt-[15px] lg:hidden">
              <ProgressBar percent={percent} label={t('dash.wageringProgress')} />
              <div className="mt-[14px] flex items-center justify-between text-[12px] leading-[22px] text-[#9da2b4]">
                <span>{usd(0, locale)}</span>
                <span className="text-[14px] font-medium text-white">
                  {t('dash.wageredShort', { amount: usd(wagered, locale) })}
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
              <Odometer value={Math.ceil(remaining)} />
              <RemainingPill>{t('dash.remainingToUnlockShort')}</RemainingPill>
            </div>
          </div>
        )}
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
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
const PromoBanner: FC = () => {
  const { t } = useTranslation();

  return (
    <Link
      href="/promotions"
      aria-label={t('menu.promotions')}
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
};

/* ==================================================================== */
/* The hero                                                              */
/* ==================================================================== */

/**
 * The signed-in lobby's hero: the player panel and the promotion beside it —
 * 558 and 966 of the design's 1548px — stacked on a phone.
 */
const HomeHero: FC = () => {
  const { promotions: promotionsOn } = usePlatformFeatures();

  return (
    <div className="flex flex-col gap-[15px] lg:grid lg:grid-cols-[calc(var(--u)*558)_minmax(0,1fr)] lg:gap-[calc(var(--u)*24)]">
      <PlayerPanel />
      {promotionsOn && <PromoBanner />}
    </div>
  );
};

export default HomeHero;
