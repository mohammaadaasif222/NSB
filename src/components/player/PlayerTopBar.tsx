import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import ThemeModal from '@/components/modals/profile/ThemeModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import BalanceMenu from '@/components/player/BalanceMenu';
import WalletModal from '@/components/wallet/WalletModal';
import WalletSettingsModal from '@/components/wallet/WalletSettingsModal';
import TopWinnersTicker from '@/components/player/TopWinnersTicker';
import LanguagePicker from '@/components/LanguagePicker';
import HeaderPopover from '@/components/player/HeaderPopover';
import NotificationPanel from '@/components/player/NotificationPanel';
import ChatPanel from '@/components/player/ChatPanel';
import RewardPanel from '@/components/player/RewardPanel';
import GameSearchModal from '@/components/player/GameSearchModal';
import {
  BellIcon,
  ChatIcon,
  ChevronDownIcon,
  GiftIcon,
  MenuIcon,
  SearchIcon,
  WalletIcon,
} from '@/components/icons';
import { fullNameOf, initialsOf } from '@/types/profile';

/** Which header tray is showing, if any. */
type HeaderPanel = 'notifications' | 'chat' | 'rewards' | null;

interface Props {
  /** Opens the mobile drawer. Ignored at lg and above. */
  onOpenMenu: () => void;
  /** Icon-rail state, mirrored here so the toggle button can show it. */
  collapsed: boolean;
  /** Flips the icon-rail collapse. Ignored below lg — there is no rail there. */
  onToggleCollapsed: () => void;
}

/**
 * The round 38px control used across the bar.
 *
 * Deliberately carries no `display`: several of these are shown only at some
 * widths, and a `display` utility here would outrank the `hidden` on the call
 * site (both are plain utilities, so the stylesheet's own order decides, not
 * the order they are written in). Each usage supplies its own instead.
 */
const ICON_BUTTON =
  'h-[38px] w-[38px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white';

interface IconButtonProps {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
}

