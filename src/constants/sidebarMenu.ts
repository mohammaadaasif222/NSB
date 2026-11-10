import oathIcon from '@/assets/lobby/rail/nav-oath.svg';
import recentIcon from '@/assets/lobby/rail/nav-recent.svg';
import favouritesIcon from '@/assets/lobby/rail/nav-favourites.svg';
import originalsIcon from '@/assets/lobby/rail/nav-originals.svg';
import casinoIcon from '@/assets/lobby/rail/tab-casino.svg';
import sportsIcon from '@/assets/lobby/rail/tab-sports.svg';
import liveIcon from '@/assets/lobby/player/chip-live.svg';
import vipIcon from '@/assets/lobby/rail/nav-vip.svg';
import tournamentsIcon from '@/assets/lobby/rail/nav-tournaments.svg';
import promotionIcon from '@/assets/lobby/rail/nav-promotion.svg';
import bonusesIcon from '@/assets/lobby/rail/nav-bonuses.svg';
import supportIcon from '@/assets/lobby/rail/tab-chat.svg';
import { CoinIcon, HandshakeIcon } from '@/components/icons';
import type { SidebarIcon } from '@/components/sidebar/iconRegistry';
import type { Locale } from '@/i18n/locales';
import { RAIL_GROUPS, type RailGroup, type RailGroupId } from '@/constants/railMenu';

/** Client actions a row can run instead of navigating. Mirrors the backend's SIDEBAR_ACTIONS. */
export const SIDEBAR_ACTIONS = ['openSupport', 'openSearch', 'openSuggestions'] as const;
export type SidebarAction = (typeof SIDEBAR_ACTIONS)[number];

/** Which pages show an entry: both, the casino pages, or the sports pages. */
export type SidebarSection = 'all' | 'casino' | 'sports';

/** A row of the side menu, as the rail draws it. */
export interface SidebarItem {
  /** Unique within the menu: the row's database id, or a built-in key. */
  id: string;
  /** i18n key for built-in rows. */
  labelKey?: string;
  /** The literal label an operator typed; overrides the key when set. */
  label?: string;
  /** Per-locale labels, checked first. */
  labelTranslations?: Partial<Record<Locale, string>>;
  icon?: SidebarIcon;
  /** No href and no action: drawn as "Soon". */
  href?: string;
  action?: SidebarAction;
  requireAuth?: boolean;
  /** A PlatformFeatures key; the row hides while it is false. */
  featureFlag?: string;
  section: SidebarSection;
}

/**
 * A group of rows. `group` draws an expandable row with its items listed
 * under it; `flat` draws the items as top-level rows with no header.
 */
export interface SidebarGroup {
  id: string;
  titleKey?: string;
  title?: string;
  icon?: SidebarIcon;
  /** Where the icon goes on the collapsed rail. */
  href?: string;
  layout: 'group' | 'flat';
  section: SidebarSection;
  items: SidebarItem[];
}

/**
 * A group's title key → its built-in id, so a database group that is one of
 * the built-in four keeps the open/closed state the player left it in (and
 * Originals keeps its own click sound).
 */
export const RAIL_ID_BY_TITLE_KEY: Record<string, RailGroupId> = Object.fromEntries(
  (Object.values(RAIL_GROUPS) as RailGroup[]).map((g) => [g.labelKey, g.id])
);

/**
 * Routes whose page is switched off by a platform feature. Checked as well as
 * a row's own `featureFlag`, so a switch hides its page's row even when an
 * operator created that row without setting the flag.
 */
export const ROUTE_FEATURE_FLAGS: Record<string, string> = {
  '/promotions': 'promotions',
  '/rewards': 'rewards',
  '/referral': 'referrals',
};

const glyph = (asset: { src: string }): SidebarIcon => ({ kind: 'glyph', src: asset.src });

