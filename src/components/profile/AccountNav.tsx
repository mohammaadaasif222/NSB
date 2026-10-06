import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { IconProps } from '@/components/icons';
import {
  RailArrowUpRightIcon,
  RailBadgeCheckIcon,
  RailBarChartIcon,
  RailGiftIcon,
  RailHelpCircleIcon,
  RailLogOutIcon,
  RailShieldCheckIcon,
  RailSlidersIcon,
  RailTransactionsIcon,
  RailUserIcon,
} from './accountNavIcons';
import type { TranslationKey } from '@/i18n/locales';

/** The account area's sections, in nav order. */
export const ACCOUNT_SECTIONS = [
  { key: 'profile', labelKey: 'account.profile', icon: RailUserIcon },
  { key: 'statistic', labelKey: 'profile.statistic', icon: RailBarChartIcon },
  { key: 'preferences', labelKey: 'profile.preferences', icon: RailSlidersIcon },
  { key: 'referral', labelKey: 'profile.referral', icon: RailGiftIcon },
  { key: 'security', labelKey: 'profile.security', icon: RailShieldCheckIcon },
  { key: 'verification', labelKey: 'profile.verification', icon: RailBadgeCheckIcon },
  { key: 'transactions', labelKey: 'profile.transactions', icon: RailTransactionsIcon },
  { key: 'help', labelKey: 'profile.helpCentre', icon: RailHelpCircleIcon },
] as const satisfies readonly { key: string; labelKey: TranslationKey; icon: FC<IconProps> }[];

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number]['key'];

export const isAccountSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && ACCOUNT_SECTIONS.some((s) => s.key === value);

/* Every row in the rail is this pill; only the surface and the ink change.
   48px tall on 24px of side padding with a 10px gap to the label, per the
   design — the icon is drawn at its full 24px rather than shrunk to sit
   closer. */
const PILL = 'relative flex w-full items-center gap-2.5 whitespace-nowrap px-6 text-base leading-6';

/* The rail's three inks. The resting grey and the selected gold are the
   design's own tokens (Gray 4 and Primary 2); Log out leaves the area rather
   than switching within it, so it carries the brighter Gray 6 White. */
const INK_RESTING = 'text-[#9da2b4]';
const INK_SELECTED = 'text-[#ffe779]';
const INK_LEAVING = 'text-[#f0f1f5]';

interface Props {
  active: AccountSection;
  onSelect: (section: AccountSection) => void;
  onLogout: () => void;
}

/**
 * The account area's left-hand nav.
 *
 * A horizontal scroller below `lg` — a phone has no room for a fixed column,
 * and stacking nine rows above the content would push the panel off-screen.
 */
const AccountNav: FC<Props> = ({ active, onSelect, onLogout }) => {
  const { t } = useTranslation();

  // `min-w-0` below is load-bearing under the breakpoint: the row of tabs is an
  // `overflow-x-auto` flex, and a grid item's automatic minimum is its
  // min-content — so without it the nav reports the full width of all nine tabs,
  // the grid column grows to match, and the whole account page scrolls sideways
  // by a few hundred pixels instead of the tab strip scrolling inside itself.
  return (
    <nav className="flex min-w-0 flex-col gap-[14px] lg:h-full" aria-label={t('profile.account')}>
      <h2 className="hidden px-1 text-lg font-normal text-white/80 lg:block">
        {t('profile.account')}
      </h2>

      <ul className="scrollbar-none flex gap-[14px] overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {ACCOUNT_SECTIONS.map(({ key, labelKey, icon: Icon }) => {
          const selected = key === active;
          return (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-current={selected ? 'page' : undefined}
                className={`${PILL} h-12 ${
                  selected
                    ? `rl-rail-row-active font-medium ${INK_SELECTED}`
                    : `rl-rail-row hover:rl-rail-row-active font-normal ${INK_RESTING} hover:font-medium hover:text-[#ffe779]`
                }`}
              >
                <Icon size={24} className="shrink-0" />
                {t(labelKey)}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Set apart from the sections above it — it leaves the area rather than
          switching within it. Desktop only; phones get it under the panel. */}
      <button
        type="button"
        onClick={onLogout}
        className={`${PILL} rl-rail-row hover:rl-rail-row-active hidden h-12 font-normal ${INK_LEAVING} hover:font-medium hover:text-[#ffe779] lg:flex`}
      >
        <RailLogOutIcon size={24} className="shrink-0" />
        {t('account.logout')}
        {/* Pinned rather than pushed by `ms-auto`: the design hangs it 12px off
            the right edge, inside the 24px the label is padded to. */}
        <RailArrowUpRightIcon size={24} className="absolute end-3 top-1/2 -translate-y-1/2" />
      </button>
    </nav>
  );
};

export default AccountNav;
