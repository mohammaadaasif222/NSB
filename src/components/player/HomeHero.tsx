import { useEffect, useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { categoryHref, gameHref } from '@/constants/games';
import { fullNameOf, initialsOf } from '@/types/profile';
import RoleBadge from '@/components/player/RoleBadge';
import { ActivityIcon, GamepadIcon, UserIcon } from '@/components/icons';
import type { Game } from '@/types';

/**
 * Wagering requirement on the player's active bonus.
 *
 * There is no wagering endpoint yet — /balance/me returns the two pot totals
 * and nothing about bonus progress — so these figures are illustrative, in the
 * same spirit as the winners strip in the top bar. Every number rendered below
 * is derived from this one object, so swapping it for the real payload is the
 * whole of the change once the endpoint exists.
 */
const WAGERING = { wagered: 650, required: 1000 };

/** Placeholder money, matching WAGERING's assumed USD denomination. */
const usd = (value: number, locale: string): string => `$${value.toLocaleString(locale)}`;

/* ==================================================================== */
/* Left panel: who you are, where to play, and how the bonus is going.   */
/* ==================================================================== */

interface SectionTileProps {
  icon: ReactNode;
  label: string;
  href: string;
  /**
   * The destination is a placeholder page rather than a built feature. The tile
   * still navigates — it is dimmed and tagged "Soon" on hover so that is clear
   * beforehand.
   */
  soon?: boolean;
}

/**
 * One of the two big section shortcuts. Fixed size rather than fluid: they sit
 * beside the identity block, which is the part that should absorb the width.
 *
 * Sized off the panel via container queries rather than the viewport: what
 * squeezes the player's name is the nav rail eating into this column, which a
 * viewport breakpoint cannot see. Thresholds are content-box widths, so they
 * read ~36px smaller than the panel itself.
 */
const SectionTile: FC<SectionTileProps> = ({ icon, label, href, soon }) => {
  const { t } = useTranslation();

  const className = `group relative flex h-[112px] w-[96px] @[420px]:h-[133px] @[420px]:w-[110px] flex-shrink-0 flex-col items-center justify-between overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 px-2 py-4 transition-colors ${
    soon
      ? 'opacity-70 hover:opacity-100 hover:border-slate-600'
      : 'hover:border-blue-500/60 hover:bg-slate-700'
  }`;

  const body = (
    <>
      <span
        className="pointer-events-none absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-blue-500/15 blur-2xl"
        aria-hidden="true"
      />
      <span className="relative mt-2 text-blue-300">{icon}</span>
      <span className="relative text-[13px] font-semibold text-slate-100">{label}</span>
    </>
  );

  return (
    <Link
      href={href}
      className={className}
      title={soon ? `${label} — ${t('common.soon')}` : undefined}
    >
      {body}
    </Link>
  );
};

/** Avatar + display name. Falls back to a neutral "Guest" for visitors. */
const Identity: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const { me } = useMe();
  const { t } = useTranslation();

  const name = me ? me.display_name || fullNameOf(me) || me.username : '';

  const AVATAR = 'h-[60px] w-[60px] @[420px]:h-[68px] @[420px]:w-[68px] flex-shrink-0 rounded-full';

  return (
    <div className="flex w-full min-w-0 items-center gap-3 @[350px]:w-auto @[350px]:flex-1 @[420px]:gap-3.5">
      {loggedIn && me?.avatar_url ? (
        <img
          src={me.avatar_url}
          alt=""
          className={`${AVATAR} border-2 border-slate-800 object-cover`}
        />
      ) : loggedIn ? (
        <span
          className={`${AVATAR} flex select-none items-center justify-center border-2 border-slate-800 bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white`}
        >
          {initialsOf(me)}
        </span>
      ) : (
        <span
          className={`${AVATAR} flex items-center justify-center border-2 border-slate-800 bg-slate-800 text-slate-400`}
        >
          <UserIcon size={26} />
        </span>
      )}

      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-white">
          {loggedIn ? name || t('account.account') : t('dash.guest')}
        </p>
        <div className="mt-1.5">
          {loggedIn ? (
            <RoleBadge role={me?.role} />
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href="/auth/login"
                className="whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {t('account.login')}
              </Link>
              <Link
                href="/auth/register"
                className="whitespace-nowrap rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                {t('account.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Bonus progress: the bar, its end labels, and what is left to wager.
 *
 * A visitor gets the same block sitting at zero, with the pill turned into the
 * way in. The alternative — restating the welcome offer here — would print the
 * banner's own headline twice, side by side.
 */
const WageringProgress: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const { t, locale } = useTranslation();

  const { wagered: earned, required } = WAGERING;
  const wagered = loggedIn ? earned : 0;
  const percent = Math.min(100, Math.round((wagered / required) * 100));
  const remaining = Math.max(0, required - wagered);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-300">{t('dash.wageringProgress')}</span>
        <span className="text-xs font-semibold text-slate-100 tabular-nums">
          {t('dash.percentComplete', { percent })}
        </span>
      </div>

      <div
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('dash.wageringProgress')}
      >
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-2 grid grid-cols-3 items-center text-[11px] tabular-nums text-slate-500">
        <span>{usd(0, locale)}</span>
        <span className="text-center font-medium text-slate-300">
          {t('dash.wagered', { amount: usd(wagered, locale) })}
        </span>
        <span className="text-end">{usd(required, locale)}</span>
      </div>

      <p className="mt-3.5 flex justify-center">
        {loggedIn ? (
          <span className="rounded-full bg-slate-800 border border-slate-700 px-3.5 py-1 text-center text-[11px] text-slate-300">
            {t('dash.bonusRemaining', { amount: usd(remaining, locale) })}
          </span>
        ) : (
          <Link
            href="/auth/register"
            className="rounded-full bg-blue-600 px-4 py-1 text-center text-[11px] font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            {t('dash.unlockBonus')}
          </Link>
        )}
      </p>
    </div>
  );
};

const PlayerPanel: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const { t } = useTranslation();

  return (
    <div className="@container flex min-h-[282px] flex-col rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-[18px]">
      <div className="flex flex-1 flex-col items-start gap-4 @[350px]:flex-row @[350px]:items-center @[350px]:gap-3 @[420px]:gap-4">
        <Identity loggedIn={loggedIn} />

        <div className="flex flex-shrink-0 gap-2.5 @[420px]:gap-3">
          <SectionTile
            icon={<GamepadIcon size={26} />}
            label={t('nav.casino')}
            href={categoryHref('featured')}
          />
          <SectionTile
            icon={<ActivityIcon size={26} />}
            label={t('nav.sports')}
            href="/sports"
            soon
          />
        </div>
      </div>

      <WageringProgress loggedIn={loggedIn} />
    </div>
  );
};