const fromRail = (id: RailGroupId, icon: SidebarIcon, section: SidebarSection): SidebarGroup => {
  const rail = RAIL_GROUPS[id];
  return {
    id,
    titleKey: rail.labelKey,
    icon,
    href: rail.href,
    layout: 'group',
    section,
    items: rail.items.map((item) => ({
      id: `${id}:${item.labelKey}`,
      labelKey: item.labelKey,
      icon: item.icon ? glyph(item.icon) : undefined,
      href: item.href,
      section: 'all',
    })),
  };
};

const row = (
  id: string,
  labelKey: string,
  icon: SidebarIcon,
  extra: Partial<SidebarItem> = {}
): SidebarItem => ({ id, labelKey, icon, section: 'all', ...extra });

/**
 * The built-in side menu: what the rail draws when the menu API fails or
 * returns nothing. The backend migration (20261205090000_sidebar_menus) seeds
 * the same tree, so the console starts from exactly this.
 */
export const DEFAULT_SIDEBAR_MENU: SidebarGroup[] = [
  fromRail('sports', glyph(sportsIcon), 'sports'),
  {
    id: 'top',
    title: 'Top shortcuts',
    layout: 'flat',
    section: 'all',
    items: [
      row('oath', 'nav.rolluckOath', glyph(oathIcon), { href: '/rolluck-oath' }),
      row('recents', 'nav.recents', glyph(recentIcon), { href: '/recents', section: 'casino' }),
      row('favourites', 'nav.favourites', glyph(favouritesIcon), {
        href: '/favourites',
        section: 'casino',
      }),
    ],
  },
  fromRail('originals', glyph(originalsIcon), 'casino'),
  fromRail('casino', glyph(casinoIcon), 'casino'),
  fromRail('live', glyph(liveIcon), 'casino'),
  {
    id: 'more',
    title: 'More',
    layout: 'flat',
    section: 'all',
    items: [
      row('vip', 'nav.vipClub', glyph(vipIcon), { href: '/vip-club' }),
      row('tournaments', 'nav.tournaments', glyph(tournamentsIcon), {
        href: '/tournaments',
        section: 'casino',
      }),
      row('promotions', 'nav.promotions', glyph(promotionIcon), {
        href: '/promotions',
        featureFlag: 'promotions',
      }),
      row('bonuses', 'nav.bonuses', glyph(bonusesIcon), { href: '/bonuses' }),
      row(
        'rewards',
        'nav.rewards',
        { kind: 'line', Icon: CoinIcon },
        {
          href: '/rewards',
          featureFlag: 'rewards',
        }
      ),
      row(
        'referral',
        'aff.title',
        { kind: 'line', Icon: HandshakeIcon },
        {
          href: '/referral',
          featureFlag: 'referrals',
        }
      ),
      row('support', 'lobby.rail.liveSupport', glyph(supportIcon), { action: 'openSupport' }),
    ],
  },
];

/* Fixed blocks -------------------------------------------------------- */

/**
 * A fixed block of the rail (not a menu row): it keeps its design position and
 * can only be switched off or have its text changed in the console.
 */
export interface SidebarBlock {
  enabled: boolean;
  /** Overrides the built-in label; blank keeps it translated. */
  label?: string;
  labelTranslations?: Partial<Record<Locale, string>>;
  /** Welcome card: the figure shown when there is no live welcome offer. */
  amount?: string;
  /** Welcome card: the small print; blank keeps "+ 100 free spins". */
  note?: string;
}

export interface SidebarBlocks {
  /** The Welcome Package card at the top of the rail. */
  welcome: SidebarBlock;
  /** The social icons at the foot (links from CRM -> Social links). */
  socials: SidebarBlock;
  /** The Suggestion Box button at the foot. */
  suggestion: SidebarBlock;
}

/** The blocks as the rail draws them today; the migration seeds the same. */
export const DEFAULT_SIDEBAR_BLOCKS: SidebarBlocks = {
  welcome: { enabled: true, amount: '$1,500' },
  socials: { enabled: true },
  suggestion: { enabled: true },
};
