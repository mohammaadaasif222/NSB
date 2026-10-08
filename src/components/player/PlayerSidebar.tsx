import { useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import logo from '@/assets/logo.png';
import casinoArt from '@/assets/lobby/player/panel-casino.webp';
import sportsArt from '@/assets/lobby/player/panel-sports.webp';
import oathIcon from '@/assets/lobby/rail/nav-oath.svg';
import recentIcon from '@/assets/lobby/rail/nav-recent.svg';
import favouritesIcon from '@/assets/lobby/rail/nav-favourites.svg';
import originalsIcon from '@/assets/lobby/rail/nav-originals.svg';
import betsIcon from '@/assets/lobby/rail/nav-bets.svg';
import themeIcon from '@/assets/lobby/rail/nav-theme.svg';
import vipIcon from '@/assets/lobby/rail/nav-vip.svg';
import tournamentsIcon from '@/assets/lobby/rail/nav-tournaments.svg';
import promotionIcon from '@/assets/lobby/rail/nav-promotion.svg';
import bonusesIcon from '@/assets/lobby/rail/nav-bonuses.svg';
import telegramIcon from '@/assets/lobby/rail/rail-telegram.svg';
import suggestionIcon from '@/assets/lobby/rail/rail-suggestion.svg';
import whatsapp from '@/assets/lobby/footer/social-whatsapp.svg';
import instagram from '@/assets/lobby/footer/social-instagram.svg';
import facebook from '@/assets/lobby/footer/social-facebook.svg';
import xSocial from '@/assets/lobby/footer/social-x.svg';
import { useTheme } from '@/context/ThemeContext';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useAuthModal } from '@/context/AuthModalContext';
import ThemeModal from '@/components/modals/profile/ThemeModal';
import Glyph from '@/components/player/Glyph';
import { categoryHref } from '@/constants/games';
import { CoinIcon } from '@/components/icons';

interface Props {
  /** Mobile drawer state. Ignored at lg and above, where the rail is static. */
  open: boolean;
  onClose: () => void;
  /** Icon-only rail from lg up. Phones always render the expanded drawer. */
  collapsed: boolean;
}

/* ==================================================================== */
/* Section switch — Casino / Sports                                      */
/* ==================================================================== */

interface SectionProps {
  href: string;
  /** The section's 3D render, glow included. */
  art: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

/**
 * One half of the design's 228×90 section switch: the section's 58px 3D
 * render over a 14px label.
 */
const SectionTab: FC<SectionProps> = ({ href, art, label, active, collapsed, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    title={label}
    className={`flex flex-1 flex-col items-center justify-center rounded-[calc(var(--u)*24)] transition-colors ${
      active ? 'bg-white/[0.12] text-white' : 'text-[#9da2b4] hover:text-white'
    } ${collapsed ? 'lg:py-[calc(var(--u)*10)]' : ''}`}
  >
    {/* The render carries its glow: the image is the 58px art plus ~20px of
        glow on every side, so it overhangs a box the size of the art. */}
    <span
      className={`relative flex-shrink-0 ${
        collapsed
          ? 'h-[calc(var(--u)*40)] w-[calc(var(--u)*40)]'
          : 'h-[calc(var(--u)*58)] w-[calc(var(--u)*58)]'
      }`}
    >
      <img src={art} alt="" className="absolute inset-[-33.7%] h-[167.3%] w-[167.3%] max-w-none" />
    </span>
    <span
      className={`text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] ${
        collapsed ? 'lg:hidden' : ''
      }`}
    >
      {label}
    </span>
  </Link>
);

/* ==================================================================== */
/* Nav rows                                                              */
/* ==================================================================== */

const ROW =
  'flex h-[calc(var(--u)*44)] w-full flex-shrink-0 items-center gap-[calc(var(--u)*11)] rounded-[calc(var(--u)*34)] px-[calc(var(--u)*15)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] transition-colors';
const ROW_ACTIVE = 'bg-white/10 text-white';
const ROW_IDLE = 'text-[#9da2b4] hover:bg-white/5 hover:text-white';

interface RailLinkProps {
  href?: string;
  onSelect?: () => void;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
  collapsed: boolean;
}

/**
 * One nav row — a link, or a button when `onSelect` is given (Theme opens a
 * modal rather than navigating).
 *
 * `collapsed` only takes effect at `lg` and up (via the `lg:` prefixed
 * classes): the mobile drawer always shows the full label, since there is no
 * persistent icon rail on a phone.
 */
const RailLink: FC<RailLinkProps> = ({
  href,
  onSelect,
  active,
  icon,
  onClick,
  children,
  collapsed,
}) => {
  const className = `${ROW} ${active ? ROW_ACTIVE : ROW_IDLE} ${
    collapsed ? 'lg:justify-center lg:px-[calc(var(--u)*8)]' : ''
  }`;

  const body = (
    <>
      {icon}
      <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{children}</span>
    </>
  );

  const title = collapsed ? String(children) : undefined;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => {
          onClick();
          onSelect();
        }}
        className={className}
        title={title}
      >
        {body}
      </button>
    );
  }

  return (
    <Link
      href={href ?? '#'}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={className}
      title={title}
    >
      {body}
    </Link>
  );
};

