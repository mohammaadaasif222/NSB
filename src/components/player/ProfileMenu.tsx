import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { StaticImageData } from 'next/image';
import Glyph from '@/components/player/Glyph';
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
  /** The group's rows — the design's Account and Referral dropdowns. */
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
    { labelKey: 'profile.security', icon: securityIcon, href: profile('security') },
    { labelKey: 'profile.verification', icon: verificationIcon, href: profile('verification') },
    { labelKey: 'profile.transactions', icon: transactionsIcon, href: profile('transactions') },
    { labelKey: 'profile.helpCentre', icon: helpIcon, href: profile('help') },
  ],
};

/** The design's second dropdown: the referral page and its sections. */
const REFERRAL: Group = {
  labelKey: 'aff.title',
  icon: affiliateIcon,
  items: [
    { labelKey: 'aff.dashboard', icon: dashboardIcon, href: '/referral' },
    { labelKey: 'aff.campaign', icon: campaignIcon, href: '/referral#campaign' },
    { labelKey: 'aff.referredUsers', icon: referredIcon, href: '/referral#referred-users' },
    { labelKey: 'aff.earning', icon: earningIcon, href: '/referral#earning' },
    { labelKey: 'aff.terms', icon: termsIcon, href: '/referral#terms' },
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

const ROW =
  'flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-full ps-6 pe-3 text-start text-[16px] leading-6 transition-colors lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*10)] lg:pe-[calc(var(--u)*12)] lg:ps-[calc(var(--u)*24)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const SURFACE = {
  face: 'bg-white/[0.06]',
  nested:
    'rl-menu-rim relative bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.035))] shadow-[inset_-6px_0_8px_-5px_rgba(255,255,255,0.05)]',
  open: 'bg-[linear-gradient(180deg,rgba(255,231,121,0.18),rgba(255,231,121,0.217)_45%,rgba(255,231,121,0.196))] font-medium text-[#ffe779] shadow-[0_0_10px_rgba(255,214,90,0.16)] rl-menu-rim relative',
} as const;
const ROW_IDLE = 'text-[#9da2b4] hover:bg-white/10 hover:text-[#f0f1f5]';
const ICON = 'h-6 w-6 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]';
const LIST = 'flex flex-col gap-1.5 lg:gap-[calc(var(--u)*6)]';

const LeafRow: FC<{ leaf: Leaf; onAction: (leaf: Leaf) => void; nested?: boolean }> = ({
  leaf,
  onAction,
  nested,
}) => {
  const { t } = useTranslation();
  const surface = SURFACE[nested ? 'nested' : 'face'];
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
        className={`${ROW} ${surface} cursor-default text-[#9da2b4]/50`}
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
        className={`${ROW} ${surface} ${ROW_IDLE}`}
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
      className={`${ROW} ${surface} ${ROW_IDLE}`}
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
        className={`${ROW} ${open ? SURFACE.open : `${SURFACE.face} ${ROW_IDLE}`}`}
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
                <LeafRow leaf={leaf} onAction={onAction} nested />
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

/**
 * Rendered outside the bar (see `portal`), because the bar's own blur would
 * stop a blur nested in it from reaching the page.
 */
const PANEL =
  'rl-menu-panel lg:rl-menu-panel-glass rl-modal-rim lg:!shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-40 overflow-y-auto rounded-[34px] p-[13px] thin-scrollbar lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*14-1px)]';

const PLACEMENT = {
  /**
   * Under the bar — 8 clear of it, never over it — its right edge on the
   * profile button's. Placed from the button's position (`below` style).
   */
  below: 'fixed w-[256px] max-h-[calc(100dvh-120px)] lg:w-[calc(var(--u)*256)]',
  /** Over the phone's tab bar, full width. */
  'above-tabbar':
    'fixed inset-x-0 bottom-0 !z-[29] max-h-[calc(100dvh-80px)] !rounded-b-none !px-4 !pt-3.5 !pb-[90px]',
};

interface Props {
  placement: keyof typeof PLACEMENT;
  /** The button that opens it; given whether it is open and how to toggle it. */
  trigger: (state: { open: boolean; toggle: () => void; menuId: string }) => ReactNode;
  /** Classes for the wrapper — e.g. to make it a tab bar's flex item. */
  className?: string;
}

/**
 * The account menu, as the design draws it: Account and Referral fold open
 * into their sections, then Wallet, the rewards, help and support, and Log
 * out. The bar's profile button opens it on desktop, the Profile tab on a
 * phone. Closes on a choice, a click away, Escape, or navigation.
 */
const ProfileMenu: FC<Props> = ({ placement, trigger, className = '' }) => {
  const {
    promotions: promotionsOn,
    help_center: helpOn,
    responsible_gambling: responsibleOn,
    referrals: referralsOn,
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
  // Desktop: where the panel goes, from the bar's foot and the button's end.
  const [spot, setSpot] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || phone) return undefined;
    const place = (): void => {
      const button = ref.current?.getBoundingClientRect();
      const bar = ref.current?.closest('header')?.getBoundingClientRect();
      if (!button) return;
      setSpot({ top: (bar?.bottom ?? button.bottom) + 8, right: window.innerWidth - button.right });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
    };
  }, [open, phone]);

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

  // Out of the bar it opens from (the tab bar's blur would make it the
  // containing block and pin the panel to it), into the page's stage, so it
  // keeps the stage's unit (`--u`), its own blur can reach the page, and the
  // phone's tab bar still stacks above the sheet.
  const portal = (node: ReactNode): ReactNode =>
    createPortal(node, document.querySelector('[data-player-stage]') ?? document.body);

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
            data-profile-sheet={phone || undefined}
            className={`${PANEL} ${PLACEMENT[placement]}`}
            style={!phone && spot ? { top: spot.top, right: spot.right } : undefined}
          >
            <ul role="menu" className={LIST}>
              <GroupRow group={ACCOUNT} onAction={onAction} />
              {referralsOn && <GroupRow group={REFERRAL} onAction={onAction} />}
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
                  className={`${ROW} ${SURFACE.face} text-[#f0f1f5] hover:bg-white/10`}
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
