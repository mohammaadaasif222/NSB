import { useEffect, useId, useRef, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { StaticImageData } from 'next/image';
import Glyph from '@/components/player/Glyph';
import { POPUP_SURFACE } from '@/components/player/popupSurface';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import type { TranslationKey } from '@/i18n/locales';
import accountIcon from '@/assets/lobby/profile-menu/account.svg';
import affiliateIcon from '@/assets/lobby/profile-menu/affiliate.svg';
import walletIcon from '@/assets/lobby/profile-menu/wallet.svg';
import bonusesIcon from '@/assets/lobby/profile-menu/bonuses.svg';
import promotionsIcon from '@/assets/lobby/profile-menu/promotions.svg';
import responsibleIcon from '@/assets/lobby/profile-menu/responsible.svg';
import helpIcon from '@/assets/lobby/profile-menu/help.svg';
import supportIcon from '@/assets/lobby/profile-menu/support.svg';
import logoutIcon from '@/assets/lobby/profile-menu/logout.svg';
import logoutArrow from '@/assets/lobby/profile-menu/logout-arrow.svg';
import chevronIcon from '@/assets/lobby/profile-menu/chevron.svg';
import statisticIcon from '@/assets/lobby/profile-menu/statistic.svg';
import preferencesIcon from '@/assets/lobby/profile-menu/preferences.svg';
import securityIcon from '@/assets/lobby/profile-menu/security.svg';
import verificationIcon from '@/assets/lobby/profile-menu/verification.svg';
import transactionsIcon from '@/assets/lobby/profile-menu/transactions.svg';
import dashboardIcon from '@/assets/lobby/profile-menu/dashboard.svg';
import campaignIcon from '@/assets/lobby/profile-menu/campaign.svg';
import referredIcon from '@/assets/lobby/profile-menu/referred.svg';
import earningIcon from '@/assets/lobby/profile-menu/earning.svg';
import termsIcon from '@/assets/lobby/profile-menu/terms.svg';

/* ==================================================================== */
/* The menu's contents                                                   */
/* ==================================================================== */

interface Leaf {
  labelKey: TranslationKey;
  icon: StaticImageData;
  href?: string;
  /** An action instead of a link — live support. */
  action?: 'support';
  /** In the design with nothing behind it yet: shown dimmed, tagged "Soon". */
  soon?: boolean;
  /** Drawn on the phone's menu only. */
  phoneOnly?: boolean;
}

interface Group {
  labelKey: TranslationKey;
  icon: StaticImageData;
  /** The group's rows — the design's Account and Affiliate dropdowns. */
  items: Leaf[];
}

const profile = (section?: string): string =>
  section ? `/profile?section=${section}` : '/profile';

/** The design's Account dropdown: the account area's sections. */
const ACCOUNT: Group = {
  labelKey: 'account.account',
  icon: accountIcon,
  items: [
    { labelKey: 'account.profile', icon: accountIcon, href: profile() },
    { labelKey: 'profile.statistic', icon: statisticIcon, href: profile('statistic') },
    { labelKey: 'profile.preferences', icon: preferencesIcon, href: profile('preferences') },
    { labelKey: 'profile.referral', icon: bonusesIcon, href: profile('referral') },
    { labelKey: 'profile.security', icon: securityIcon, href: profile('security') },
    { labelKey: 'profile.verification', icon: verificationIcon, href: profile('verification') },
    { labelKey: 'profile.transactions', icon: transactionsIcon, href: profile('transactions') },
    { labelKey: 'profile.helpCentre', icon: helpIcon, href: profile('help') },
  ],
};

/** The design's Affiliate dropdown: the affiliate page and its sections. */
const AFFILIATE: Group = {
  labelKey: 'aff.title',
  icon: affiliateIcon,
  items: [
    { labelKey: 'aff.dashboard', icon: dashboardIcon, href: '/affiliate' },
    { labelKey: 'aff.campaign', icon: campaignIcon, href: '/affiliate#campaign' },
    { labelKey: 'aff.referredUsers', icon: referredIcon, href: '/affiliate#referred-users' },
    { labelKey: 'aff.earning', icon: earningIcon, href: '/affiliate#earning' },
    { labelKey: 'aff.terms', icon: termsIcon, href: '/affiliate#terms' },
  ],
};

const LEAVES: Leaf[] = [
  { labelKey: 'nav.wallet', icon: walletIcon, href: '/wallet' },
  { labelKey: 'menu.vault', icon: walletIcon, soon: true, phoneOnly: true },
  { labelKey: 'menu.bonusesRewards', icon: bonusesIcon, href: '/bonuses' },
  { labelKey: 'menu.promotions', icon: promotionsIcon, href: '/promotions' },
  { labelKey: 'menu.responsibleGambling', icon: responsibleIcon, href: '/responsible-gambling' },
  // { labelKey: 'menu.helpCenter', icon: helpIcon, href: profile('help') },
  { labelKey: 'menu.liveSupport', icon: supportIcon, action: 'support' },
];

/* ==================================================================== */
/* Rows                                                                  */
/* ==================================================================== */

/** Every row is this 48px pill: icon and label on the design's faint glass. */
const ROW =
  'flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-full bg-white/5 ps-6 pe-3 text-start text-[16px] leading-6 transition-colors lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*10)] lg:pe-[calc(var(--u)*12)] lg:ps-[calc(var(--u)*24)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const ROW_IDLE = 'text-[#9da2b4] hover:bg-white/10 hover:text-[#f0f1f5]';
const ICON = 'h-6 w-6 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]';
const LIST = 'flex flex-col gap-1.5 lg:gap-[calc(var(--u)*6)]';

const LeafRow: FC<{ leaf: Leaf; onAction: (leaf: Leaf) => void }> = ({ leaf, onAction }) => {
  const { t } = useTranslation();
  const label = t(leaf.labelKey);
  // No ellipsis: the design's longest labels fill the row to within a few
  // pixels, so the label may run into the row's end padding instead.
  const face = (
    <>
      <Glyph src={leaf.icon.src} className={ICON} />
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (leaf.soon) {
    return (
      <span
        aria-disabled="true"
        title={`${label} — ${t('common.soon')}`}
        className={`${ROW} cursor-default text-[#9da2b4]/50`}
      >
        {face}
      </span>
    );
  }
  if (leaf.href) {
    return (
      <Link
        href={leaf.href}
        role="menuitem"
        onClick={() => onAction(leaf)}
        className={`${ROW} ${ROW_IDLE}`}
      >
        {face}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onAction(leaf)}
      className={`${ROW} ${ROW_IDLE}`}
    >
      {face}
    </button>
  );
};

/** A row that folds its group's rows open beneath it. */
const GroupRow: FC<{ group: Group; onAction: (leaf: Leaf) => void }> = ({ group, onAction }) => {
  const { t } = useTranslation();
  const { help_center: helpOn } = usePlatformFeatures();
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <li className={LIST}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className={`${ROW} ${open ? 'text-[#f0f1f5]' : ROW_IDLE}`}
      >
        <Glyph src={group.icon.src} className={ICON} />
        <span className="truncate">{t(group.labelKey)}</span>
        <img
          src={chevronIcon.src}
          alt=""
          className={`me-1.5 ms-auto h-4 w-4 flex-shrink-0 transition-transform lg:me-[calc(var(--u)*6)] lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul id={listId} className={LIST}>
          {group.items
            .filter((leaf) => helpOn || leaf.href !== profile('help'))
            .map((leaf) => (
            <li key={leaf.labelKey}>
              <LeafRow leaf={leaf} onAction={onAction} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

/* ==================================================================== */
/* The menu                                                              */
/* ==================================================================== */

/** The popup: the bar popups' raised glass (see popupSurface), 14px in. */
const PANEL = `z-40 overflow-y-auto rounded-[34px] p-3.5 thin-scrollbar lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*14)] ${POPUP_SURFACE.raised}`;

const PLACEMENT = {
  /** Under the bar's profile button, its right edge on the button's. */
  below:
    'absolute end-0 top-[calc(100%+8px)] w-[256px] max-h-[calc(100dvh-120px)] lg:w-[calc(var(--u)*256)]',
  /** Over the phone's tab bar, full width. */
  'above-tabbar': 'fixed inset-x-4 bottom-[92px] max-h-[calc(100dvh-180px)]',
};

interface Props {
  placement: keyof typeof PLACEMENT;
  /** The button that opens it; given whether it is open and how to toggle it. */
  trigger: (state: { open: boolean; toggle: () => void; menuId: string }) => ReactNode;
  /** Classes for the wrapper — e.g. to make it a tab bar's flex item. */
  className?: string;
}

/**
 * The account menu, as the design draws it: Account and Affiliate fold open
 * into their sections, then Wallet, the rewards, help and support, and Log
 * out. The bar's profile button opens it on desktop, the Profile tab on a
 * phone. Closes on a choice, a click away, Escape, or navigation.
 */
const ProfileMenu: FC<Props> = ({ placement, trigger, className = '' }) => {
  const {
    promotions: promotionsOn,
    help_center: helpOn,
    responsible_gambling: responsibleOn,
  } = usePlatformFeatures();
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
  const { openIntercom } = useSupportChat();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const phone = placement === 'above-tabbar';

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    const close = (): void => setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    router.events.on('routeChangeStart', close);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
      router.events.off('routeChangeStart', close);
    };
  }, [open, router.events]);

  const onAction = (leaf: Leaf): void => {
    setOpen(false);
    if (leaf.action === 'support') openIntercom();
  };

  // The phone's panel goes to <body>: the tab bar's backdrop blur makes it
  // the containing block for anything fixed inside it, which would pin the
  // panel to the bar instead of the screen.
  const portal = (node: ReactNode): ReactNode => (phone ? createPortal(node, document.body) : node);

  /** Land on the public lobby, as logging out anywhere does. */
  const confirmLogout = (): void => {
    setLogoutOpen(false);
    logout();
    void router.push('/');
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v), menuId })}

      {open &&
        portal(
          <nav
            ref={panelRef}
            id={menuId}
            aria-label={t('menu.label')}
            className={`${PANEL} ${PLACEMENT[placement]}`}
          >
            <ul role="menu" className={LIST}>
              <GroupRow group={ACCOUNT} onAction={onAction} />
              <GroupRow group={AFFILIATE} onAction={onAction} />
              {LEAVES.filter(
                (leaf) =>
                  (phone || !leaf.phoneOnly) &&
                  (promotionsOn || leaf.href !== '/promotions') &&
                  (responsibleOn || leaf.href !== '/responsible-gambling') &&
                  (helpOn || leaf.labelKey !== 'menu.helpCenter')
              ).map((leaf) => (
                <li key={leaf.labelKey}>
                  <LeafRow leaf={leaf} onAction={onAction} />
                </li>
              ))}
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setLogoutOpen(true);
                  }}
                  className={`${ROW} text-[#f0f1f5] hover:bg-white/10`}
                >
                  <img src={logoutIcon.src} alt="" className={ICON} />
                  <span className="truncate">{t('account.logout')}</span>
                  <img src={logoutArrow.src} alt="" className={`ms-auto ${ICON}`} />
                </button>
              </li>
            </ul>
          </nav>
        )}

      {logoutOpen && (
        <LogoutConfirmModal onConfirm={confirmLogout} onCancel={() => setLogoutOpen(false)} />
      )}
    </div>
  );
};

export default ProfileMenu;
