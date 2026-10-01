import { useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import logo from '@/assets/logo.png';
import casinoGlyph from '@/assets/casino-sidebar.svg';
import sportsGlyph from '@/assets/sports-sidebar.svg';
import { useTheme } from '@/context/ThemeContext';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import ThemeModal from '@/components/modals/profile/ThemeModal';
import { categoryHref } from '@/constants/games';
import {
  ClockIcon,
  CoinIcon,
  CrownIcon,
  DiamondIcon,
  FacebookIcon,
  GiftIcon,
  HeartIcon,
  InstagramIcon,
  PaletteIcon,
  SendIcon,
  ShieldIcon,
  SuggestionIcon,
  TicketIcon,
  TrophyIcon,
  WhatsappIcon,
  XSocialIcon,
  ZapIcon,
  type IconProps,
} from '@/components/icons';

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
  glyph: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

/**
 * One half of the section switch. The glyph is the design's own line artwork
 * rather than an icon from the set — it is the single largest thing in the
 * rail and the two shapes (roulette, ball) are what identify the sections at
 * a glance.
 *
 * The SVG files paint a fixed grey, so they are drawn through a mask and take
 * the button's own text colour: that is what makes the active half read as
 * white and the idle one as muted, from one asset each.
 */
const SectionTab: FC<SectionProps> = ({ href, glyph, label, active, collapsed, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    title={label}
    className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors ${
      active ? 'text-white' : 'text-white/60 hover:text-white/90'
    } ${collapsed ? 'lg:py-2.5' : ''}`}
  >
    <span
      aria-hidden="true"
      className={`block bg-current ${collapsed ? 'h-[30px] w-[30px] lg:h-6 lg:w-6' : 'h-[30px] w-[30px]'}`}
      style={{
        WebkitMaskImage: `url(${glyph})`,
        maskImage: `url(${glyph})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
    <span className={`text-[14px] leading-none ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
  </Link>
);

/* ==================================================================== */
/* Nav rows                                                              */
/* ==================================================================== */

const ROW =
  'flex h-[38px] w-full items-center gap-2.5 rounded-xl px-3 text-[13.5px] transition-colors';
const ROW_ACTIVE = 'bg-white/10 text-white';
const ROW_IDLE = 'text-white/75 hover:bg-white/5 hover:text-white';

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
    collapsed ? 'lg:justify-center lg:px-2' : ''
  }`;

  const body = (
    <>
      <span className="flex-shrink-0 text-current opacity-80">{icon}</span>
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

/** A footer pill — Join Telegram, Suggestion Box. */
const RailButton: FC<{
  icon: FC<IconProps>;
  label: string;
  href: string;
  collapsed: boolean;
}> = ({ icon: Icon, label, href, collapsed }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel={href.startsWith('http') ? 'noreferrer' : undefined}
    title={label}
    className={`rl-btn-ghost flex h-9 items-center justify-center gap-2 rounded-xl text-[11.5px] font-medium ${
      collapsed ? 'lg:px-0' : 'px-2'
    }`}
  >
    <Icon size={14} />
    <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
  </a>
);

const SOCIALS: { Icon: FC<IconProps>; label: string; href: string }[] = [
  { Icon: WhatsappIcon, label: 'WhatsApp', href: 'https://wa.me/' },
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/' },
  { Icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/' },
  { Icon: XSocialIcon, label: 'X', href: 'https://x.com/' },
];

/* ==================================================================== */
/* The rail                                                              */
/* ==================================================================== */

/**
 * Category rail.
 *
 * Casino (this app) and Sports sit up top as the two site sections, then the
 * welcome-package teaser, then the player's own shortcuts. Rolluck Originals
 * is the only entry with a built feature behind it — the originals shelf's own
 * category page. Every other destination routes to a placeholder page that
 * says so.
 *
 * It floats: a rounded glass panel inset from the viewport rather than a
 * bordered column, sticky under the bar with its own scroll so a long list
 * never pushes the footer pills off-screen.
 */
const PlayerSidebar: FC<Props> = ({ open, onClose, collapsed }) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { theme, applyTheme } = useTheme();
  const { updateMe } = useMe();
  const [themeOpen, setThemeOpen] = useState(false);

  const width = collapsed ? 'lg:w-[76px]' : 'lg:w-[205px]';

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
        className={`rl-glass-dark fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-shrink-0 flex-col rounded-none transition-[transform,width] duration-200 lg:sticky lg:top-[94px] lg:z-auto lg:h-[calc(100vh-106px)] lg:translate-x-0 lg:rounded-[20px] ${width} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t('nav.games')}
      >
        {/* The wordmark lives in the bar on desktop; the phone drawer covers
            it, so it is repeated here with the drawer's close control. */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-3 lg:hidden">
          <Link href="/" onClick={onClose} className="flex min-w-0 items-center">
            <Image src={logo} alt="ROLLUCK" className="h-6 w-auto" priority />
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
        <div className="flex-shrink-0 px-3 pt-3">
          <div
            className={`flex h-[70px] rounded-2xl border border-white/[0.08] bg-white/[0.05] ${
              collapsed ? 'lg:h-auto lg:flex-col lg:py-1' : ''
            }`}
          >
            <SectionTab
              href="/casino"
              glyph={casinoGlyph.src}
              label={t('nav.casino')}
              active={pathname === '/' || pathname === '/casino' || pathname.startsWith('/game')}
              collapsed={collapsed}
              onClick={onClose}
            />
            <SectionTab
              href="/sports"
              glyph={sportsGlyph.src}
              label={t('nav.sports')}
              active={pathname === '/sports'}
              collapsed={collapsed}
              onClick={onClose}
            />
          </div>
        </div>

        {/* --- Welcome package ------------------------------------------ */}
        <Link
          href="/auth/register"
          onClick={onClose}
          title="Welcome package — $1,500 + 100 free spins"
          className={`mx-3 mt-4 flex h-[96px] flex-shrink-0 flex-col justify-center rounded-[14px] border border-white/[0.05] bg-white/[0.07] px-[13px] transition-colors hover:bg-white/10 ${
            collapsed ? 'lg:h-auto lg:px-2 lg:py-3 lg:text-center' : ''
          }`}
        >
          <p
            className={`text-[11px] uppercase leading-none tracking-[0.02em] text-white/70 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            Welcome package
          </p>
          <p
            className={`font-bold leading-none text-white ${collapsed ? 'text-[13px]' : 'mt-2 text-[21px]'}`}
          >
            $1,500
          </p>
          <p
            className={`mt-2 text-[10.5px] leading-none text-white/55 ${collapsed ? 'lg:hidden' : ''}`}
          >
            + 100 free spins
          </p>
        </Link>

        {/* --- Shortcuts ------------------------------------------------- */}
        <nav className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-2.5">
          <RailLink
            href="/rolluck-oath"
            active={pathname === '/rolluck-oath'}
            icon={<ShieldIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.rolluckOath')}
          </RailLink>
          <RailLink
            href="/recents"
            active={pathname === '/recents'}
            icon={<ClockIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.recents')}
          </RailLink>
          <RailLink
            href="/favourites"
            active={pathname === '/favourites'}
            icon={<HeartIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.favourites')}
          </RailLink>
          <RailLink
            href={categoryHref('originals')}
            active={pathname === '/games/[category]'}
            icon={<DiamondIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.originals')}
          </RailLink>
          <RailLink
            href="/my-bets"
            active={pathname === '/my-bets'}
            icon={<TicketIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.myBets')}
          </RailLink>
          <RailLink
            onSelect={() => setThemeOpen(true)}
            active={false}
            icon={<PaletteIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('account.appearance')}
          </RailLink>
          <RailLink
            href="/vip-club"
            active={pathname === '/vip-club'}
            icon={<CrownIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.vipClub')}
          </RailLink>
          <RailLink
            href="/tournaments"
            active={pathname === '/tournaments'}
            icon={<TrophyIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.tournaments')}
          </RailLink>

          {/* Built features the design's shortlist leaves out. They keep the
              rail's styling and sit below it, so the visible top of the list
              still matches the design while nothing becomes unreachable. */}
          <RailLink
            href="/promotions"
            active={pathname === '/promotions'}
            icon={<GiftIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.promotions')}
          </RailLink>
          <RailLink
            href="/bonuses"
            active={pathname === '/bonuses'}
            icon={<ZapIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.bonuses')}
          </RailLink>
          <RailLink
            href="/rewards"
            active={pathname === '/rewards'}
            icon={<CoinIcon size={18} strokeWidth={1.6} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.rewards')}
          </RailLink>
        </nav>

        {/* --- Socials and contact pills --------------------------------- */}
        <div className={`flex-shrink-0 space-y-2 px-2.5 pb-3 pt-2 ${collapsed ? 'lg:px-2' : ''}`}>
          <div
            className={`flex items-center justify-between gap-1 ${collapsed ? 'lg:flex-col' : ''}`}
          >
            {SOCIALS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

          <RailButton
            icon={SendIcon}
            label="Join Telegram"
            href="https://t.me/"
            collapsed={collapsed}
          />
          <RailButton
            icon={SuggestionIcon}
            label="Suggestion Box"
            href="mailto:support@rolluck.com?subject=Suggestion"
            collapsed={collapsed}
          />
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
