import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  BadgeCheckIcon,
  ChartIcon,
  LifeBuoyIcon,
  LogInIcon,
  ReceiptIcon,
  ShieldIcon,
  SlidersIcon,
  UserIcon,
  UsersIcon,
  type IconProps,
} from '@/components/icons';
import type { TranslationKey } from '@/i18n/locales';

/** The account area's sections, in nav order. */
export const ACCOUNT_SECTIONS = [
  { key: 'profile', labelKey: 'account.profile', icon: UserIcon },
  { key: 'statistic', labelKey: 'profile.statistic', icon: ChartIcon },
  { key: 'preferences', labelKey: 'profile.preferences', icon: SlidersIcon },
  { key: 'referral', labelKey: 'profile.referral', icon: UsersIcon },
  { key: 'security', labelKey: 'profile.security', icon: ShieldIcon },
  { key: 'verification', labelKey: 'profile.verification', icon: BadgeCheckIcon },
  { key: 'transactions', labelKey: 'profile.transactions', icon: ReceiptIcon },
  { key: 'help', labelKey: 'profile.helpCentre', icon: LifeBuoyIcon },
] as const satisfies readonly { key: string; labelKey: TranslationKey; icon: FC<IconProps> }[];

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number]['key'];

export const isAccountSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && ACCOUNT_SECTIONS.some((s) => s.key === value);

interface Props {
  active: AccountSection;
  onSelect: (section: AccountSection) => void;
  onLogout: () => void;
}

/**
 * The account area's left-hand nav.
 *
 * A horizontal scroller below `lg` — a phone has no room for a fixed column,
 * and stacking eight rows above the content would push the panel off-screen.
 */
const AccountNav: FC<Props> = ({ active, onSelect, onLogout }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-4 lg:h-full" aria-label={t('profile.account')}>
      <h2 className="hidden text-sm font-semibold text-slate-400 lg:block">
        {t('profile.account')}
      </h2>

      <ul className="flex gap-2 overflow-x-auto scrollbar-none pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {ACCOUNT_SECTIONS.map(({ key, labelKey, icon: Icon }) => {
          const selected = key === active;
          return (
            <li key={key} className="flex-shrink-0 lg:flex-shrink">
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-current={selected ? 'page' : undefined}
                className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  selected
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                    selected ? 'bg-blue-600/25 text-blue-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon size={12} />
                </span>
                {t(labelKey)}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto hidden items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-[13px] font-semibold text-slate-200 hover:bg-slate-700 transition-colors lg:flex"
      >
        <LogInIcon size={14} />
        {t('account.logout')}
      </button>
    </nav>
  );
};

export default AccountNav;