const IconButton: FC<IconButtonProps> = ({
  label,
  children,
  onClick,
  className = '',
  title,
  ...rest
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={title ?? label}
    className={`${ICON_BUTTON} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/**
 * Player-app header.
 *
 * A floating pill of dark glass, inset from the viewport on every side, so the
 * lobby artwork runs underneath it rather than stopping at its edge. The
 * wordmark sits at the far left so it lines up over the nav rail below.
 *
 * Signed out, the bar carries exactly what the design shows — brand, search,
 * winners, Login and Register. The rail-collapse toggle and the language
 * picker are signed-in chrome; a visitor reaches the language picker from the
 * footer instead.
 *
 * Three clusters on one row — brand and search at the start, the winners strip
 * centred, the player's own controls at the end. The centre cluster takes the
 * leftover width and scrolls inside it, so a long locale in the right cluster
 * shortens the strip instead of pushing the row out of shape.
 *
 * Signed in, the wallet joins the centre and the strip stands down below
 * `xl` — balance and deposit are controls, the strip is decoration, and at
 * that width only one of them fits.
 */
const PlayerTopBar: FC<Props> = ({ onOpenMenu, collapsed, onToggleCollapsed }) => {
  const { token, logout } = useAuth();
  const { me, updateMe } = useMe();
  const { theme, applyTheme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { internalChatEnabled } = useSupportChat();

  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /**
   * One panel at a time. Three separate booleans would let a click on the bell
   * leave the rewards tray open underneath it, and the two would overlap.
   */
  const [panel, setPanel] = useState<HeaderPanel>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const togglePanel = (next: Exclude<HeaderPanel, null>): void =>
    setPanel((current) => (current === next ? null : next));

  /**
   * Land on the public lobby after logging out. Without the push, a user
   * logging out from a guarded page (/profile) would be bounced to /login.
   */
  const confirmLogout = (): void => {
    setLogoutOpen(false);
    logout();
    router.push('/');
  };

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const name = me ? me.display_name || fullNameOf(me) : '';

  return (
    <>
      <header className="sticky top-0 z-30 flex-shrink-0 px-3 pt-3 lg:pt-4">
        <div className="rl-glass-dark relative flex h-14 items-center gap-2 rounded-[22px] pl-2 pr-2 sm:h-[62px] sm:rounded-[28px] sm:pl-[18px] sm:pr-[13px]">
          {/* --- Brand and search ---------------------------------------- */}
          <IconButton
            label={t('nav.openMenu')}
            onClick={onOpenMenu}
            className="inline-flex lg:hidden"
          >
            <MenuIcon size={17} />
          </IconButton>

          <Link
            href="/"
            className="flex flex-shrink-0 items-center"
            aria-label="ROLLUCK"
            title="ROLLUCK"
          >
            <Image src={logo} alt="ROLLUCK" className="h-7 w-auto sm:h-[35px]" priority />
          </Link>

          <IconButton
            label={t('search.title')}
            onClick={() => setSearchOpen(true)}
            className="ml-[14px] hidden sm:inline-flex"
          >
            <SearchIcon size={17} strokeWidth={1.8} />
          </IconButton>

          {/* Desktop equivalent of the hamburger: collapses the rail to icons
              instead of opening a drawer. */}
          {token && (
            <IconButton
              label={collapsed ? t('nav.expand') : t('nav.collapse')}
              onClick={onToggleCollapsed}
              aria-pressed={collapsed}
              className="hidden lg:inline-flex"
            >
              <MenuIcon size={17} />
            </IconButton>
          )}

          {/* --- Centre: winners, and the wallet once signed in ----------- */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            {token && (
              <div className="flex flex-shrink-0 items-center gap-2">
                <BalanceMenu onOpenWallet={() => setSettingsOpen(true)} />
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={walletOpen}
                  className="rl-glass rl-glass-hover flex h-[38px] items-center gap-2 rounded-full pl-1.5 pr-3 sm:pr-3.5"
                >
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535]/15 text-[#fcd535]"
                    aria-hidden="true"
                  >
                    <WalletIcon size={15} />
                  </span>
                  <span className="hidden whitespace-nowrap text-[12.5px] font-medium text-white sm:block">
                    {t('nav.wallet')}
                  </span>
                </button>
              </div>
            )}

            <div
              className={
                token
                  ? 'hidden min-w-0 xl:flex xl:flex-1'
                  : 'hidden min-w-0 md:flex md:flex-1 xl:absolute xl:inset-y-0 xl:left-1/2 xl:max-w-[560px] xl:-translate-x-1/2 xl:items-center'
              }
            >
              <TopWinnersTicker />
            </div>
          </div>

          {/* --- Player controls ----------------------------------------- */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {token && <LanguagePicker iconOnly />}

            {token && (
              <>
                <HeaderPopover
                  open={panel === 'rewards'}
                  onClose={closePanel}
                  label={t('nav.rewards')}
                  className="hidden sm:block"
                  trigger={
                    <button
                      type="button"
                      onClick={() => togglePanel('rewards')}
                      aria-haspopup="dialog"
                      aria-expanded={panel === 'rewards'}
                      className="inline-flex h-[38px] items-center gap-1.5 rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-3 text-[12px] font-medium text-[#fcd535] transition-colors hover:bg-[#fcd535]/20"
                    >
                      <GiftIcon size={15} />
                      {t('nav.rewards')}
                    </button>
                  }
                >
                  <RewardPanel />
                </HeaderPopover>

                <HeaderPopover
                  open={panel === 'notifications'}
                  onClose={closePanel}
                  label={t('nav.notifications')}
                  className="hidden sm:block"
                  trigger={
                    <IconButton
                      label={t('nav.notifications')}
                      onClick={() => togglePanel('notifications')}
                      aria-expanded={panel === 'notifications'}
                      className="relative inline-flex"
                    >
                      <BellIcon size={17} />
                      <span
                        className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#fcd535]"
                        aria-hidden="true"
                      />
                    </IconButton>
                  }
                >
                  <NotificationPanel />
                </HeaderPopover>

                {/* The platform's own chat. Independent of the Intercom
                    bubble: an operator can run either, both, or neither from
                    System config. */}
                {internalChatEnabled && (
                  <HeaderPopover
                    open={panel === 'chat'}
                    onClose={closePanel}
                    label={t('nav.liveChat')}
                    className="hidden sm:block"
                    trigger={
                      <IconButton
                        label={t('nav.liveChat')}
                        onClick={() => togglePanel('chat')}
                        aria-expanded={panel === 'chat'}
                        className="inline-flex"
                      >
                        <ChatIcon size={17} />
                      </IconButton>
                    }
                  >
                    <ChatPanel onClose={closePanel} />
                  </HeaderPopover>
                )}
              </>
            )}

            {token ? (
              <div className="relative" ref={ref}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={name || t('account.account')}
                  className="rl-glass rl-glass-hover flex h-[38px] items-center gap-1.5 rounded-full pl-1.5 pr-2.5"
                >
                  {me?.avatar_url ? (
                    <img
                      src={me.avatar_url}
                      alt=""
                      className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#4a3bd6] text-[10px] font-bold text-white">
                      {initialsOf(me)}
                    </span>
                  )}
                  <ChevronDownIcon
                    size={12}
                    className={`text-white/45 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="rl-menu absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-2xl py-1"
                  >
                    {me && (
                      <div className="border-b border-white/[0.08] px-3 py-2">
                        <p className="truncate text-xs font-semibold text-white">{name}</p>
                        <p className="truncate text-[11px] text-white/45">{me.email}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push('/profile');
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {t('account.profile')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setThemeOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {t('account.appearance')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-[#ef4462] transition-colors hover:bg-[#ef4462]/10"
                    >
                      {t('account.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex h-[37px] items-center rounded-full border border-white/[0.06] bg-[#08090b] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#15171c] sm:px-[22px] sm:text-[14px]"
                >
                  {t('account.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="rl-btn-gold inline-flex h-[37px] items-center rounded-full px-4 text-[13px] font-medium sm:px-[27px] sm:text-[14px]"
                >
                  {t('account.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {searchOpen && <GameSearchModal onClose={() => setSearchOpen(false)} />}

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

      {logoutOpen && (
        <LogoutConfirmModal onConfirm={confirmLogout} onCancel={() => setLogoutOpen(false)} />
      )}

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <WalletSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default PlayerTopBar;