/** A footer pill — Join Telegram, Suggestion Box: the design's 228×44 dark pill. */
const RailButton: FC<{
  icon: StaticImageData;
  label: string;
  href: string;
  collapsed: boolean;
}> = ({ icon, label, href, collapsed }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel={href.startsWith('http') ? 'noreferrer' : undefined}
    title={label}
    className="flex h-[calc(var(--u)*44)] items-center justify-center gap-[calc(var(--u)*6)] rounded-[calc(var(--u)*34)] border border-[#1b1f29] bg-[#0e1218] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4] transition-colors hover:text-white"
  >
    <img src={icon.src} alt="" className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]" />
    <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
  </a>
);

const SOCIALS: { icon: StaticImageData; label: string; href: string }[] = [
  { icon: whatsapp, label: 'WhatsApp', href: 'https://wa.me/' },
  { icon: instagram, label: 'Instagram', href: 'https://instagram.com/' },
  { icon: facebook, label: 'Facebook', href: 'https://facebook.com/' },
  { icon: xSocial, label: 'X', href: 'https://x.com/' },
];

/* ==================================================================== */
/* The rail                                                              */
/* ==================================================================== */

/**
 * Category rail, as the design draws it: a 260px dark glass panel floating
 * down the left from the top of the page — the bar sits beside it, not above.
 *
 * Casino and Sports sit up top as the two site sections, then the
 * welcome-package teaser, then the player's own shortcuts in a list that
 * scrolls on its own, and the socials and contact pills pinned at the foot.
 * Rolluck Originals is the only entry with a built feature behind it — the
 * originals shelf's own category page. Every other destination routes to a
 * placeholder page that says so.
 *
 * Sized in `--u` (see PlayerLayout), so it shrinks with the page on a
 * narrower desktop; on a phone it is the slide-in drawer at its design size.
 */
