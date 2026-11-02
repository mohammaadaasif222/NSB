import { useEffect, useState, type CSSProperties, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import casinoArt from '@/assets/lobby/rail/rail-casino.webp';
import sportsArt from '@/assets/lobby/rail/rail-sports.webp';
import casinoCardArt from '@/assets/casino-roulette-mobile.webp';
import sportsCardArt from '@/assets/sports-ball-glass-mobile.webp';
import searchGlyph from '@/assets/lobby/rail/bar-search.svg';
import oathIcon from '@/assets/lobby/rail/nav-oath.svg';
import recentIcon from '@/assets/lobby/rail/nav-recent.svg';
import favouritesIcon from '@/assets/lobby/rail/nav-favourites.svg';
import originalsIcon from '@/assets/lobby/rail/nav-originals.svg';
import casinoIcon from '@/assets/lobby/rail/tab-casino.svg';
import sportsIcon from '@/assets/lobby/rail/tab-sports.svg';
import liveIcon from '@/assets/lobby/player/chip-live.svg';
import supportIcon from '@/assets/lobby/rail/tab-chat.svg';
import chevronGlyph from '@/assets/lobby/rail/bar-chevron.svg';
// import themeIcon from '@/assets/lobby/rail/nav-theme.svg';
import vipIcon from '@/assets/lobby/rail/nav-vip.svg';
import tournamentsIcon from '@/assets/lobby/rail/nav-tournaments.svg';
import promotionIcon from '@/assets/lobby/rail/nav-promotion.svg';
import bonusesIcon from '@/assets/lobby/rail/nav-bonuses.svg';
import suggestionIcon from '@/assets/lobby/rail/rail-suggestion.svg';
import { useTheme } from '@/context/ThemeContext';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/context/AuthContext';
import { useOpenSupport } from '@/hooks/useOpenSupport';
import ThemeModal from '@/components/modals/profile/ThemeModal';
import Glyph from '@/components/player/Glyph';
import { RAIL_GROUPS, RAIL_OPEN_KEY, type RailGroup, type RailGroupId } from '@/constants/railMenu';
import { GiftIcon, CoinIcon, HandshakeIcon } from '@/components/icons';
import SuggestionModal from '@/components/suggestion/SuggestionModal';
import GameSearchModal from '@/components/player/GameSearchModal';
import LanguagePicker from '@/components/LanguagePicker';
import { useSocialLinks } from '@/hooks/useSocialLinks';

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
  /** The section's 3D render, without its glow. */
  art: string;
  /** The glow the design puts round the render, as a CSS `drop-shadow`. */
  glow: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

/**
 * One half of the design's 228×90 section switch: the section's 58px 3D
 * render over a 14px label.
 */
const SectionTab: FC<SectionProps> = ({ href, art, glow, label, active, collapsed, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    title={label}
    className={`group/section flex flex-1 flex-col items-center justify-center rounded-[calc(var(--u)*24)] transition-colors ${
      active
        ? 'rl-drop bg-white/[0.12] text-white hover:bg-white/[0.16]'
        : 'text-[#9da2b4] hover:bg-white/[0.06] hover:text-white'
    } ${collapsed ? 'lg:py-[calc(var(--u)*10)]' : ''}`}
  >
    {/* The design's 58px render with its glow round it — a 34px shadow at
        55% in the section's colour. Drawn as a soft radial behind the art, not
        a CSS `filter`: a filtered image inside the rail's glass (two layers of
        backdrop blur) made Chrome's GPU compositor flicker a light round it at
        some window sizes. */}
    <span
      className={`relative flex-shrink-0 ${
        collapsed
          ? 'h-[calc(var(--u)*40)] w-[calc(var(--u)*40)]'
          : 'h-[calc(var(--u)*58)] w-[calc(var(--u)*58)]'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-30%] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${glow}, transparent)` }}
      />
      <img
        src={art}
        alt=""
        className="pointer-events-none relative h-full w-full transition-transform duration-200 group-hover/section:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover/section:scale-100"
      />
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

/**
 * The phone menu's section card, as the design draws it: the hero's 190×72
 * glass card (24 of radius here) with the section's 3D render hung off its
 * end, in full colour whichever section the player is in.
 */
const PhoneSectionCard: FC<{
  href: string;
  label: string;
  art: string;
  /** Where the design places the render's frame on the card. */
  artClassName: string;
  active: boolean;
  onClick: () => void;
}> = ({ href, label, art, artClassName, active, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className="rl-liquid-glow relative block h-[72px] overflow-hidden rounded-[24px] transition-colors hover:bg-white/[0.1]"
  >
    <img
      src={art}
      alt=""
      className={`pointer-events-none absolute h-auto max-w-none [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_10%),linear-gradient(to_bottom,transparent,#000_10%)] ${artClassName}`}
    />
    <span className="relative block px-4 pt-2.5 text-[18px] font-medium leading-6 text-white">
      {label}
    </span>
  </Link>
);

/* ==================================================================== */
/* Nav rows                                                              */
/* ==================================================================== */

/* A phone draws every row as its own 48px glass pill, 10 apart, the icon 24
   in; the desktop rail's rows are bare until hovered or current. */
const ROW =
  'flex h-12 w-full flex-shrink-0 items-center gap-2.5 rounded-full px-6 text-[16px] leading-6 transition-colors max-lg:shadow-[0_8px_40px_rgba(0,0,0,0.12)] lg:h-[calc(var(--u)*44)] lg:gap-[calc(var(--u)*11)] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*15)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const ROW_ACTIVE = 'rl-drop bg-white/10 text-white';
const ROW_IDLE =
  'text-[#9da2b4] max-lg:bg-white/5 hover:bg-white/5 hover:text-white max-lg:hover:bg-white/10';

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

/* A group's rows hang under its icon column, smaller and without the phone's pill. */
const SUB_ROW =
  'flex h-10 w-full items-center gap-2 rounded-full ps-[58px] pe-6 text-[15px] leading-6 transition-colors lg:h-[calc(var(--u)*36)] lg:gap-[calc(var(--u)*8)] lg:rounded-[calc(var(--u)*34)] lg:ps-[calc(var(--u)*50)] lg:pe-[calc(var(--u)*15)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]';

/**
 * An expandable rail group (Originals, Casino, Live Casino, Sportsbook): the
 * row toggles its list, and a destination that is not built yet shows "Soon".
 * The collapsed rail has no room for the list, so there the icon links to the
 * group's own page instead.
 */
const RailGroupRow: FC<{
  group: RailGroup;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  currentPath: string;
  onNavigate: () => void;
  collapsed: boolean;
}> = ({ group, icon, open, onToggle, currentPath, onNavigate, collapsed }) => {
  const { t } = useTranslation();
  const label = t(group.labelKey);
  // Lit by its rows only: the section switch above already marks /casino and /sports.
  const active = group.items.some((item) => item.href === currentPath);

  return (
    <div className="flex flex-shrink-0 flex-col gap-1 lg:gap-[calc(var(--u)*2)]">
      {collapsed && (
        <Link
          href={group.href}
          onClick={onNavigate}
          title={label}
          aria-current={active ? 'page' : undefined}
          className={`${ROW} ${active ? ROW_ACTIVE : ROW_IDLE} max-lg:hidden lg:justify-center lg:px-[calc(var(--u)*8)]`}
        >
          {icon}
        </Link>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${ROW} ${active && !open ? ROW_ACTIVE : ROW_IDLE} ${collapsed ? 'lg:hidden' : ''}`}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-start">{label}</span>
        <Glyph
          src={chevronGlyph.src}
          size={16}
          className={`opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul
          className={`flex flex-col gap-1 lg:gap-[calc(var(--u)*2)] ${collapsed ? 'lg:hidden' : ''}`}
        >
          {group.items.map((item) => {
            const text = t(item.labelKey);
            const current = item.href === currentPath;
            return (
              <li key={item.labelKey}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className={`${SUB_ROW} ${
                      current
                        ? 'bg-white/10 text-white'
                        : 'text-[#9da2b4] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{text}</span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title={`${text} — ${t('common.soon')}`}
                    className={`${SUB_ROW} cursor-default text-[#9da2b4]/50`}
                  >
                    <span className="truncate">{text}</span>
                    <span className="ms-auto flex-shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide lg:px-[calc(var(--u)*8)] lg:text-[length:max(9px,calc(var(--u)*10))]">
                      {t('common.soon')}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/** The footer pill — Suggestion Box: the design's 228×44 dark pill. */
const RAIL_BUTTON =
  'flex h-[calc(var(--u)*44)] w-full min-w-0 items-center justify-center gap-[calc(var(--u)*6)] rounded-[calc(var(--u)*34)] border border-[#1b1f29] bg-[#0e1218] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4] transition-colors hover:text-white';

const RailButton: FC<{
  icon: StaticImageData;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, collapsed, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-haspopup="dialog"
    className={RAIL_BUTTON}
  >
    <img src={icon.src} alt="" className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]" />
    <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
  </button>
);

/* ==================================================================== */
/* The rail                                                              */
/* ==================================================================== */

/**
 * Category rail, as the design draws it: a 260px dark glass panel floating
 * down the left from the top of the page — the bar sits beside it, not above.
 *
 * Casino and Sports sit up top as the two site sections, then the
 * welcome-package teaser, then the menu in a list that scrolls on its own
 * (the Casino Manager sheet's "Final" order, with the expandable groups from
 * constants/railMenu), and the socials and contact pills pinned at the foot.
 * Language stays in the top bar, and beside search on a phone. Sports pages swap the casino's rows for the Sportsbook group.
 *
 * Sized in `--u` (see PlayerLayout), so it shrinks with the page on a
 * narrower desktop; on a phone it is the slide-in drawer at its design size.
 */
const PlayerSidebar: FC<Props> = ({ open, onClose, collapsed }) => {
  const { pathname, asPath, push } = useRouter();
  const socialLinks = useSocialLinks();
  const { token } = useAuth();
  const openSupport = useOpenSupport();
  const { t } = useTranslation();
  const {
    rewards: rewardsOn,
    promotions: promotionsOn,
    referrals: referralsOn,
  } = usePlatformFeatures();
  const { openLogin, openRegister } = useAuthModal();
  const { theme, applyTheme } = useTheme();
  const { updateMe } = useMe();
  const [suggesting, setSuggesting] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // The phone panel opens 14 under the bar, whatever height the bar is.
  const [menuTop, setMenuTop] = useState(80);

  useEffect(() => {
    if (!open) return undefined;
    const place = (): void => {
      const bar = document.querySelector('header');
      if (bar) setMenuTop(Math.round(bar.getBoundingClientRect().bottom) + 14);
    };
    place();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('resize', place);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const casinoActive =
    pathname === '/casino' || pathname === '/live-casino' || pathname.startsWith('/game');
  const sportsActive = pathname.startsWith('/sports');
  const currentPath = asPath.split(/[?#]/)[0];

  // A group the player has not opened or closed starts open when it holds the
  // current page. The sportsbook opens on every visit to the sports pages and
  // is not remembered, so the player always lands on the sports list.
  const [openGroups, setOpenGroups] = useState<Partial<Record<RailGroupId, boolean>>>({});
  useEffect(() => {
    try {
      setOpenGroups(JSON.parse(localStorage.getItem(RAIL_OPEN_KEY) ?? '{}'));
    } catch {
      // A blocked or garbled store just means every group starts at its default.
    }
  }, []);
  const [sportsOpen, setSportsOpen] = useState(true);
  useEffect(() => {
    if (sportsActive) setSportsOpen(true);
  }, [sportsActive]);
  const groupOpen = (id: RailGroupId): boolean =>
    id === 'sports'
      ? sportsOpen
      : (openGroups[id] ?? RAIL_GROUPS[id].items.some((item) => item.href === currentPath));
  const toggleGroup = (id: RailGroupId): void => {
    if (id === 'sports') {
      setSportsOpen((open) => !open);
      return;
    }
    const next = { ...openGroups, [id]: !groupOpen(id) };
    setOpenGroups(next);
    try {
      localStorage.setItem(RAIL_OPEN_KEY, JSON.stringify(next));
    } catch {
      // Not remembered this time; the toggle still applies.
    }
  };

  const icon = (src: StaticImageData): ReactNode => <Glyph src={src.src} size={24} />;

  const groupIcons: Record<RailGroupId, StaticImageData> = {
    originals: originalsIcon,
    casino: casinoIcon,
    live: liveIcon,
    sports: sportsIcon,
  };
  const groupRow = (id: RailGroupId): ReactNode => (
    <RailGroupRow
      key={id}
      group={RAIL_GROUPS[id]}
      icon={icon(groupIcons[id])}
      open={groupOpen(id)}
      onToggle={() => toggleGroup(id)}
      currentPath={currentPath}
      onNavigate={onClose}
      collapsed={collapsed}
    />
  );

  return (
    <>
      {/* On a phone this is the design's menu panel: full width, 14 under the
          bar (which stays in view), rounded at the top, sliding up from the
          foot; the tab bar floats over it. Its glass is the design's dark
          one — near opaque, so the page under it does not show through. From
          lg it is the sticky rail. */}
      <aside
        className={`rl-glass-deep fixed inset-x-0 bottom-0 top-[var(--menu-top)] z-[29] flex flex-shrink-0 flex-col overflow-hidden rounded-t-[34px] transition-[transform,width] max-lg:![background:rgba(17,18,22,0.97)] duration-300 lg:![background:linear-gradient(rgba(255,255,255,0.06),rgba(255,255,255,0.06)),rgba(0,0,0,0.6)] lg:![backdrop-filter:blur(6px)] lg:![-webkit-backdrop-filter:blur(6px)] lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-[calc(var(--u)*20)] lg:z-[26] lg:h-[min(calc(var(--u)*824),calc(100vh-var(--u)*40))] lg:w-[var(--rail)] lg:translate-y-0 lg:overflow-visible lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*16)] ${
          open ? 'translate-y-0' : 'max-lg:invisible max-lg:translate-y-full'
        }`}
        style={{ '--menu-top': `${menuTop}px` } as CSSProperties}
        aria-label={t('nav.games')}
      >
        {/* A phone scrolls this, not the panel: a scrolling panel with
            rounded glass left a stray edge where its first screen ended. From
            lg the wrapper drops out and the rail lays out as before. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-28 pt-6 lg:contents">
          {/* --- Phone: search and language -------------------------------- */}
          <div className="flex flex-shrink-0 items-center gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSearching(true)}
              aria-label={t('search.title')}
              className="rl-glass-btn flex h-12 min-w-0 flex-1 items-center rounded-full px-3"
            >
              <img src={searchGlyph.src} alt="" className="h-6 w-6" />
            </button>
            <div className="[&>div>button]:!h-12 [&>div>button]:!w-12 [&>div>button>img]:!h-6 [&>div>button>img]:!w-6">
              <LanguagePicker iconOnly menuAlign="end" />
            </div>
          </div>

          {/* --- Phone: Casino and Sports ----------------------------------- */}
          <div className="mt-[18px] grid flex-shrink-0 grid-cols-2 gap-2 lg:hidden">
            <PhoneSectionCard
              href="/casino"
              label={t('nav.casino')}
              art={casinoCardArt.src}
              artClassName="left-[88px] -top-3 w-[119px]"
              active={casinoActive}
              onClick={onClose}
            />
            <PhoneSectionCard
              href="/sports"
              label={t('nav.sports')}
              art={sportsCardArt.src}
              artClassName="left-[117px] top-1 w-[88px]"
              active={sportsActive}
              onClick={onClose}
            />
          </div>

          {/* --- Section switch ------------------------------------------- */}
          {/* `overflow-hidden` keeps the renders' glow inside the switch, as the
            design draws it: on a scaled-down rail the label stops at its type
            floor and pushes the art up, and the glow would otherwise spill
            over the switch's top edge. No backdrop blur of its own: it sits on
            the rail's glass, which already blurs, and a second blur nested in
            the first was flickering under Chrome's GPU compositor. */}
          <div
            className={`rl-liquid hidden h-[calc(var(--u)*90)] flex-shrink-0 gap-0 overflow-hidden rounded-[calc(var(--u)*24)] p-[calc(var(--u)*3)] ![-webkit-backdrop-filter:none] ![backdrop-filter:none] lg:flex ${
              collapsed ? 'lg:h-auto lg:flex-col' : ''
            }`}
          >
            <SectionTab
              href="/casino"
              art={casinoArt.src}
              glow="rgba(170,20,20,0.4)"
              label={t('nav.casino')}
              active={casinoActive}
              collapsed={collapsed}
              onClick={onClose}
            />
            <SectionTab
              href="/sports"
              art={sportsArt.src}
              glow="rgba(22,163,53,0.4)"
              label={t('nav.sports')}
              active={sportsActive}
              collapsed={collapsed}
              onClick={onClose}
            />
          </div>

          {/* --- Welcome package ------------------------------------------ */}
          <button
            type="button"
            onClick={() => {
              onClose();
              // Signed in, the offer lives on the bonuses page.
              if (token) void push('/bonuses');
              else openRegister();
            }}
            title={t('lobby.rail.welcomeTitle', { amount: '$1,500', count: 100 })}
            className={`mt-[18px] flex flex-shrink-0 flex-col gap-1.5 rounded-[24px] bg-[#1b1f29] px-4 pb-[15px] pt-[18px] text-start lg:mt-[calc(var(--u)*24)] lg:gap-[calc(var(--u)*6)] lg:rounded-[calc(var(--u)*16.25)] lg:px-[calc(var(--u)*16.25)] lg:py-[calc(var(--u)*17.5)] transition-colors hover:bg-[#222735] ${
              collapsed ? 'lg:items-center lg:px-0 lg:text-center' : ''
            }`}
          >
            {/* Collapsed, the rail is 76 wide and the amount does not fit: the
              package becomes a gold gift, like the rows below becoming their
              icons. The full offer stays in the title. */}
            {collapsed && (
              <GiftIcon
                size={24}
                className="hidden h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] text-[#ffe779] lg:block"
              />
            )}
            <span
              className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] uppercase leading-[calc(var(--u)*20)] text-[#9da2b4] ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              {t('lobby.rail.welcomePackage')}
            </span>
            <span
              className={`block text-[length:max(min(11px,28px),calc(var(--u)*28))] font-bold leading-[calc(var(--u)*36)] tracking-[-0.02em] text-[#f0f1f5] ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              $1,500
            </span>
            <span
              className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4] ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              {t('lobby.rail.freeSpins', { count: 100 })}
            </span>
          </button>

          {/* --- Shortcuts ------------------------------------------------- */}
          <nav className="scrollbar-none -mx-1 mt-[18px] flex flex-shrink-0 flex-col gap-2.5 px-1 lg:mt-[calc(var(--u)*12)] lg:min-h-0 lg:flex-1 lg:flex-shrink lg:gap-[calc(var(--u)*4)] lg:overflow-y-auto">
            {/* Each section keeps its own menu: sports pages list the
                sportsbook, every other page the casino's rows. The rows
                after the casino's are shared. */}
            {sportsActive && groupRow('sports')}
            <RailLink
              href="/rolluck-oath"
              active={pathname === '/rolluck-oath'}
              icon={icon(oathIcon)}
              onClick={onClose}
              collapsed={collapsed}
            >
              {t('nav.rolluckOath')}
            </RailLink>
            {!sportsActive && (
              <>
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
                {groupRow('originals')}
                {groupRow('casino')}
                {groupRow('live')}
              </>
            )}
            {/* <RailLink
            onSelect={() => setThemeOpen(true)}
            active={false}
            icon={icon(themeIcon)}
            onClick={onClose}
            collapsed={collapsed}
          >
            {t('nav.theme')}
          </RailLink> */}
            <RailLink
              href="/vip-club"
              active={pathname === '/vip-club'}
              icon={icon(vipIcon)}
              onClick={onClose}
              collapsed={collapsed}
            >
              {t('nav.vipClub')}
            </RailLink>
            {!sportsActive && (
              <RailLink
                href="/tournaments"
                active={pathname === '/tournaments'}
                icon={icon(tournamentsIcon)}
                onClick={onClose}
                collapsed={collapsed}
              >
                {t('nav.tournaments')}
              </RailLink>
            )}
            {promotionsOn && (
              <RailLink
                href="/promotions"
                active={pathname === '/promotions'}
                icon={icon(promotionIcon)}
                onClick={onClose}
                collapsed={collapsed}
              >
                {t('nav.promotions')}
              </RailLink>
            )}
            <RailLink
              href="/bonuses"
              active={pathname === '/bonuses'}
              icon={icon(bonusesIcon)}
              onClick={onClose}
              collapsed={collapsed}
            >
              {t('nav.bonuses')}
            </RailLink>

            {/* Built features the design's list leaves out, kept at the end and
              below its fold so nothing becomes unreachable. Neither has a
              `nav-*.svg` beside the rows above, because the design never drew
              them a row — they take a line icon at the same 24 box instead.

              Rewards and Referral are hidden while switched off
              platform-wide, since their pages render nothing in that state. */}
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
            {referralsOn && (
              <RailLink
                href="/referral"
                active={pathname === '/referral'}
                icon={
                  <span className="flex h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] flex-shrink-0 items-center justify-center">
                    <HandshakeIcon size={18} strokeWidth={1.6} />
                  </span>
                }
                onClick={onClose}
                collapsed={collapsed}
              >
                {t('aff.title')}
              </RailLink>
            )}
            <RailLink
              onSelect={openSupport}
              active={false}
              icon={icon(supportIcon)}
              onClick={onClose}
              collapsed={collapsed}
            >
              {t('lobby.rail.liveSupport')}
            </RailLink>
          </nav>

          {/* --- Socials and contact pills --------------------------------- */}
          <div className="mt-[67px] flex-shrink-0 border-t border-white/[0.08] pt-4 lg:mt-0 lg:border-0 lg:pt-[calc(var(--u)*13)]">
            {socialLinks.length > 0 && (
              <div
                className={`flex items-center justify-center gap-3.5 lg:gap-[calc(var(--u)*18)] lg:py-[calc(var(--u)*6)] ${
                  collapsed ? 'lg:flex-col' : ''
                }`}
              >
                {socialLinks.map(({ icon: mark, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-7 w-7 items-center justify-center p-0.5 transition-transform hover:-translate-y-0.5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)] lg:p-0"
                  >
                    <img src={mark.src} alt="" className="h-full w-full" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-5 lg:mt-[calc(var(--u)*11)]">
              <RailButton
                icon={suggestionIcon}
                label={t('lobby.rail.suggestionBox')}
                // Suggestions are tied to an account, so a guest signs in first.
                onClick={() => (token ? setSuggesting(true) : openLogin())}
                collapsed={collapsed}
              />
            </div>
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
      <SuggestionModal open={suggesting} onClose={() => setSuggesting(false)} />
      {searching && (
        <GameSearchModal
          onClose={() => {
            setSearching(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default PlayerSidebar;