/* ==================================================================== */
/* Right panel: the promo banner.                                        */
/* ==================================================================== */

interface Slide {
  key: string;
  href: string;
  /** Absent on the bonus slide, which paints a gradient instead. */
  image?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

const SLIDE_MS = 6000;

/**
 * Auto-advancing promo banner.
 *
 * Slides are built from the featured shelf the page already fetched rather
 * than a second request, with the welcome offer leading for signed-out
 * visitors. Rotation stops on hover and for anyone who has asked for reduced
 * motion; the dots drive it manually in either case.
 */
const PromoBanner: FC<{ spotlight: Game[]; loggedIn: boolean }> = ({ spotlight, loggedIn }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mayAnimate, setMayAnimate] = useState(false);

  const slides: Slide[] = [
    ...(loggedIn
      ? []
      : [
          {
            key: 'welcome-bonus',
            href: '/auth/register',
            eyebrow: t('dash.welcomeBonus'),
            title: '100% up to $1,000 + 200 Free Spins',
            subtitle: t('dash.heroSubtitle'),
            cta: t('dash.claimNow'),
          },
        ]),
    ...spotlight.map((game) => ({
      key: game.id,
      href: gameHref(game.slug),
      image: game.image_url ?? undefined,
      eyebrow: game.is_new ? t('game.new') : t('dash.featuredGames'),
      title: game.title,
      subtitle: game.provider,
      cta: t('dash.playNow'),
    })),
  ];

  // The catalogue can fail to load; the banner is not the place to show that.
  if (slides.length === 0) {
    slides.push({
      key: 'fallback',
      href: categoryHref('featured'),
      eyebrow: t('dash.featuredGames'),
      title: t('dash.heroTitle'),
      subtitle: t('dash.heroSubtitle'),
      cta: t('dash.playNow'),
    });
  }

  const count = slides.length;
  const active = slides[Math.min(index, count - 1)];

  useEffect(() => {
    setMayAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!mayAnimate || paused || count < 2) {
      return;
    }
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [mayAnimate, paused, count]);

  return (
    <div
      className="relative min-h-[282px] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {active.image ? (
        <>
          <Image
            key={active.key}
            src={active.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 63vw"
            priority
            className="object-cover"
          />
          {/* Text sits on the artwork, so it needs its own ground to stay
              readable whatever the tile happens to look like. */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950"
          aria-hidden="true"
        />
      )}

      <div className="relative flex h-full min-h-[282px] flex-col justify-center gap-3 p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
          {active.eyebrow}
        </p>
        <h2 className="max-w-md text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {active.title}
        </h2>
        <p className="max-w-md text-sm text-slate-300">{active.subtitle}</p>
        <Link
          href={active.href}
          className="mt-1 inline-flex w-fit items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
        >
          {active.cta}
        </Link>
      </div>

      {count > 1 && (
        <div className="absolute bottom-4 end-5 flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={slide.title}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * The lobby banner: the player's own panel beside the promo slider.
 *
 * The two columns keep the 37 / 63 split of the design at `lg` and stack below
 * it, where the panel's tiles and the banner's copy both need the full width.
 */
const HomeHero: FC<{ spotlight: Game[]; loggedIn: boolean }> = ({ spotlight, loggedIn }) => (
  <section className="grid gap-4 lg:grid-cols-[minmax(0,37fr)_minmax(0,63fr)] lg:gap-5">
    <PlayerPanel loggedIn={loggedIn} />
    <PromoBanner spotlight={spotlight} loggedIn={loggedIn} />
  </section>
);

export default HomeHero;