const PlayerSidebar: FC<Props> = ({ open, onClose, collapsed }) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { rewards: rewardsOn } = usePlatformFeatures();
  const { openRegister } = useAuthModal();
  const { theme, applyTheme } = useTheme();
  const { updateMe } = useMe();
  const [themeOpen, setThemeOpen] = useState(false);

  const icon = (src: StaticImageData): ReactNode => <Glyph src={src.src} size={24} />;

  return (
    <>
      {/* Scrim: mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      )}

      <aside
        className={`rl-glass-deep fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-shrink-0 flex-col rounded-none p-4 transition-[transform,width] duration-200 lg:sticky lg:top-[calc(var(--u)*20)] lg:z-auto lg:h-[min(calc(var(--u)*824),calc(100vh-var(--u)*40))] lg:w-[var(--rail)] lg:translate-x-0 lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*16)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t('nav.games')}
      >
        {/* The phone drawer covers the bar, so it repeats the wordmark with
            the drawer's close control. */}
        <div className="mb-4 flex h-10 flex-shrink-0 items-center justify-between gap-2 lg:hidden">
          <Link href="/" onClick={onClose} className="flex min-w-0 items-center">
            <Image src={logo} alt="ROLLUCK" className="h-7 w-auto" priority />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="flex-shrink-0 p-1 text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* --- Section switch ------------------------------------------- */}
        <div
          className={`rl-liquid flex h-[calc(var(--u)*90)] flex-shrink-0 gap-0 rounded-[calc(var(--u)*24)] p-[calc(var(--u)*3)] ${
            collapsed ? 'lg:h-auto lg:flex-col' : ''
          }`}
        >
          <SectionTab
            href="/casino"
            art={casinoArt.src}
            label={t('nav.casino')}
            active={pathname === '/casino' || pathname.startsWith('/game')}
            collapsed={collapsed}
            onClick={onClose}
          />
          <SectionTab
            href="/sports"
            art={sportsArt.src}
            label={t('nav.sports')}
            active={pathname.startsWith('/sports')}
            collapsed={collapsed}
            onClick={onClose}
          />
        </div>

        {/* --- Welcome package ------------------------------------------ */}
        <button
          type="button"
          onClick={() => {
            onClose();
            openRegister();
          }}
          title="Welcome package — $1,500 + 100 free spins"
          className={`mt-[calc(var(--u)*24)] flex flex-shrink-0 flex-col gap-[calc(var(--u)*6)] rounded-[calc(var(--u)*16.25)] bg-[#1b1f29] px-[calc(var(--u)*16.25)] py-[calc(var(--u)*17.5)] text-start transition-colors hover:bg-[#222735] ${
            collapsed ? 'lg:items-center lg:px-[calc(var(--u)*8)] lg:text-center' : ''
          }`}
        >
          <span
            className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] uppercase leading-[calc(var(--u)*20)] text-[#9da2b4] ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            Welcome package
          </span>
          <span
            className={`block font-bold leading-[calc(var(--u)*36)] tracking-[-0.02em] text-[#f0f1f5] ${
              collapsed
                ? 'text-[length:max(min(11px,16px),calc(var(--u)*16))]'
                : 'text-[length:max(min(11px,28px),calc(var(--u)*28))]'
            }`}
          >
            $1,500
          </span>
          <span
            className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4] ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            + 100 free spins
          </span>
        </button>

        {/* --- Shortcuts ------------------------------------------------- */}
        <nav className="thin-scrollbar -mx-1 mt-[calc(var(--u)*12)] flex min-h-0 flex-1 flex-col gap-[calc(var(--u)*4)] overflow-y-auto px-1">
          <RailLink
            href="/rolluck-oath"
            active={pathname === '/rolluck-oath'}
            icon={icon(oathIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.rolluckOath')}
          </RailLink>
          <RailLink
            href="/recents"
            active={pathname === '/recents'}
            icon={icon(recentIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.recents')}
          </RailLink>
          <RailLink
            href="/favourites"
            active={pathname === '/favourites'}
            icon={icon(favouritesIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.favourites')}
          </RailLink>
          <RailLink
            href={categoryHref('originals')}
            active={pathname === '/games/[category]'}
            icon={icon(originalsIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.originals')}
          </RailLink>
          <RailLink
            href="/my-bets"
            active={pathname === '/my-bets'}
            icon={icon(betsIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.myBets')}
          </RailLink>
          <RailLink
            onSelect={() => setThemeOpen(true)}
            active={false}
            icon={icon(themeIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.theme')}
          </RailLink>
          <RailLink
            href="/vip-club"
            active={pathname === '/vip-club'}
            icon={icon(vipIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.vipClub')}
          </RailLink>
          <RailLink
            href="/tournaments"
            active={pathname === '/tournaments'}
            icon={icon(tournamentsIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.tournaments')}
          </RailLink>
          <RailLink
            href="/promotions"
            active={pathname === '/promotions'}
            icon={icon(promotionIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.promotions')}
          </RailLink>
          <RailLink
            href="/bonuses"
            active={pathname === '/bonuses'}
            icon={icon(bonusesIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.bonuses')}
          </RailLink>

          {/* A built feature the design's list leaves out: kept at the end,
              below the fold of the list, so nothing becomes unreachable.
              Hidden while rewards are switched off platform-wide — the page
              it points at renders nothing in that state. */}
          {rewardsOn && (
            <RailLink
              href="/rewards"
              active={pathname === '/rewards'}
              icon={
                <span className="flex h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] flex-shrink-0 items-center justify-center">
                  <CoinIcon size={18} strokeWidth={1.6} />
                </span>
              }
              onClick={onClose}
              collapsed={collapsed}
            >
              {t('nav.rewards')}
            </RailLink>
          )}
        </nav>

        {/* --- Socials and contact pills --------------------------------- */}
        <div className="flex-shrink-0 pt-[calc(var(--u)*13)]">
          <div
            className={`flex items-center justify-center gap-[calc(var(--u)*18)] py-[calc(var(--u)*6)] ${
              collapsed ? 'lg:flex-col' : ''
            }`}
          >
            {SOCIALS.map(({ icon: mark, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="flex h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] items-center justify-center transition-transform hover:-translate-y-0.5"
              >
                <img src={mark.src} alt="" className="h-full w-full" />
              </a>
            ))}
          </div>

          <div className="mt-[calc(var(--u)*11)] space-y-[calc(var(--u)*7)]">
            <RailButton
              icon={telegramIcon}
              label="Join Telegram"
              href="https://t.me/"
              collapsed={collapsed}
            />
            <RailButton
              icon={suggestionIcon}
              label="Suggestion Box"
              href="mailto:support@rolluck.com?subject=Suggestion"
              collapsed={collapsed}
            />
          </div>
        </div>
      </aside>

      {themeOpen && (
        <ThemeModal
          currentTheme={theme}
          onClose={() => setThemeOpen(false)}
          onSaved={(next) => {
            applyTheme(next);
            updateMe({ theme: next });
          }}
        />
      )}
    </>
  );
};

export default PlayerSidebar;
