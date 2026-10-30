import { useState, type CSSProperties, type FC, type FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image, { getImageProps, type StaticImageData } from 'next/image';
import { toast } from 'react-toastify';

import backdrop from '@/assets/home-backdrop.webp';
import backdropMobile from '@/assets/home-backdrop-mobile.webp';
import casinoDice from '@/assets/casino-dice.webp';
import sportsTrophy from '@/assets/sports-trophy.webp';
import casinoRoulette from '@/assets/casino-roulette-mobile.webp';
import sportsBall from '@/assets/sports-ball-glass-mobile.webp';
import gmailIcon from '@/assets/lobby/gmail.svg';
import mailIcon from '@/assets/lobby/mail.svg';
import telegramIcon from '@/assets/lobby/telegram.svg';
import facebookIcon from '@/assets/lobby/facebook.svg';
import whatsappIcon from '@/assets/lobby/whatsapp.svg';
import chevronDown from '@/assets/lobby/chevron-down.svg';
import trustPrivacy from '@/assets/lobby/trust-privacy.svg';
import trustFair from '@/assets/lobby/trust-fair.svg';
import trustBolt from '@/assets/lobby/trust-bolt.svg';

import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import BonusBanner from '@/components/player/BonusBanner';
import { WinnersRow } from '@/components/player/TopWinnersTicker';
import { DIAL_CODES, MOBILE_PATTERN } from '@/constants/auth';
import { SECTION_ART } from '@/constants/cdn';
import { LOBBY_STATS } from '@/constants/stats';
import { useRegisteredTodayLabel } from '@/hooks/useRegisteredToday';
import type { TranslationKey } from '@/i18n/locales';

/* ==================================================================== */
/* Backdrop                                                              */
/* ==================================================================== */

/**
 * The lobby artwork, painted behind the whole top of the page.
 *
 * Handed to PlayerLayout rather than drawn inside the hero, so the bar and the
 * rail float over it too. Both are the design's own renders, fade to the stage
 * colour included: the desktop one full-bleed from the top edge, the phone one
 * — a faint wash, as the design keeps it — starting just above it.
 */
export const LandingBackdrop: FC = () => (
  <div className="relative">
    {/* The design's ambient glows: soft grey light pooling behind the left of
        the hero and off the top-right corner, which is what lifts the glass
        cards there off the stage. Measured from the design at 1920px, so
        placed in vw to keep their spot at any desktop width. */}
    <div
      className="absolute inset-x-0 top-0 hidden h-[95vw] lg:block"
      style={{
        background:
          'radial-gradient(circle 47vw at 18vw 41.8vw, rgba(217,217,217,0.13), rgba(217,217,217,0.07) 40%, rgba(217,217,217,0.02) 72%, transparent), radial-gradient(circle 40vw at 94vw 8vw, rgba(217,217,217,0.06), transparent 70%)',
      }}
    />
    <BackdropPicture />
  </div>
);

const DESKTOP_MEDIA = '(min-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 1023.98px)';
const HIGH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>;

const BackdropPicture: FC = () => {
  const { props: desktop } = getImageProps({ src: backdrop, alt: '', sizes: '100vw' });
  const {
    props: { fetchPriority: _unused, ...mobile },
  } = getImageProps({ src: backdropMobile, alt: '', sizes: '100vw' });

  return (
    <>
      <Head>
        <link
          key="backdrop-preload-desktop"
          rel="preload"
          as="image"
          imageSrcSet={desktop.srcSet}
          imageSizes="100vw"
          media={DESKTOP_MEDIA}
          {...HIGH_PRIORITY}
        />
        <link
          key="backdrop-preload-mobile"
          rel="preload"
          as="image"
          imageSrcSet={mobile.srcSet}
          imageSizes="100vw"
          media={MOBILE_MEDIA}
          {...HIGH_PRIORITY}
        />
      </Head>
      <picture>
        <source
          media={DESKTOP_MEDIA}
          srcSet={desktop.srcSet}
          sizes="100vw"
          width={desktop.width}
          height={desktop.height}
        />
        <img
          {...mobile}
          alt=""
          loading="eager"
          {...HIGH_PRIORITY}
          className="-mt-[11.2vw] h-auto w-full lg:mt-0"
        />
      </picture>
    </>
  );
};

/* ==================================================================== */
/* Live figures                                                          */
/* ==================================================================== */

/** The pulsing-dot "N Online" pill, top-left of the desktop hero. */
const OnlinePill: FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex h-[calc(var(--u)*35)] items-center gap-[calc(var(--u)*6)] rounded-full border border-[#252937] bg-[#1b1f29] pl-[calc(var(--u)*13)] pr-[calc(var(--u)*10)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-white">
    <span
      className="relative h-[calc(var(--u)*18)] w-[calc(var(--u)*18)] flex-shrink-0"
      aria-hidden="true"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#f0f1f5]/20" />
      <span className="absolute inset-0 rounded-full bg-[#f0f1f5]/20" />
      <span className="absolute left-1/2 top-1/2 h-[calc(var(--u)*10)] w-[calc(var(--u)*10)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0f1f5]" />
    </span>
    {label}
  </span>
);

/* ==================================================================== */
/* Sign-up teaser                                                        */
/* ==================================================================== */

/** One of the two big provider buttons: mark on top, label beneath. */
const ProviderButton: FC<{
  icon: StaticImageData;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex h-[calc(var(--u)*64)] flex-col items-center justify-center rounded-[calc(var(--u)*34)] bg-[#13171f] px-[calc(var(--u)*8)] transition-colors hover:bg-[#1a1f29] disabled:opacity-60 lg:h-[calc(var(--u)*99)] lg:gap-[calc(var(--u)*8)]"
  >
    <img
      src={icon.src}
      alt=""
      className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] lg:h-[calc(var(--u)*30)] lg:w-[calc(var(--u)*30)]"
    />
    <span className="text-[length:max(min(11px,12px),calc(var(--u)*12))] font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)] lg:text-white">
      {label}
    </span>
  </button>
);

/**
 * A disc in the overlapping row of quick sign-in marks: the design's small
 * dark glass, each one tucked 12px under the one before it.
 */
const SocialDisc: FC<{
  icon: StaticImageData;
  label: string;
  onClick: () => void;
  first?: boolean;
}> = ({ icon, label, onClick, first }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`rl-glass-btn relative flex h-[calc(var(--u)*40)] w-[calc(var(--u)*40)] items-center justify-center rounded-full transition-[transform,filter] [--rl-btn-base:#121317] hover:z-10 hover:-translate-y-0.5 lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] ${first ? '' : '-ms-[calc(var(--u)*14.5)] lg:-ms-[calc(var(--u)*12)]'
      }`}
  >
    <img
      src={icon.src}
      alt=""
      className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)] lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
    />
  </button>
);

