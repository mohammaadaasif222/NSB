import { useState, type CSSProperties, type FC, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { toast } from 'react-toastify';

import backdrop from '@/assets/home-backdrop.webp';
import backdropMobile from '@/assets/home-backdrop-mobile.webp';
import casinoRoulette from '@/assets/casino-roulette.webp';
import casinoDice from '@/assets/casino-dice.webp';
import sportsFootball from '@/assets/sports-football.webp';
import sportsTrophy from '@/assets/sports-trophy.webp';
import casinoChip from '@/assets/casino-chip-mobile.webp';
import sportsBall from '@/assets/sports-ball-mobile.webp';
import gmailIcon from '@/assets/lobby/gmail.svg';
import mailIcon from '@/assets/lobby/mail.svg';
import telegramIcon from '@/assets/lobby/telegram.svg';
import facebookIcon from '@/assets/lobby/facebook.svg';
import whatsappIcon from '@/assets/lobby/whatsapp.svg';
import chevronDown from '@/assets/lobby/chevron-down.svg';
import starIcon from '@/assets/lobby/star.svg';
import trustPrivacy from '@/assets/lobby/trust-privacy.svg';
import trustFair from '@/assets/lobby/trust-fair.svg';
import trustBolt from '@/assets/lobby/trust-bolt.svg';

import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import BonusBanner from '@/components/player/BonusBanner';
import { DIAL_CODES, MOBILE_PATTERN } from '@/constants/auth';
import { LOBBY_STATS } from '@/constants/stats';

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
    <Image src={backdrop} alt="" priority sizes="100vw" className="hidden h-auto w-full lg:block" />
    <Image
      src={backdropMobile}
      alt=""
      priority
      sizes="100vw"
      className="-mt-[11.2vw] h-auto w-full lg:hidden"
    />
  </div>
);

/* ==================================================================== */
/* Live figures                                                          */
/* ==================================================================== */

/** The pulsing-dot "N Online" pill, top-left of the desktop hero. */
const OnlinePill: FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex h-[calc(var(--u)*35)] items-center gap-[calc(var(--u)*6)] rounded-full border border-[#252937] bg-[#1b1f29] pl-[calc(var(--u)*13)] pr-[calc(var(--u)*10)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-white">
    <span
      className="relative flex h-[calc(var(--u)*18)] w-[calc(var(--u)*18)] items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#f0f1f5]/20" />
      <span className="absolute inset-0 rounded-full bg-[#f0f1f5]/20" />
      <span className="h-[calc(var(--u)*10)] w-[calc(var(--u)*10)] rounded-full bg-[#f0f1f5]" />
    </span>
    {label}
  </span>
);

