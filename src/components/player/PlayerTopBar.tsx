import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROLLUCK_LOGO as wordmark } from '@/constants/cdn';
import menuGlyph from '@/assets/lobby/rail/bar-menu.svg';
import searchGlyph from '@/assets/lobby/rail/bar-search.svg';
import walletGlyph from '@/assets/lobby/rail/bar-wallet.svg';
import giftGlyph from '@/assets/lobby/rail/bar-gift.svg';
import bellGlyph from '@/assets/lobby/rail/bar-bell.svg';
import chatGlyph from '@/assets/lobby/rail/bar-chat.svg';
import profileChevron from '@/assets/lobby/rail/bar-chevron-profile.svg';
import defaultAvatar from '@/assets/lobby/player/avatar-default.webp';
import { useAuth } from '@/context/AuthContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { useAuthModal } from '@/context/AuthModalContext';
import ProfileMenu from '@/components/player/ProfileMenu';
import BalanceMenu from '@/components/player/BalanceMenu';
import WalletModal from '@/components/wallet/WalletModal';
import TopWinnersTicker from '@/components/player/TopWinnersTicker';
import LanguagePicker from '@/components/LanguagePicker';
import HeaderPopover from '@/components/player/HeaderPopover';
import NotificationPanel from '@/components/player/NotificationPanel';
import { useNotifications } from '@/hooks/useNotifications';
import ChatPanel from '@/components/player/ChatPanel';
import ChatDrawer, { CHAT_TOGGLE_EVENT } from '@/components/player/ChatDrawer';
import { CHAT_ROOMS, DEFAULT_CHAT_ROOM, isChatRoom, type ChatRoom } from '@/services/chat';
import RewardPanel from '@/components/player/RewardPanel';
import GameSearchModal from '@/components/player/GameSearchModal';
import { fullNameOf } from '@/types/profile';

/** Which header tray is showing, if any. */
type HeaderPanel = 'notifications' | 'chat' | 'rewards' | null;

const ONLY_DEFAULT_ROOM: readonly ChatRoom[] = [DEFAULT_CHAT_ROOM];

