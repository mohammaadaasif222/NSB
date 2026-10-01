import { useState, type FC, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import homeBg from '@/assets/home-bg.png';
import casinoArt from '@/assets/casino-home.png';
import sportsArt from '@/assets/sports-home.png';

import { useTranslation } from '@/context/I18nContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { FacebookMark, GmailMark, TelegramMark, WhatsappMark } from '@/components/brand';
import { MailIcon, ScaleIcon, ShieldIcon, SparklesIcon, ZapIcon } from '@/components/icons';

/**
 * Headline figures on the hero.
 *
 * There is no stats endpoint yet — no live player count, no house totals — so
 * these are illustrative, in the same spirit as the winners strip in the bar.
 * Every number the hero prints comes from this one object, so swapping it for
 * a real payload is the whole of the change once an endpoint exists.
 */
const STATS = {
  online: '1,625',
  registeredToday: '1.2K',
  todaysWinnings: '$3.8M',
  biggestWin: '$250K',
};

/** Dial codes offered by the teaser form. The full list lives on /auth/register. */
const DIAL_CODES = ['+1', '+44', '+91', '+61', '+49', '+33', '+55', '+971'];

/* ==================================================================== */
/* Backdrop                                                              */
/* ==================================================================== */

/**
 * The lobby artwork, painted behind the whole top of the page.
 *
 * Handed to PlayerLayout rather than drawn inside the hero, so the bar and the
 * rail float over it too. On desktop it starts just inside the rail's right
 * edge — reading `--rail`, which the layout sets, so it follows a collapse —
 * which is where the design puts the ROLLUCK sign: fully in view beside the
 * rail, with the slot wall running off the right. Its left edge fades out under
 * the rail and its foot fades into the stage, so neither shows as a seam.
 *
 * Two nested masks rather than one element with two mask layers: compositing
 * mask layers needs `mask-composite`, whose WebKit spelling takes different
 * keywords, and nesting sidesteps that entirely.
 */
export const LandingBackdrop: FC = () => (
  <div className="relative h-[760px] overflow-hidden lg:h-[770px]">
    <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]">
      <div className="absolute inset-y-0 left-0 right-0 lg:[mask-image:linear-gradient(to_right,transparent,#000_40px)]">
        <Image
          src={homeBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-top lg:object-left-top"
        />
        {/* Knock the art back so the chrome and copy over it stay the brightest
            things on the page, then deepen the middle where the form sits. */}
        <div className="absolute inset-0 bg-[#06070a]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_34%_46%_at_50%_42%,rgba(6,7,10,0.72),transparent_72%)]" />
      </div>
    </div>
  </div>
);

/* ==================================================================== */
/* Sign-up teaser                                                        */
/* ==================================================================== */

/**
 * One of the two big provider buttons: mark on top, label beneath.
 */
const ProviderButton: FC<{
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rl-glass-dark flex h-[76px] flex-col items-center justify-center gap-2 rounded-2xl transition-colors hover:border-white/20 hover:bg-[#16181e]/80 disabled:opacity-60"
  >
    <span className="flex h-[22px] items-center">{icon}</span>
    <span className="text-[13px] text-white">{label}</span>
  </button>
);

/**
 * One disc in the overlapping stack of provider shortcuts. The stack is drawn
 * with a negative margin on every disc but the first, so each ring sits over
 * the previous one's edge.
 */
const SocialDot: FC<{
  label: string;
  colour: string;
  onClick: () => void;
  first?: boolean;
  children: ReactNode;
}> = ({ label, colour, onClick, first, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative flex h-[37px] w-[37px] items-center justify-center rounded-full border border-white/10 bg-[#121317] transition-transform hover:z-10 hover:scale-110 ${colour} ${
      first ? '' : '-ml-[9px]'
    }`}
  >
    {children}
  </button>
);

/**
 * The signed-out call to action: a mobile number straight into signup, with
 * the provider shortcuts beneath it.
 *
 * The form does not register anybody here — it hands the number to
 * /auth/register through the query string, which that page already reads and
 * prefills. Doing the signup inline would mean duplicating its validation,
 * OTP step and terms consent in the lobby.
 */
const SignupTeaser: FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();

  const [dial, setDial] = useState(DIAL_CODES[0]);
  const [mobile, setMobile] = useState('');

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      toast.error('Mobile must be 10–15 digits');
      return;
    }
    router.push(`/auth/register?mobile=${encodeURIComponent(digits)}`);
  };

  const soon = (method: string): void => {
    toast.info(t('auth.methodSoon', { method }));
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* A tab resting on the field's top edge. `!` because rl-glass-dark's
          border shorthand is emitted after border-b-0 and would redraw it. */}
      <span className="rl-glass-dark flex h-7 items-center rounded-t-[10px] !border-b-0 px-3 text-[11px] text-white/85">
        {STATS.registeredToday} Registered Today
      </span>

      <form onSubmit={submit} className="w-full max-w-[343px]">
        <label
          className="rl-glass-dark flex h-[43px] items-center rounded-[14px] transition-colors focus-within:border-white/25"
          htmlFor="hero-mobile"
        >
          <span className="relative flex h-full flex-shrink-0 items-center">
            <select
              value={dial}
              onChange={(e) => setDial(e.target.value)}
              aria-label="Country calling code"
              className="h-full appearance-none bg-transparent pl-4 pr-7 text-[13.5px] font-medium text-white outline-none [&>option]:bg-[#14161b]"
            >
              {DIAL_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 h-3 w-3 text-white/70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
          <input
            id="hero-mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
            className="h-full min-w-0 flex-1 bg-transparent pl-2.5 pr-4 text-[14px] text-white outline-none placeholder:text-white/40"
          />
          <button type="submit" className="sr-only">
            {t('account.register')}
          </button>
        </label>
      </form>

      <div className="mt-3 grid w-full max-w-[343px] grid-cols-2 gap-[9px]">
        <ProviderButton
          icon={<GmailMark size={22} />}
          label={`Continue with ${t('auth.methodGmail')}`}
          onClick={() => google.signIn()}
          disabled={google.loading}
        />
        {/* The design draws an envelope here: the e-mail signup flow, not a
            second Google button. Labelled for what it actually opens. */}
        <ProviderButton
          icon={<MailIcon size={22} strokeWidth={1.6} />}
          label={`Continue with ${t('auth.methodMail')}`}
          onClick={() => router.push('/auth/register')}
        />
      </div>

      <div className="mt-5 flex items-center">
        <SocialDot
          label={t('auth.methodTelegram')}
          colour="text-[#2aabee]"
          onClick={() => telegram.signIn()}
          first
        >
          <TelegramMark size={16} />
        </SocialDot>
        <SocialDot label="Facebook" colour="text-[#1877f2]" onClick={() => soon('Facebook')}>
          <FacebookMark size={16} />
        </SocialDot>
        <SocialDot label="WhatsApp" colour="text-[#25d366]" onClick={() => soon('WhatsApp')}>
          <WhatsappMark size={17} />
        </SocialDot>
        <Link
          href="/auth/register"
          className="ms-3 text-[13px] text-white/55 transition-colors hover:text-white"
        >
          more option
        </Link>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* Section cards                                                         */
/* ==================================================================== */

/** The white line-art die cut off by the Casino card's top edge. */
const DieArt: FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="pointer-events-none absolute -top-[26px] right-[80px] h-[74px] w-[74px] rotate-[-22deg] text-white/90"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="8" y="8" width="48" height="48" rx="11" />
    <circle cx="22" cy="42" r="3.6" fill="currentColor" stroke="none" />
    <circle cx="32" cy="32" r="3.6" fill="currentColor" stroke="none" />
    <circle cx="42" cy="22" r="3.6" fill="currentColor" stroke="none" />
    <circle cx="42" cy="42" r="3.6" fill="currentColor" stroke="none" />
  </svg>
);

/** The white line-art trophy cut off by the Sports card's top edge. */
const TrophyArt: FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="pointer-events-none absolute -top-[22px] right-[92px] h-[72px] w-[72px] rotate-[28deg] text-white/90"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 8h24v14a12 12 0 0 1-24 0z" />
    <path d="M20 13h-7a7 7 0 0 0 7 11M44 13h7a7 7 0 0 1-7 11" />
    <path d="M32 34v12M22 56h20M25 56l2-10h10l2 10" />
  </svg>
);

const SectionCard: FC<{
  href: string;
  title: string;
  subtitle: string;
  art: typeof casinoArt;
  lineArt: ReactNode;
}> = ({ href, title, subtitle, art, lineArt }) => (
  <Link
    href={href}
    className="rl-glass-dark group relative flex h-[118px] items-start overflow-hidden rounded-[20px] px-6 pt-[18px] transition-colors hover:border-white/15"
  >
    {/* Drawn at its natural size and hung off the top-right corner, so the
        wheel's crown shows and the rest runs off the card's lower edge. */}
    <Image
      src={art}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute -right-3 -top-2.5 transition-transform duration-300 group-hover:scale-105"
    />
    {lineArt}

    <span className="relative min-w-0">
      <span className="block text-[22px] font-semibold leading-tight text-white">{title}</span>
      <span className="mt-1.5 block text-[13px] text-white/55">{subtitle}</span>
    </span>
  </Link>
);

/* ==================================================================== */
/* The hero                                                              */
/* ==================================================================== */

const TRUST: { Icon: FC<{ size?: number; strokeWidth?: number }>; label: string }[] = [
  { Icon: ShieldIcon, label: 'Complete Privacy' },
  { Icon: ScaleIcon, label: 'Provably Fair' },
  { Icon: ZapIcon, label: 'Instant Withdrawals' },
];

/**
 * The signed-out lobby hero.
 *
 * Transparent: the artwork behind it is the page's backdrop (LandingBackdrop,
 * passed to PlayerLayout), so this section is only the content that floats on
 * it — the live figures in the top corners, the sign-up teaser on the
 * midline, and the two section shortcuts along the foot. Signed-in players get
 * the dashboard panel and promo slider instead — see HomeHero.
 *
 * Vertical rhythm is set with explicit margins rather than centring in a
 * fixed height, so each gap can match the design independently.
 */
const LandingHero: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="px-1 pt-[15px]">
      {/* --- Live figures --------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:px-5">
        <span className="rl-glass-dark inline-flex h-[27px] items-center gap-1.5 rounded-full px-2.5 text-[11px] text-white/85">
          <span className="h-[7px] w-[7px] rounded-full bg-white" aria-hidden="true" />
          {t('dash.online', { count: STATS.online })}
        </span>

        <span className="inline-flex items-center gap-2 text-[12px] text-white/90 sm:text-[13px]">
          <span>{STATS.todaysWinnings} Today&apos;s Winnings</span>
          <SparklesIcon size={13} />
          <span>{STATS.biggestWin} Biggest Win</span>
        </span>
      </div>

      {/* --- Headline and sign-up -------------------------------------- */}
      <div className="flex flex-col items-center text-center sm:px-5">
        <h1 className="mt-6 text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-white sm:mt-[15px] sm:text-[34px] sm:leading-[1.05] lg:text-[40px]">
          Rolluck — Where Trust Meets
          <br className="hidden sm:block" /> Premium Gaming
        </h1>

        <div className="mt-[21px] w-full">
          <SignupTeaser />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-[22px] gap-y-2">
          {TRUST.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[11.5px] text-white/55"
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* --- Section shortcuts ------------------------------------------ */}
      <div className="mt-9 grid gap-3 sm:grid-cols-2 sm:gap-[17px]">
        <SectionCard
          href="/casino"
          title={t('nav.casino')}
          subtitle="Slots, live tables and 12 Rolluck Originals"
          art={casinoArt}
          lineArt={<DieArt />}
        />
        <SectionCard
          href="/sports"
          title={t('nav.sports')}
          subtitle="Football, Tennis, Basketball and 12 other sports"
          art={sportsArt}
          lineArt={<TrophyArt />}
        />
      </div>
    </section>
  );
};

export default LandingHero;
