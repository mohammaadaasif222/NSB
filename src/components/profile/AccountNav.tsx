import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import type { IconProps } from '@/components/icons';
import {
  RailArrowUpRightIcon,
  RailBadgeCheckIcon,
  RailBarChartIcon,
  RailGiftIcon,
  RailHelpCircleIcon,
  RailLogOutIcon,
  RailRolloverIcon,
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
  { key: 'rollover', labelKey: 'profile.rollover', icon: RailRolloverIcon },
  { key: 'help', labelKey: 'profile.helpCentre', icon: RailHelpCircleIcon },
] as const satisfies readonly { key: string; labelKey: TranslationKey; icon: FC<IconProps> }[];

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number]['key'];

export const isAccountSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && ACCOUNT_SECTIONS.some((s) => s.key === value);

/* Every row in the rail is this pill; only the surface and the ink change.
   48 tall on 24 of side padding with a 10 gap to the label, per the design.

   Sized in `--u`, the design pixel the shell sets on `PlayerLayout`: from `lg`
   up it is the viewport's share of the design's 1920 frame, capped at 1px.
   That matters here more than anywhere else in the app, because this rail sits
   directly beside the shell's own — and the shell is already drawn in `--u`.
   At fixed sizes the two fell apart on a laptop: at 1270 the shell's rail came
   down to 172 while this column stayed at 180, so the inner nav rendered WIDER
   than the outer one and its labels stayed at 16px next to the shell's 11.
   One multiplier for both and the pair holds its proportions at every width.

   Every size below is written out in full rather than built from a helper:
   Tailwind generates a class only when it can see the whole string in the
   source, so a calc assembled at runtime produces markup with no CSS behind
   it. The type carries an 11px floor, the same one the shell uses — below that
   a label is present rather than readable, and `min` keeps the floor from
   enlarging anything the design drew smaller than 11. */
const PILL =
  'relative flex w-full items-center gap-[calc(var(--u)*10)] px-[calc(var(--u)*24)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] whitespace-nowrap';

/** The pill's own height, and the glyph inside it. */
const PILL_H = 'h-[calc(var(--u)*48)]';
const ICON = 'h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] shrink-0';

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
 * and stacking ten rows above the content would push the panel off-screen.
 */
const AccountNav: FC<Props> = ({ active, onSelect, onLogout }) => {
  const { t } = useTranslation();
  const { help_center: helpOn } = usePlatformFeatures();

  // `min-w-0` below is load-bearing under the breakpoint: the row of tabs is an
  // `overflow-x-auto` flex, and a grid item's automatic minimum is its
  // min-content — so without it the nav reports the full width of all ten tabs,
  // the grid column grows to match, and the whole account page scrolls sideways
  // by a few hundred pixels instead of the tab strip scrolling inside itself.
  return (
    <nav
      className="flex min-w-0 flex-col gap-[calc(var(--u)*14)] lg:h-full"
      aria-label={t('profile.account')}
    >
      {/* The design's 20px label, flush with the rows and 20 above them. */}
      <h2 className="hidden text-[length:max(min(11px,20px),calc(var(--u)*20))] leading-[calc(var(--u)*28)] font-normal text-[#9da2b4] lg:mb-[calc(var(--u)*6)] lg:block">
        {t('profile.account')}
      </h2>

      <ul className="scrollbar-none flex gap-[calc(var(--u)*14)] overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {ACCOUNT_SECTIONS.filter(({ key }) => helpOn || key !== 'help').map(({ key, labelKey, icon: Icon }) => {
          const selected = key === active;
          return (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-current={selected ? 'page' : undefined}
                className={`${PILL} ${PILL_H} ${
                  selected
                    ? `rl-rail-row-active font-medium ${INK_SELECTED}`
                    : `rl-rail-row hover:rl-rail-row-active font-normal ${INK_RESTING} hover:font-medium hover:text-[#ffe779]`
                }`}
              >
                {/* The `size` prop still writes width/height attributes; the
                    class overrides them, which is what lets the glyph scale. */}
                <Icon size={24} className={ICON} />
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
        className={`${PILL} ${PILL_H} rl-rail-row hover:rl-rail-row-active hidden font-normal ${INK_LEAVING} hover:font-medium hover:text-[#ffe779] lg:flex`}
      >
        <RailLogOutIcon size={24} className={ICON} />
        {t('account.logout')}
        {/* Pinned rather than pushed by `ms-auto`: the design hangs it 12 off
            the right edge, inside the 24 the label is padded to. */}
        <RailArrowUpRightIcon
          size={24}
          className={`${ICON} absolute end-[calc(var(--u)*12)] top-1/2 -translate-y-1/2`}
        />
      </button>
    </nav>
  );
};

export default AccountNav;