interface Props {
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
  'rl-glass-btn h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white/80 hover:text-white lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]';

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
 * Desktop: the design's 80px glass bar, floating beside the rail rather than
 * above it, so the lobby artwork runs underneath. It carries what the design
 * shows — the rail toggle, the wordmark, search, language, the winners strip,
 * and Login / Register. Phone: a full-width bar with the small mark, Login and
 * Register centred, and search at the end; the drawer opens from the tab bar.
 *
 * Three clusters on one row — brand and tools at the start, the winners strip
 * centred, the player's own controls at the end. The centre cluster takes the
 * leftover width and scrolls inside it, so a long locale in the right cluster
 * shortens the strip instead of pushing the row out of shape.
 *
 * Signed in, the wallet joins the centre and the strip stands down below
 * `2xl` — balance and deposit are controls, the strip is decoration, and at
 * that width only one of them fits.
 */
const PlayerTopBar: FC<Props> = ({ collapsed, onToggleCollapsed }) => {
  const { token } = useAuth();
  const { rewards: rewardsOn } = usePlatformFeatures();
  const { me } = useMe();
  const { t, locale } = useTranslation();
  const { internalChatEnabled, chatRegionalRoomsEnabled } = useSupportChat();
  const { openLogin, openRegister } = useAuthModal();

  const [searchOpen, setSearchOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Publish the bar's height, for screens that open beneath it (the phone's
  // notification sheet and chat). On the root as well as the stage: chat
  // portals to <body>, outside the stage. Measured rather than assumed.
  useEffect(() => {
    const header = headerRef.current;
    const stage = header?.closest<HTMLElement>('[data-player-stage]');
    if (!header || !stage) return;
    const publish = (): void => {
      const h = `${header.getBoundingClientRect().height}px`;
      stage.style.setProperty('--player-bar-h', h);
      document.documentElement.style.setProperty('--player-bar-h', h);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  /**
   * One panel at a time. Three separate booleans would let a click on the bell
   * leave the rewards tray open underneath it, and the two would overlap.
   */
  const [panel, setPanel] = useState<HeaderPanel>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom>(() =>
    isChatRoom(locale) ? locale : DEFAULT_CHAT_ROOM
  );
  const closePanel = useCallback(() => setPanel(null), []);
  const notifications = useNotifications(panel === 'notifications');
  const hasUnread = notifications.unread.personal + notifications.unread.platform > 0;

  // The phone's tab bar opens chat by event; the drawer lives here.
  useEffect(() => {
    const toggle = (): void => setPanel((current) => (current === 'chat' ? null : 'chat'));
    window.addEventListener(CHAT_TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(CHAT_TOGGLE_EVENT, toggle);
  }, []);
  const togglePanel = (next: Exclude<HeaderPanel, null>): void =>
    setPanel((current) => (current === next ? null : next));

  const name = me ? me.display_name || fullNameOf(me) : '';

  return (
    <>
      {/* Phone: the full-width bar along the top — one 66px row signed out;
          signed in, a second row under it for the balance and wallet.
          Desktop: the design's 80px glass bar, floating beside the rail.
          Sized in `--u` (PlayerLayout). */}
      <header
        ref={headerRef}
        className="sticky top-0 z-30 flex-shrink-0 lg:top-[calc(var(--u)*20)]"
      >
        <div className="relative flex min-h-[66px] flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-white/[0.06] bg-black/40 px-4 py-3 backdrop-blur-xl lg:h-[calc(var(--u)*80)] lg:flex-nowrap lg:gap-[calc(var(--u)*20)] lg:py-0 lg:rounded-[calc(var(--u)*34)] lg:border-0 lg:bg-white/[0.01] lg:px-[calc(var(--u)*16)] lg:rl-glass-bar lg:rl-bar-rim">
          {/* --- Brand, search, language --------------------------------- */}
          {/* Collapses the rail to icons. The phone opens its drawer from the
              tab bar instead, so this is desktop only. */}
          <IconButton
            label={collapsed ? t('nav.expand') : t('nav.collapse')}
            onClick={onToggleCollapsed}
            aria-pressed={collapsed}
            className="hidden lg:inline-flex"
          >
            <img
              src={menuGlyph.src}
              alt=""
              className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
            />
          </IconButton>

          {/* The wordmark: 125px on a phone, 228 on desktop. Signed out it
              takes the slack, pushing Login and Register to the far end;
              signed in the balance follows it and the bell takes the end. */}
          <Link
            href="/"
            className={`flex flex-shrink-0 items-center lg:me-0 ${token ? '' : 'me-auto'}`}
            aria-label="ROLLUCK"
            title="ROLLUCK"
          >
            <Image
              src={wordmark}
              alt="ROLLUCK"
              priority
              unoptimized
              className="h-auto w-[125px] lg:w-[calc(var(--u)*228)]"
            />
          </Link>

          {/* Neither phone bar has search, as drawn — it is in the menu. */}
          <IconButton
            label={t('search.title')}
            onClick={() => setSearchOpen(true)}
            className="hidden lg:inline-flex"
          >
            <img
              src={searchGlyph.src}
              alt=""
              className="h-[18px] w-[18px] lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
            />
          </IconButton>

          <div className="hidden lg:block">
            <LanguagePicker iconOnly />
          </div>

          {/* --- Centre: winners, and the wallet once signed in -----------
              Signed in on a phone it follows the wordmark, 12 after it, in the
              bar's one row. */}
          <div
            className={`flex min-w-0 flex-1 items-center gap-2 lg:justify-center ${
              token ? 'justify-start max-lg:ms-0.5' : 'justify-end'
            }`}
          >
            {/* Signed in: the balance and the wallet, centred in the bar. */}
            {token && (
              <div className="flex min-w-0 items-center gap-1.5 lg:gap-[calc(var(--u)*16)]">
                <BalanceMenu />
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={walletOpen}
                  aria-label={t('nav.wallet')}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center gap-[calc(var(--u)*5)] rounded-full bg-[#f9d028] text-[#07080a] transition-[filter] hover:brightness-110 lg:h-[calc(var(--u)*48)] lg:w-auto lg:px-[calc(var(--u)*18)]"
                >
                  <img
                    src={walletGlyph.src}
                    alt=""
                    className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
                  />
                  <span className="hidden whitespace-nowrap text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] lg:block">
                    {t('nav.wallet')}
                  </span>
                </button>
              </div>
            )}

            {/* Signed out, the winners ride in the bar; signed in they have a
                row of their own under it. */}
            {!token && (
              <div className="hidden min-w-0 lg:flex">
                <TopWinnersTicker />
              </div>
            )}

            {/* Phone, signed out: Login and Register at the end of the bar. */}
            {!token && (
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="rl-cta-shine [--cta-delay:7s] [--cta-glow:rgba(255,255,255,0.35)] [--cta-shine:0.35] inline-flex h-10 items-center rounded-full bg-[#07080a] px-3.5 text-[14px] leading-5 text-[#f0f1f5] transition-colors hover:bg-[#15171c]"
                >
                  {t('account.login')}
                </button>
                <button
                  type="button"
                  onClick={() => openRegister()}
                  className="rl-cta-shine inline-flex h-10 items-center rounded-full bg-[#f9d028] px-3 text-[14px] leading-5 text-[#07080a] transition-[filter] hover:brightness-110"
                >
                  {t('account.register')}
                </button>
              </div>
            )}
          </div>

          {/* --- Player controls ----------------------------------------- */}
          <div className="flex flex-shrink-0 items-center gap-2.5 lg:gap-[calc(var(--u)*20)]">
            {token && (
              <>
                {/* Desktop: the design's black "Reward" pill. Phone: a gift
                    disc at the end of the bar, after the bell. Gone entirely
                    while rewards are switched off platform-wide — a tray that
                    opens on five zeroes is worse than no tray. */}
                {rewardsOn && (
                  <HeaderPopover
                    open={panel === 'rewards'}
                    onClose={closePanel}
                    label={t('nav.rewards')}
                    width="w-[min(415px,calc(100vw-2rem))] lg:w-[calc(var(--u)*415)]"
                    // The notification centre's glass, over the same dimmed page.
                    tone="frost"
                    dim
                    // A phone's bar is the bell alone; Rewards is in the menu.
                    className="max-lg:hidden"
                    trigger={
                      <button
                        type="button"
                        onClick={() => togglePanel('rewards')}
                        aria-haspopup="dialog"
                        aria-expanded={panel === 'rewards'}
                        aria-label={t('nav.rewards')}
                        className="inline-flex h-10 w-10 items-center justify-center gap-[calc(var(--u)*6)] rl-glass-btn rounded-full text-[#f0f1f5] lg:h-[calc(var(--u)*48)] lg:w-auto lg:bg-transparent lg:bg-none lg:[--tw-inset-shadow:0_0_#0000] lg:px-[calc(var(--u)*19)]"
                      >
                        <img
                          src={giftGlyph.src}
                          alt=""
                          className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
                        />
                        <span className="hidden text-[length:max(min(11px,18px),calc(var(--u)*18))] leading-[calc(var(--u)*28)] lg:block">
                          {t('nav.rewards')}
                        </span>
                      </button>
                    }
                  >
                    <RewardPanel />
                  </HeaderPopover>
                )}

                <HeaderPopover
                  open={panel === 'notifications'}
                  onClose={closePanel}
                  label={t('nav.notifications')}
                  width="w-[min(464px,calc(100vw-2rem))] lg:w-[calc(var(--u)*464)]"
                  tone="frost"
                  dim
                  phoneSheet
                  // The design hangs the panel 41px past the bell's end. The
                  // modals' rim replaces the surface's even inset ring.
                  panelClassName="rl-modal-rim !shadow-[0_8px_40px_rgba(0,0,0,0.12)] lg:-end-[calc(var(--u)*41)]"
                  trigger={
                    <IconButton
                      label={t('nav.notifications')}
                      onClick={() => togglePanel('notifications')}
                      aria-expanded={panel === 'notifications'}
                      className="relative inline-flex"
                    >
                      <img
                        src={bellGlyph.src}
                        alt=""
                        className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
                      />
                      {hasUnread && (
                        <span
                          className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#fcd535] lg:right-[calc(var(--u)*13)] lg:top-[calc(var(--u)*13)]"
                          aria-hidden="true"
                        />
                      )}
                    </IconButton>
                  }
                >
                  <NotificationPanel onClose={closePanel} feed={notifications} />
                </HeaderPopover>

                {/* The platform's own chat. Independent of the Intercom
                    bubble: an operator can run either, both, or neither from
                    System config.

                    Just the button here — unlike the trays beside it, chat is
                    a full-height drawer rather than a dropdown, so it is
                    rendered outside the bar (and portalled out of it; see
                    ChatDrawer) instead of hanging off this trigger. */}
                {internalChatEnabled && (
                  <IconButton
                    label={t('nav.liveChat')}
                    onClick={() => togglePanel('chat')}
                    aria-expanded={panel === 'chat'}
                    aria-haspopup="dialog"
                    className="hidden lg:inline-flex"
                  >
                    <img
                      src={chatGlyph.src}
                      alt=""
                      className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
                    />
                  </IconButton>
                )}
              </>
            )}

            {token ? (
              // Below `sm` the design's bar has no avatar; the phone opens the
              // same menu from its Profile tab (see MobileTabBar).
              <div className="order-3 hidden sm:block lg:order-none">
                <ProfileMenu
                  placement="below"
                  trigger={({ open, toggle, menuId }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      aria-haspopup="menu"
                      aria-expanded={open}
                      aria-controls={open ? menuId : undefined}
                      aria-label={name || t('account.account')}
                      className="rl-glass-btn flex h-10 items-center gap-[calc(var(--u)*11)] rounded-full pe-3 ps-1 lg:h-[calc(var(--u)*48)] lg:pe-[calc(var(--u)*12)] lg:ps-[calc(var(--u)*8)]"
                    >
                      <img
                        src={me?.avatar_url || defaultAvatar.src}
                        alt=""
                        className="h-8 w-8 flex-shrink-0 rounded-full bg-[#666666] object-cover lg:h-[calc(var(--u)*32)] lg:w-[calc(var(--u)*32)]"
                      />
                      <img
                        src={profileChevron.src}
                        alt=""
                        className={`h-4 w-4 transition-transform lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)] ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                />
              </div>
            ) : (
              <div className="hidden items-center gap-[calc(var(--u)*9)] lg:flex">
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="rl-cta-shine [--cta-delay:7s] [--cta-glow:rgba(255,255,255,0.35)] [--cta-shine:0.35] inline-flex h-[calc(var(--u)*48)] w-[calc(var(--u)*108)] items-center justify-center rounded-[calc(var(--u)*24)] bg-[#07080a] text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] text-[#f0f1f5] transition-colors hover:bg-[#15171c]"
                >
                  {t('account.login')}
                </button>
                <button
                  type="button"
                  onClick={() => openRegister()}
                  className="rl-cta-shine inline-flex h-[calc(var(--u)*48)] w-[calc(var(--u)*148)] items-center justify-center rounded-[calc(var(--u)*24)] bg-[#f9d028] text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] text-[#07080a] transition-[filter] hover:brightness-110"
                >
                  {t('account.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen && <GameSearchModal onClose={() => setSearchOpen(false)} />}

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />

      {/* Out here rather than beside the button: the drawer is full-height and
          portals to the body, and the bar is a bad place to read that from.
          It is NOT gated on `internalChatEnabled && token` as a separate
          condition — `panel` can only become 'chat' from the button above,
          which already is. */}
      <ChatDrawer open={panel === 'chat'} onClose={closePanel} label={t('nav.liveChat')}>
        <ChatPanel
          onClose={closePanel}
          room={chatRegionalRoomsEnabled ? chatRoom : DEFAULT_CHAT_ROOM}
          rooms={chatRegionalRoomsEnabled ? CHAT_ROOMS : ONLY_DEFAULT_ROOM}
          onRoomChange={setChatRoom}
        />
      </ChatDrawer>
    </>
  );
};

export default PlayerTopBar;