/** One of the phone's three figure pills. */
const StatPill: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex h-[calc(var(--u)*28)] items-center whitespace-nowrap rounded-full bg-white/10 px-[calc(var(--u)*8)] text-[length:max(min(11px,10px),calc(var(--u)*10))] leading-[calc(var(--u)*13)] text-white">
    {children}
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
    className="flex h-[calc(var(--u)*76)] flex-col items-center justify-center gap-[calc(var(--u)*8)] rounded-[calc(var(--u)*24)] bg-[#13171f] px-[calc(var(--u)*8)] transition-colors hover:bg-[#1a1f29] disabled:opacity-60 lg:h-[calc(var(--u)*99)] lg:rounded-[calc(var(--u)*34)]"
  >
    <img src={icon.src} alt="" className="h-[calc(var(--u)*30)] w-[calc(var(--u)*30)]" />
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
    className={`relative flex h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] items-center justify-center rounded-full border border-white/10 bg-[#1e1f22]/80 backdrop-blur-md transition-transform hover:z-10 hover:-translate-y-0.5 ${
      first ? '' : '-ms-[calc(var(--u)*12)]'
    }`}
  >
    <img src={icon.src} alt="" className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]" />
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
const SignupTeaser: FC = () => {
  const { openRegister } = useAuthModal();
  const { t } = useTranslation();
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
      <span className="-mb-[calc(var(--u)*4)] flex h-[calc(var(--u)*42)] items-start rounded-t-[calc(var(--u)*10)] border border-b-0 border-[#252937] bg-[#07080a] px-[calc(var(--u)*15)] pt-[calc(var(--u)*9)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#f0f1f5]">
        {t('registerModal.registeredToday', { count: LOBBY_STATS.registeredToday })}
      </span>

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
              aria-label="Country calling code"
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
            placeholder="Enter mobile number"
            className="h-full min-w-0 flex-1 bg-transparent pl-[calc(var(--u)*19)] pr-[calc(var(--u)*20)] text-[length:max(min(11px,18px),calc(var(--u)*18))] leading-[calc(var(--u)*24)] text-[#f0f1f5] outline-none placeholder:text-[#9da2b4] lg:placeholder:text-[#464e61]"
          />
          <button type="submit" className="sr-only">
            {t('account.register')}
          </button>
        </label>
      </form>

      <div className="mt-[calc(var(--u)*13)] grid w-full grid-cols-2 gap-[calc(var(--u)*8)] lg:gap-[calc(var(--u)*10)]">
        <ProviderButton
          icon={gmailIcon}
          label={`Continue with ${t('auth.methodGmail')}`}
          onClick={() => google.signIn()}
          disabled={google.loading}
        />
        {/* The design draws an envelope here: the e-mail signup flow, not a
            second Google button. */}
        <ProviderButton
          icon={mailIcon}
          label="Continue with Email"
          onClick={() => openRegister({ method: 'email' })}
        />
      </div>

      <div className="mt-[calc(var(--u)*15)] flex items-center lg:mt-[calc(var(--u)*22)]">
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
          onClick={() => openRegister()}
          className="ms-[calc(var(--u)*15)] text-[length:max(min(11px,16px),calc(var(--u)*16))] font-medium leading-[calc(var(--u)*24)] text-[#9da2b4] transition-colors hover:text-white lg:text-[#6a7287]"
        >
          more option
        </button>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* Section cards                                                         */
/* ==================================================================== */

interface CardArt {
  /** Desktop: the two 3D renders, placed as the design places them on its 764×152 card. */
  hero: { src: StaticImageData; box: [x: number, y: number, w: number] };
  accent: { src: StaticImageData; box: [x: number, y: number, w: number] };
  /** Phone: the neon line-art mark, its glow baked in, hung off the right edge. */
  mark: { src: StaticImageData; className: string };
}

const CASINO_ART: CardArt = {
  hero: { src: casinoRoulette, box: [449, -3, 315.5] },
  accent: { src: casinoDice, box: [372, -52, 171.2] },
  mark: {
    src: casinoChip,
    className: '-right-[calc(var(--u)*48)] -top-[calc(var(--u)*18)] w-[calc(var(--u)*149)]',
  },
};

const SPORTS_ART: CardArt = {
  hero: { src: sportsFootball, box: [510, 1, 252.5] },
  accent: { src: sportsTrophy, box: [442, -48, 150.8] },
  mark: {
    src: sportsBall,
    className: '-right-[calc(var(--u)*45)] -top-[calc(var(--u)*26)] w-[calc(var(--u)*152)]',
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
  subtitle: string;
  art: CardArt;
}> = ({ href, title, subtitle, art }) => (
  <Link
    href={href}
    className="group @container relative block h-[calc(var(--u)*72)] overflow-hidden rounded-[calc(var(--u)*16)] bg-white/[0.07] backdrop-blur-md transition-colors hover:bg-white/[0.1] lg:rl-liquid lg:aspect-[764/152] lg:h-auto lg:rounded-[calc(var(--u)*34)]"
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
        sizes="320px"
        className="absolute h-auto max-w-none"
        style={placed(art.hero.box)}
      />
    </span>

    <span className="relative block px-[calc(var(--u)*16)] pt-[calc(var(--u)*10)] lg:px-[4.06cqw] lg:pt-[2.49cqw]">
      <span className="block text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*24)] text-white lg:text-[max(20px,4.19cqw)] lg:font-bold lg:leading-[1.25] lg:tracking-[-0.02em] lg:text-[#f2f5f9]">
        {title}
      </span>
      <span className="mt-[0.4cqw] hidden text-[max(12px,2.09cqw)] leading-[1.5] text-[#7c8799] lg:block">
        {subtitle}
      </span>
    </span>
  </Link>
);

/* ==================================================================== */
/* The hero                                                              */
/* ==================================================================== */

const TRUST: { icon: StaticImageData; label: string }[] = [
  { icon: trustPrivacy, label: 'Complete Privacy' },
  { icon: trustFair, label: 'Provably Fair' },
  { icon: trustBolt, label: 'Instant Withdrawals' },
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
const LandingHero: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="lg:pt-[calc(var(--u)*22)]">
      {/* --- Live figures --------------------------------------------- */}
      {/* 8px under the phone bar: the layout's 12px top padding, less 4. */}
      <div className="-mt-1 flex flex-wrap items-center justify-center gap-[calc(var(--u)*5)] lg:hidden">
        <StatPill>{LOBBY_STATS.todaysWinnings} Today&apos;s Winnings</StatPill>
        <StatPill>{t('dash.online', { count: LOBBY_STATS.online })}</StatPill>
        <StatPill>{LOBBY_STATS.biggestWin} Biggest Win</StatPill>
      </div>

      <div className="hidden items-center justify-between gap-[calc(var(--u)*12)] lg:flex">
        <OnlinePill label={t('dash.online', { count: LOBBY_STATS.online })} />
        <span className="inline-flex items-center gap-[calc(var(--u)*9)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]">
          <span>{LOBBY_STATS.todaysWinnings} Today&apos;s Winnings</span>
          <img src={starIcon.src} alt="" className="h-[calc(var(--u)*18)] w-[calc(var(--u)*18)]" />
          <span>{LOBBY_STATS.biggestWin} Biggest Win</span>
        </span>
      </div>

      {/* --- Headline and sign-up -------------------------------------- */}
      <div className="flex flex-col items-center text-center">
        <h1 className="mt-[calc(var(--u)*13)] max-w-[calc(var(--u)*355)] text-[length:max(min(11px,28px),calc(var(--u)*28))] font-bold leading-[calc(var(--u)*36)] tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*21)] lg:max-w-none lg:text-[length:max(min(11px,48px),calc(var(--u)*48))] lg:font-semibold lg:leading-[calc(var(--u)*52)]">
          Rolluck — Where Trust Meets
          <br className="hidden lg:block" /> Premium Gaming
        </h1>

        <div className="mt-[calc(var(--u)*12)] flex w-full justify-center lg:mt-[calc(var(--u)*25)]">
          <SignupTeaser />
        </div>

        <div className="mt-[calc(var(--u)*40)] hidden items-center justify-center gap-[calc(var(--u)*24)] lg:flex">
          {TRUST.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-[calc(var(--u)*6)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#6a7287]"
            >
              <img src={icon.src} alt="" className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)]" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* --- Shortcuts and the welcome offer ---------------------------- */}
      <div className="mt-[calc(var(--u)*20)] flex flex-col gap-[calc(var(--u)*12)] lg:mt-[calc(var(--u)*46)] lg:gap-[calc(var(--u)*80)]">
        <div className="order-2 grid grid-cols-2 gap-[calc(var(--u)*12)] lg:order-1 lg:gap-[calc(var(--u)*20)]">
          <SectionCard
            href="/casino"
            title={t('nav.casino')}
            subtitle="Slots, live tables and 12 Rolluck Originals"
            art={CASINO_ART}
          />
          <SectionCard
            href="/sports"
            title={t('nav.sports')}
            subtitle="Football, Tennis, Basketball and 12 other sports"
            art={SPORTS_ART}
          />
        </div>
        <BonusBanner className="order-1 lg:order-2" />
      </div>
    </section>
  );
};

export default LandingHero;
