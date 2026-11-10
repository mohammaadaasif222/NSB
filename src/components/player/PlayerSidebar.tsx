import { showsWelcomeOffer, useWelcomeOffer } from '@/hooks/useWelcomeOffer';
import { useEffect, useState, type CSSProperties, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import casinoArt from '@/assets/lobby/rail/rail-casino.webp';
import sportsArt from '@/assets/lobby/rail/rail-sports.webp';
import casinoCardArt from '@/assets/casino-roulette-mobile.webp';
import sportsCardArt from '@/assets/sports-ball-glass-mobile.webp';
import searchGlyph from '@/assets/lobby/rail/bar-search.svg';
import chevronGlyph from '@/assets/lobby/rail/bar-chevron.svg';
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
import { RAIL_OPEN_KEY } from '@/constants/railMenu';
import {
  DEFAULT_SIDEBAR_MENU,
  RAIL_ID_BY_TITLE_KEY,
  routeFeatureFlag,
  type SidebarAction,
  type SidebarGroup,
  type SidebarItem,
  type SidebarSection,
} from '@/constants/sidebarMenu';
import type { SidebarIcon } from '@/components/sidebar/iconRegistry';
import { EN_DICTIONARY, type TranslationKey } from '@/i18n/locales';
import { GiftIcon } from '@/components/icons';
import SuggestionModal from '@/components/suggestion/SuggestionModal';
import GameSearchModal from '@/components/player/GameSearchModal';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useSidebarMenus } from '@/hooks/useSidebarMenus';

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
        ? 'rl-drop rl-diag-rim relative [--tw-inset-shadow:var(--rl-drop-depth)]! [--rim-radius:calc(var(--u)*24)] [--rim-clear:48px] [--rim-fade:120px] [--rim-color:rgba(255,255,255,0.35)] bg-white/[0.12] text-white hover:bg-white/[0.16]'
        : 'text-[#d5d8e2] hover:bg-white/[0.06] hover:text-white'
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
      className={`text-[length:max(min(11px,14px),calc(var(--u)*14))] font-semibold leading-[calc(var(--u)*20)] ${
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
  'flex h-12 w-full flex-shrink-0 items-center gap-2.5 rounded-full px-6 text-[16px] leading-6 transition-colors max-lg:shadow-[0_8px_40px_rgba(0,0,0,0.12)] lg:h-[calc(var(--u)*44)] lg:gap-[calc(var(--u)*11)] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*15)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)] font-medium';
/* The current row wears every pill's rim: whitish on the diagonal, clear
   round the top-end and bottom-start corners (`rl-pill-rim`). */
const ROW_ACTIVE = 'rl-drop rl-pill-rim relative bg-white/10 font-semibold text-white';
const ROW_IDLE =
  'text-[#d5d8e2] max-lg:bg-white/5 hover:bg-white/5 hover:text-white max-lg:hover:bg-white/10';

/**
 * A menu entry's icon in a `size` design-pixel box: a masked glyph that takes
 * the row's colour, a line icon, or an operator's upload drawn as-is (fixed
 * box, `object-contain`, so any upload size is safe). No icon keeps the box
 * empty, so labels still line up.
 */
const MenuIcon: FC<{ icon?: SidebarIcon; size: number }> = ({ icon, size }) => {
  const box: CSSProperties = { width: `calc(var(--u)*${size})`, height: `calc(var(--u)*${size})` };
  if (!icon) return <span aria-hidden="true" className="flex-shrink-0" style={box} />;
  if (icon.kind === 'glyph') return <Glyph src={icon.src} size={size} />;
  if (icon.kind === 'image') {
    return <img src={icon.src} alt="" className="flex-shrink-0 object-contain" style={box} />;
  }
  const { Icon } = icon;
  return (
    <span className="flex flex-shrink-0 items-center justify-center" style={box}>
      <Icon size={Math.round(size * 0.75)} strokeWidth={1.6} />
    </span>
  );
};

const SOON_BADGE =
  'ms-auto flex-shrink-0 rounded-full bg-[#ffe779]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ffe779] lg:px-[calc(var(--u)*8)] lg:text-[length:max(9px,calc(var(--u)*10))]';

interface RailLinkProps {
  href?: string;
  onSelect?: () => void;
  /** Set to the "Soon" text for a row with nowhere to go yet: drawn disabled. */
  soonLabel?: string;
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
  soonLabel,
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

  if (soonLabel) {
    return (
      <span
        aria-disabled="true"
        title={`${String(children)} — ${soonLabel}`}
        className={`${ROW} ${collapsed ? 'lg:justify-center lg:px-[calc(var(--u)*8)]' : ''} cursor-default text-[#9da2b4]/80 max-lg:bg-white/5`}
      >
        {body}
        <span className={`${SOON_BADGE} ${collapsed ? 'lg:hidden' : ''}`}>{soonLabel}</span>
      </span>
    );
  }

  if (onSelect) {
    return (
      <button
        type="button"
        data-sound="sideIconsLikeFavourites"
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
      data-sound="sideIconsLikeFavourites"
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
  'flex h-10 w-full items-center gap-2 rounded-full ps-[58px] pe-6 text-[15px] leading-6 transition-colors lg:h-[calc(var(--u)*36)] lg:gap-[calc(var(--u)*8)] lg:rounded-[calc(var(--u)*34)] lg:ps-[calc(var(--u)*50)] lg:pe-[calc(var(--u)*15)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)] font-medium';

/**
 * An expandable rail group (Originals, Casino, Live Casino, Sportsbook, or one
 * an operator made): the row toggles its list, and a row with nowhere to go
 * yet shows "Soon". The collapsed rail has no room for the list, so there the
 * icon links to the group's own page instead.
 */
const RailGroupRow: FC<{
  group: SidebarGroup;
  label: string;
  itemText: (item: SidebarItem) => string;
  onAction: (action: SidebarAction) => void;
  /** Original games (Dice, Limbo…) have their own sound; other groups' rows click generically. */
  sound?: string;
  open: boolean;
  onToggle: () => void;
  currentPath: string;
  onNavigate: () => void;
  collapsed: boolean;
}> = ({
  group,
  label,
  itemText,
  onAction,
  sound,
  open,
  onToggle,
  currentPath,
  onNavigate,
  collapsed,
}) => {
  const { t } = useTranslation();
  const icon = <MenuIcon icon={group.icon} size={24} />;
  // Lit by its rows only: the section switch above already marks /casino and /sports.
  const active = group.items.some((item) => item.href === currentPath);
  // A row without an icon keeps the empty column, so every label in the group lines up.
  const hasIcons = group.items.some((item) => item.icon);
  const itemIcon = (item: SidebarItem): ReactNode =>
    hasIcons && <MenuIcon icon={item.icon} size={20} />;
  const railHref = group.href ?? group.items.find((item) => item.href)?.href ?? '#';
  const idle = 'text-[#c9cdd9] hover:bg-white/5 hover:text-white';

  return (
    <div className="flex flex-shrink-0 flex-col gap-1 lg:gap-[calc(var(--u)*2)]">
      {collapsed && (
        <Link
          href={railHref}
          data-sound={sound}
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
        data-sound="sideIconsLikeFavourites"
        onClick={onToggle}
        aria-expanded={open}
        className={`${ROW} ${active && !open ? ROW_ACTIVE : ROW_IDLE} ${collapsed ? 'lg:hidden' : ''}`}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-start">{label}</span>
        <Glyph
          src={chevronGlyph.src}
          size={16}
          className={`opacity-90 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul
          className={`flex flex-col gap-1 lg:gap-[calc(var(--u)*2)] ${collapsed ? 'lg:hidden' : ''}`}
        >
          {group.items.map((item) => {
            const text = itemText(item);
            const current = Boolean(item.href) && item.href === currentPath;
            const { action } = item;
            return (
              <li key={item.id}>
                {action ? (
                  <button
                    type="button"
                    data-sound={sound}
                    onClick={() => {
                      onNavigate();
                      onAction(action);
                    }}
                    className={`${SUB_ROW} ${idle}`}
                  >
                    {itemIcon(item)}
                    <span className="truncate">{text}</span>
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    data-sound={sound}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className={`${SUB_ROW} ${current ? 'bg-white/10 font-semibold text-white' : idle}`}
                  >
                    {itemIcon(item)}
                    <span className="truncate">{text}</span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title={`${text} — ${t('common.soon')}`}
                    className={`${SUB_ROW} cursor-default text-[#9da2b4]/80`}
                  >
                    {itemIcon(item)}
                    <span className="truncate">{text}</span>
                    <span className={SOON_BADGE}>{t('common.soon')}</span>
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
  'flex h-[calc(var(--u)*44)] w-full min-w-0 items-center justify-center gap-[calc(var(--u)*6)] rounded-[calc(var(--u)*34)] border border-[#1b1f29] bg-[#0e1218] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] font-medium text-[#e3e6ee] transition-colors hover:border-[#2c3242] hover:text-white';

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
 * Category rail: a 280px dark glass panel (76 collapsed, to its icons) floating
 * down the left from the top of the page — the bar sits beside it, not above.
 *
 * Casino and Sports sit up top as the two site sections, then the
 * welcome-package teaser, then the menu in a list that scrolls on its own
 * (the Casino Manager sheet's "Final" order, with the expandable groups from
 * constants/railMenu), and the socials and contact pills pinned at the foot.
 * Language stays in the top bar, on a phone as on desktop. Sports pages swap the casino's rows for the Sportsbook group.
 *
 * Sized in `--u` (see PlayerLayout), so it shrinks with the page on a
 * narrower desktop; on a phone it is the slide-in drawer at its design size.
 */
const PlayerSidebar: FC<Props> = ({ open, onClose, collapsed }) => {
  const { pathname, asPath, push } = useRouter();
  const socialLinks = useSocialLinks();
  const { token } = useAuth();
  const openSupport = useOpenSupport();
  const { t, locale } = useTranslation();
  const features = usePlatformFeatures();
  // The menu written in CRM -> Sidebar menus (null groups: the built-in one),
  // and its fixed blocks: Welcome card, social icons, Suggestion Box.
  const { groups: dbGroups, blocks } = useSidebarMenus();
  const { openLogin, openRegister } = useAuthModal();
  const { offer: welcomeCandidate } = useWelcomeOffer();
  const welcomeOffer = showsWelcomeOffer(welcomeCandidate) ? welcomeCandidate : null;
  const welcomePercent = welcomeOffer
    ? Math.max(...welcomeOffer.options.map((option) => option.match_percentage))
    : 0;
  // The Welcome card: a live offer's own texts, otherwise the console's (with
  // the built-in translations for blank ones). With no offer and no amount
  // there is nothing to advertise, so the card stays away.
  const welcomeBlock = blocks.welcome;
  const welcomeAmount = welcomeBlock.amount?.trim() ?? '';
  const showWelcome = welcomeBlock.enabled && (Boolean(welcomeOffer) || welcomeAmount !== '');
  const welcomeHeading =
    welcomeBlock.labelTranslations?.[locale]?.trim() ||
    welcomeBlock.label?.trim() ||
    t('lobby.rail.welcomePackage');
  const welcomeNote = welcomeBlock.note?.trim() || t('lobby.rail.freeSpins', { count: 100 });
  const suggestionLabel =
    blocks.suggestion.labelTranslations?.[locale]?.trim() ||
    blocks.suggestion.label?.trim() ||
    t('lobby.rail.suggestionBox');
  const { theme, applyTheme } = useTheme();
  const { updateMe } = useMe();
  const [suggesting, setSuggesting] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // The phone panel opens right under the bar, whatever height the bar is.
  const [menuTop, setMenuTop] = useState(80);

  useEffect(() => {
    if (!open) return undefined;
    const place = (): void => {
      const bar = document.querySelector('header');
      if (bar) setMenuTop(Math.round(bar.getBoundingClientRect().bottom));
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

  /* --- The menu: from the console, or the built-in one ------------------ */

  const known = (key: string | undefined): key is TranslationKey =>
    Boolean(key) && Object.prototype.hasOwnProperty.call(EN_DICTIONARY, key as string);
  /**
   * The player's language first, then the operator's literal text (which
   * overrides a built-in label), then the built-in translation, then the key.
   */
  const resolveText = (
    translations: Partial<Record<string, string>> | undefined,
    literal: string | undefined,
    key: string | undefined
  ): string =>
    translations?.[locale]?.trim() || literal?.trim() || (known(key) ? t(key) : '') || key || '';
  const itemText = (item: SidebarItem): string =>
    resolveText(item.labelTranslations, item.label, item.labelKey);
  const groupText = (group: SidebarGroup): string =>
    resolveText(undefined, group.title, group.titleKey);

  const flagOff = (flag: string | undefined): boolean =>
    Boolean(flag) && (features as unknown as Record<string, unknown>)[flag as string] === false;
  const routeFlag = routeFeatureFlag;
  const inSection = (section: SidebarSection): boolean =>
    section === 'all' || (section === 'sports') === sportsActive;

  // Each section keeps its own menu: sports pages list the sportsbook, every
  // other page the casino's rows. Guests do not see sign-in-only rows, and a
  // row whose platform switch is off (its own flag or its route's) is hidden.
  const menuGroups = (dbGroups ?? DEFAULT_SIDEBAR_MENU)
    .filter((group) => inSection(group.section))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          inSection(item.section) &&
          !(item.requireAuth && !token) &&
          !flagOff(item.featureFlag) &&
          !flagOff(routeFlag(item.href))
      ),
    }))
    .filter((group) => group.items.length > 0);

  const runAction = (action: SidebarAction): void => {
    if (action === 'openSupport') openSupport();
    else if (action === 'openSearch') setSearching(true);
    // Suggestions are tied to an account, so a guest signs in first.
    else if (action === 'openSuggestions') {
      if (token) setSuggesting(true);
      else openLogin();
    }
  };

  // A group the player has not opened or closed starts open when it holds the
  // current page. The sportsbook opens on every visit to the sports pages and
  // is not remembered, so the player always lands on the sports list. The
  // built-in groups keep their ids (originals, casino, live) when they come
  // from the console, so what the player left open stays open.
  const openKey = (group: SidebarGroup): string =>
    (group.titleKey && RAIL_ID_BY_TITLE_KEY[group.titleKey]) || group.id;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
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
  const groupOpen = (group: SidebarGroup): boolean =>
    group.section === 'sports'
      ? sportsOpen
      : (openGroups[openKey(group)] ?? group.items.some((item) => item.href === currentPath));
  const toggleGroup = (group: SidebarGroup): void => {
    if (group.section === 'sports') {
      setSportsOpen((open) => !open);
      return;
    }
    const next = { ...openGroups, [openKey(group)]: !groupOpen(group) };
    setOpenGroups(next);
    try {
      localStorage.setItem(RAIL_OPEN_KEY, JSON.stringify(next));
    } catch {
      // Not remembered this time; the toggle still applies.
    }
  };

  const menuRows = menuGroups.map((group) =>
    group.layout === 'flat' ? (
      group.items.map((item) => {
        const { action } = item;
        return (
          <RailLink
            key={item.id}
            href={item.href}
            onSelect={action ? () => runAction(action) : undefined}
            soonLabel={!action && !item.href ? t('common.soon') : undefined}
            active={Boolean(item.href) && item.href === currentPath}
            icon={<MenuIcon icon={item.icon} size={24} />}
            onClick={onClose}
            collapsed={collapsed}
          >
            {itemText(item)}
          </RailLink>
        );
      })
    ) : (
      <RailGroupRow
        key={group.id}
        group={group}
        label={groupText(group)}
        itemText={itemText}
        onAction={runAction}
        sound={openKey(group) === 'originals' ? 'diceLimboLikeIcons(side)' : undefined}
        open={groupOpen(group)}
        onToggle={() => toggleGroup(group)}
        currentPath={currentPath}
        onNavigate={onClose}
        collapsed={collapsed}
      />
    )
  );

  return (
    <>
      {/* On a phone this is the menu: full width and flush under the bar
          (which stays in view), sliding up from the foot, on the stage's own
          colour with no rim or rounded top, so it reads as the site's menu
          rather than a sheet; the tab bar floats over it. From lg it is the
          sticky rail. */}
      <aside
        className={`rl-glass-deep rl-diag-rim [--rim-radius:34px] lg:[--rim-radius:calc(var(--u)*34)] [--rim-clear:80px] [--rim-fade:220px] [--tw-inset-shadow:var(--rl-tile-face)]! fixed inset-x-0 bottom-0 top-[var(--menu-top)] z-[29] flex flex-shrink-0 flex-col overflow-hidden transition-[transform,width] max-lg:![background:#07080a] max-lg:![box-shadow:none] max-lg:before:!hidden duration-300 lg:![background:linear-gradient(rgba(255,255,255,0.06),rgba(255,255,255,0.06)),rgba(0,0,0,0.6)] lg:![backdrop-filter:blur(6px)] lg:![-webkit-backdrop-filter:blur(6px)] lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-[calc(var(--u)*20)] lg:z-[26] lg:h-[calc(100vh-var(--u)*40)] lg:w-[var(--rail)] lg:translate-y-0 lg:overflow-visible lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*16)] ${
          open ? 'translate-y-0' : 'max-lg:invisible max-lg:translate-y-full'
        }`}
        style={{ '--menu-top': `${menuTop}px` } as CSSProperties}
        aria-label={t('nav.games')}
      >
        {/* A phone scrolls this, not the panel: a scrolling panel with
            rounded glass left a stray edge where its first screen ended. From
            lg the wrapper drops out and the rail lays out as before. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-28 pt-6 lg:contents">
          {/* --- Phone: search (language is in the top bar, above the drawer) - */}
          <div className="flex flex-shrink-0 items-center gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSearching(true)}
              aria-label={t('search.title')}
              className="rl-glass-btn flex h-12 min-w-0 flex-1 items-center rounded-full px-3"
            >
              <img src={searchGlyph.src} alt="" className="h-6 w-6" />
            </button>
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
            className={`rl-liquid rl-diag-rim [--rim-radius:calc(var(--u)*24)] [--rim-clear:48px] [--rim-fade:120px] [--tw-inset-shadow:var(--rl-tile-face)]! ![background:rgba(255,255,255,0.02)] hidden h-[calc(var(--u)*90)] flex-shrink-0 gap-0 overflow-hidden rounded-[calc(var(--u)*24)] p-[calc(var(--u)*3)] ![-webkit-backdrop-filter:none] ![backdrop-filter:none] lg:flex ${
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

          {/* --- Welcome package (CRM -> Sidebar menus, fixed blocks) ------ */}
          {showWelcome && (
            <button
              type="button"
              onClick={() => {
                onClose();
                // Signed in, the offer lives on the bonuses page.
                if (token) void push('/bonuses');
                else openRegister();
              }}
              title={
                welcomeOffer
                  ? t('welcome.bannerHeadline', { percent: welcomePercent })
                  : `${welcomeHeading}: ${welcomeAmount} ${welcomeNote}`
              }
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
                className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] font-semibold uppercase leading-[calc(var(--u)*20)] text-[#d5d8e2] ${
                  collapsed ? 'lg:hidden' : ''
                }`}
              >
                {welcomeOffer ? t('welcome.railLabel') : welcomeHeading}
              </span>
              <span
                className={`block text-[length:max(min(11px,28px),calc(var(--u)*28))] font-bold leading-[calc(var(--u)*36)] tracking-[-0.02em] text-[#f0f1f5] ${
                  collapsed ? 'lg:hidden' : ''
                }`}
              >
                {welcomeOffer
                  ? t('welcome.railAmount', { percent: welcomePercent })
                  : welcomeAmount}
              </span>
              <span
                className={`block text-[length:max(min(11px,14px),calc(var(--u)*14))] font-medium leading-[calc(var(--u)*20)] text-[#d5d8e2] ${
                  collapsed ? 'lg:hidden' : ''
                }`}
              >
                {welcomeOffer ? t('welcome.railNote') : welcomeNote}
              </span>
            </button>
          )}

          {/* --- Shortcuts ------------------------------------------------- */}
          <nav className="thin-scrollbar -mx-1 mt-[18px] flex flex-shrink-0 flex-col gap-2.5 px-1 lg:mt-[calc(var(--u)*12)] lg:min-h-0 lg:flex-1 lg:flex-shrink lg:gap-[calc(var(--u)*4)] lg:overflow-y-auto">
            {/* The console's menu (CRM -> Sidebar menus), or the built-in one
                (constants/sidebarMenu) when it has none or cannot be reached.
                Sports pages list the sportsbook, other pages the casino's rows;
                rows behind a switched-off platform feature are left out. */}
            {menuRows}
          </nav>

          {/* --- Socials and contact pills --------------------------------- */}
          <div className="mt-[67px] flex-shrink-0 border-t border-white/[0.08] pt-4 lg:mt-0 lg:border-0 lg:pt-[calc(var(--u)*13)]">
            {blocks.socials.enabled && socialLinks.length > 0 && (
              // Collapsed, the socials step aside so every menu row keeps its place on screen.
              <div
                className={`flex items-center justify-center gap-3.5 lg:gap-[calc(var(--u)*18)] lg:py-[calc(var(--u)*6)] ${
                  collapsed ? 'lg:hidden' : ''
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

            {blocks.suggestion.enabled && (
              <div className="mt-5 lg:mt-[calc(var(--u)*11)]">
                <RailButton
                  icon={suggestionIcon}
                  label={suggestionLabel}
                  // Suggestions are tied to an account, so a guest signs in first.
                  onClick={() => (token ? setSuggesting(true) : openLogin())}
                  collapsed={collapsed}
                />
              </div>
            )}
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