/**
 * The signed-out call to action: a mobile number straight into signup, with
 * the provider shortcuts beneath it.
 *
 * The form does not register anybody here — it opens the register modal on
 * its mobile form with the number already filled in, so validation, the OTP
 * step and the rest of signup live in one place.
 */
const SignupTeaser: FC<{ registeredToday: number | null }> = ({ registeredToday }) => {
  const { openRegister } = useAuthModal();
  const { t } = useTranslation();
  const registeredLabel = useRegisteredTodayLabel(registeredToday);
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();

  const [dial, setDial] = useState(DIAL_CODES[0].code);
  const [mobile, setMobile] = useState('');

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, '');
    if (!MOBILE_PATTERN.test(digits)) {
      toast.error(t('registerModal.errMobile'));
      return;
    }
    openRegister({ mobile: digits, dialCode: dial });
  };

  const soon = (method: string): void => {
    toast.info(t('auth.methodSoon', { method }));
  };

  return (
    <div className="flex w-full max-w-[calc(var(--u)*346)] flex-col items-center lg:max-w-[calc(var(--u)*435)]">
      {/* A tab resting on the field's top edge, its foot tucked under it. */}
      {registeredLabel && (
        <span className="-mb-[calc(var(--u)*4)] flex h-[calc(var(--u)*37)] items-start rounded-t-[calc(var(--u)*10)] border border-b-0 border-[#252937] bg-[#07080a] px-[calc(var(--u)*11)] pt-[calc(var(--u)*7)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#f0f1f5] lg:h-[calc(var(--u)*42)] lg:px-[calc(var(--u)*15)] lg:pt-[calc(var(--u)*9)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))]">
          {registeredLabel}
        </span>
      )}

      <form onSubmit={submit} className="relative w-full">
        <label
          className="rl-liquid flex h-[calc(var(--u)*56)] items-center rounded-[calc(var(--u)*34)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          htmlFor="hero-mobile"
        >
          {/* The visible code and chevron are drawn here, with the native
              select laid invisibly over them: a bare select is as wide as
              its longest option, which pushed the field's text away. */}
          <span className="relative flex h-full flex-shrink-0 items-center gap-[calc(var(--u)*9)] pl-[calc(var(--u)*21)] text-[length:max(min(11px,18px),calc(var(--u)*18))] font-bold leading-[calc(var(--u)*24)] text-[#f0f1f5]">
            {dial}
            <img
              src={chevronDown.src}
              alt=""
              className="pointer-events-none h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
            />
            <select
              value={dial}
              onChange={(e) => setDial(e.target.value)}
              aria-label={t('lobby.hero.dialCode')}
              className="absolute inset-0 cursor-pointer appearance-none opacity-0 [&>option]:bg-[#14161b] [&>option]:text-white"
            >
              {DIAL_CODES.map((d) => (
                <option key={d.iso} value={d.code}>
                  {d.code}
                </option>
              ))}
            </select>
          </span>
          <input
            id="hero-mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder={t('registerModal.mobilePlaceholder')}
            className="h-full min-w-0 flex-1 bg-transparent pl-[calc(var(--u)*19)] pr-[calc(var(--u)*20)] text-[length:max(min(11px,18px),calc(var(--u)*18))] leading-[calc(var(--u)*24)] text-[#f0f1f5] outline-none placeholder:text-[#9da2b4] lg:placeholder:text-[#464e61]"
          />
          <button type="submit" className="sr-only">
            {t('account.register')}
          </button>
        </label>
      </form>

      <div className="mt-[calc(var(--u)*20)] grid w-full grid-cols-2 gap-[calc(var(--u)*20)] lg:mt-[calc(var(--u)*13)] lg:gap-[calc(var(--u)*10)]">
        <ProviderButton
          icon={gmailIcon}
          label={t('lobby.hero.continueWith', { method: t('auth.methodGmail') })}
          onClick={() => google.signIn()}
          disabled={google.loading}
        />
        {/* The design draws an envelope here: the e-mail signup flow, not a
            second Google button. */}
        <ProviderButton
          icon={mailIcon}
          label={t('lobby.hero.continueWithEmail')}
          onClick={() => openRegister({ method: 'email' })}
        />
      </div>

      <div className="mt-[calc(var(--u)*20)] flex items-center lg:mt-[calc(var(--u)*22)]">
        <SocialDisc
          icon={telegramIcon}
          label={t('auth.methodTelegram')}
          onClick={() => telegram.signIn()}
          first
        />
        <SocialDisc icon={facebookIcon} label="Facebook" onClick={() => soon('Facebook')} />
        <SocialDisc icon={whatsappIcon} label="WhatsApp" onClick={() => soon('WhatsApp')} />
        <button
          type="button"
          onClick={() => openRegister({ social: true })}
          className="ms-[calc(var(--u)*7)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4] transition-colors hover:text-white lg:ms-[calc(var(--u)*15)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:font-medium lg:leading-[calc(var(--u)*24)] lg:text-[#6a7287]"
        >
          {t('lobby.hero.moreOptions')}
        </button>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* Section cards                                                         */
/* ==================================================================== */

interface CardArt {
  /**
   * Desktop: the two 3D renders, placed as the design places them on its
   * 764×152 card.
   *
   * Each box is measured against its own transparent artwork, so changing an
   * image means measuring its placement again.
   */
  hero: { src: StaticImageData; box: [x: number, y: number, w: number] };
  accent: { src: StaticImageData; box: [x: number, y: number, w: number] };
  /**
   * Phone: the 3D render on the 190×72 card — the design's own frame of it,
   * crop and coloured glow included, exported at 3× and placed where the
   * design places that frame (the card clips what hangs over). Its start and
   * top edges fade out, so the glow has no hard edge where the frame ends.
   * Hung off the card's end, not its start, so on a tablet's wider card the
   * render stays at the end instead of drifting under the title.
   */
  mark: { src: StaticImageData; className: string };
}

const CASINO_ART: CardArt = {
  hero: { src: SECTION_ART.casino, box: [466, 12, 273] },
  accent: { src: casinoDice, box: [372, -52, 171.2] },
  mark: {
    src: casinoRoulette,
    className:
      '-right-[calc(var(--u)*17)] -top-[calc(var(--u)*12)] w-[calc(var(--u)*119)] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_10%),linear-gradient(to_bottom,transparent,#000_10%)]',
  },
};

const SPORTS_ART: CardArt = {
  hero: { src: SECTION_ART.sportsbook, box: [542, 15, 191] },
  accent: { src: sportsTrophy, box: [442, -48, 150.8] },
  mark: {
    src: sportsBall,
    className:
      '-right-[calc(var(--u)*15)] top-[calc(var(--u)*4)] w-[calc(var(--u)*88)] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_10%),linear-gradient(to_bottom,transparent,#000_10%)]',
  },
};

/** A render placed in `cqw` of the design's 764px card, so it scales with the card. */
const placed = ([x, y, w]: [number, number, number]): CSSProperties => ({
  left: `${(x / 764) * 100}cqw`,
  top: `${(y / 764) * 100}cqw`,
  width: `${(w / 764) * 100}cqw`,
});

/**
 * A section shortcut. On a phone it is the design's small 72px tile with the
 * neon mark; from lg up it is the design's 764×152 glass card with the 3D
 * renders. That card keeps its shape and is laid out entirely in units of its
 * own width — height, padding, type and art together — so on a narrower
 * column it is the same card scaled down rather than a taller one with the
 * art crowding the copy.
 */
const SectionCard: FC<{
  href: string;
  title: string;
  subtitle?: string;
  art: CardArt;
}> = ({ href, title, subtitle, art }) => (
  <Link
    href={href}
    className="rl-liquid-glow group @container relative block h-[calc(var(--u)*72)] overflow-hidden rounded-[calc(var(--u)*16)] transition-colors hover:bg-white/[0.1] lg:aspect-[764/152] lg:h-auto lg:rounded-[calc(var(--u)*34)]"
  >
    {/* Phone */}
    <Image
      src={art.mark.src}
      alt=""
      sizes="150px"
      className={`pointer-events-none absolute h-auto max-w-none lg:hidden ${art.mark.className}`}
    />
    {/* Desktop */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden transition-transform duration-300 group-hover:scale-[1.02] lg:block"
    >
      <Image
        src={art.accent.src}
        alt=""
        sizes="180px"
        className="absolute h-auto max-w-none"
        style={placed(art.accent.box)}
      />
      <Image
        src={art.hero.src}
        alt=""
        sizes="480px"
        className="absolute h-auto max-w-none"
        style={placed(art.hero.box)}
      />
    </span>

    <span className={`relative flex  px-[calc(var(--u)*16)]  lg:px-[4.06cqw] 
    ${subtitle
        ? "block pt-[calc(var(--u)*10)] lg:pt-[2.49cqw]"
        : "h-full items-center"
      }`}>
      <span className="block text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*24)] text-white lg:text-[max(20px,4.19cqw)] lg:font-bold lg:leading-[1.25] lg:tracking-[-0.02em] lg:text-[#f2f5f9]">
        {title}
      </span>
      {subtitle && (
        <span className="mt-[0.4cqw] hidden text-[max(12px,2.09cqw)] leading-[1.5] text-[#7c8799] lg:block">
          {subtitle}
        </span>
      )}
    </span>
  </Link>
);

/* ==================================================================== */
/* The hero                                                              */
/* ==================================================================== */

const TRUST: { icon: StaticImageData; label: TranslationKey }[] = [
  { icon: trustPrivacy, label: 'lobby.hero.trustPrivacy' },
  { icon: trustFair, label: 'lobby.hero.trustFair' },
  { icon: trustBolt, label: 'lobby.hero.trustWithdrawals' },
];

/**
 * The signed-out lobby hero.
 *
 * Transparent: the artwork behind it is the page's backdrop (LandingBackdrop,
 * passed to PlayerLayout), so this section is only the content that floats on
 * it — the live figures, the sign-up teaser on the midline, the two section
 * shortcuts and the welcome offer. Signed-in players get the dashboard panel
 * and promo slider instead — see HomeHero.
 *
 * The phone and desktop designs order the foot differently: the offer comes
 * before the shortcuts on a phone and after them on desktop, so the two swap
 * with `order` rather than being rendered twice.
 *
 * Vertical rhythm is set with explicit margins rather than centring in a
 * fixed height, so each gap can match the design independently.
 */
const LandingHero: FC<{ registeredToday: number | null }> = ({ registeredToday }) => {
  const { t } = useTranslation();

  return (
    <section className="lg:pt-[calc(var(--u)*22)]">
      {/* --- Live figures --------------------------------------------- */}
      {/* The phone's: the winners 20 under the bar (the layout's 12px top
          padding and 8 more); the headline follows 44 under them. */}
      <div className="mt-2 lg:hidden">
        <WinnersRow />
      </div>

      <div className="hidden items-center justify-between gap-[calc(var(--u)*12)] lg:flex">
        <OnlinePill label={t('dash.online', { count: LOBBY_STATS.online })} />
        {/* <span className="inline-flex items-center gap-[calc(var(--u)*9)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]">
          <span>{t('lobby.hero.todaysWinnings', { amount: LOBBY_STATS.todaysWinnings })}</span>
          <img src={starIcon.src} alt="" className="h-[calc(var(--u)*18)] w-[calc(var(--u)*18)]" />
          <span>{t('lobby.hero.biggestWin', { amount: LOBBY_STATS.biggestWin })}</span>
        </span> */}
      </div>

      {/* --- Headline and sign-up -------------------------------------- */}
      <div className="flex flex-col items-center text-center">
        <h1 className="mt-[calc(var(--u)*44)] max-w-[calc(var(--u)*300)] text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*21)] lg:max-w-none lg:text-[length:max(min(11px,48px),calc(var(--u)*48))] lg:whitespace-pre-line lg:font-semibold lg:leading-[calc(var(--u)*52)]">
          {/* Desktop breaks the title where the copy does; a phone wraps it. */}
          {t('lobby.hero.title')}
        </h1>

        <div className="mt-[calc(var(--u)*22)] flex w-full justify-center lg:mt-[calc(var(--u)*25)]">
          <SignupTeaser registeredToday={registeredToday} />
        </div>

        <div className="mt-[calc(var(--u)*40)] hidden items-center justify-center gap-[calc(var(--u)*24)] lg:flex">
          {TRUST.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-[calc(var(--u)*6)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#6a7287]"
            >
              <img src={icon.src} alt="" className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)]" />
              {t(label)}
            </span>
          ))}
        </div>
      </div>

      {/* --- Shortcuts and the welcome offer ---------------------------- */}
      <div className="mt-[calc(var(--u)*48)] flex flex-col gap-[calc(var(--u)*18)] lg:mt-[calc(var(--u)*46)] lg:gap-[calc(var(--u)*80)]">
        <div className="order-2 grid grid-cols-2 gap-[calc(var(--u)*8)] lg:order-1 lg:gap-[calc(var(--u)*20)]">
          <SectionCard
            href="/casino"
            title={t('nav.casino')}
            // subtitle={t('lobby.hero.casinoSubtitle')}
            art={CASINO_ART}
          />
          <SectionCard
            href="/sports"
            title={t('nav.sports')}
            // subtitle={t('lobby.hero.sportsSubtitle')}
            art={SPORTS_ART}
          />
        </div>
        <BonusBanner className="order-1 lg:order-2" />
      </div>
    </section>
  );
};

export default LandingHero;
