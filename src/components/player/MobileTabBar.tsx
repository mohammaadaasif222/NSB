import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { useAuth } from '@/context/AuthContext';
import Glyph from '@/components/player/Glyph';
import ProfileMenu from '@/components/player/ProfileMenu';
import { CHAT_TOGGLE_EVENT } from '@/components/player/ChatDrawer';
import menuIcon from '@/assets/lobby/rail/tab-menu.svg';
import casinoIcon from '@/assets/lobby/rail/tab-casino.svg';
import sportsIcon from '@/assets/lobby/rail/tab-sports.svg';
import chatIcon from '@/assets/lobby/rail/tab-chat.svg';
import profileIcon from '@/assets/lobby/rail/tab-profile.svg';

const ITEM =
  'flex h-[58px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[44px] text-[12px] leading-5 transition-colors';
/** The current section: the design's pale pill, gold icon and label. */
const ITEM_ON = 'bg-[#f0f1f5]/20 text-[#f9d028]';
const ITEM_IDLE = 'text-[#f0f1f5] hover:bg-white/5';

/** A tab's face: the icon over its label, both in the tab's colour. */
const Tab: FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <>
    <Glyph src={icon} className="h-6 w-6" />
    <span className="max-w-full truncate">{label}</span>
  </>
);

const TabLink: FC<{ href: string; active: boolean; children: ReactNode }> = ({
  href,
  active,
  children,
}) => (
  <Link
    href={href}
    aria-current={active ? 'page' : undefined}
    className={`${ITEM} ${active ? ITEM_ON : ITEM_IDLE}`}
  >
    {children}
  </Link>
);

/**
 * The phone's bottom bar, as the designs draw it: a floating dark glass pill
 * with Menu, Casino, Sports and Chat, and Profile once signed in — the phone's
 * way into the account menu, since its top bar has no avatar. Menu opens and
 * closes the menu panel (the rail, on desktop); Chat opens the support
 * messenger.
 */
const MobileTabBar: FC<{ menuOpen: boolean; onToggleMenu: () => void }> = ({
  menuOpen,
  onToggleMenu,
}) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { openIntercom, internalChatEnabled } = useSupportChat();
  // The built-in chat when it is on — its drawer lives with the top bar, so
  // the tab asks for it by event; Intercom otherwise.
  const openChat = (): void => {
    if (internalChatEnabled && token) window.dispatchEvent(new Event(CHAT_TOGGLE_EVENT));
    else openIntercom();
  };
  const { token } = useAuth();

  // The home page belongs to neither section; its designs light no tab.
  const casino =
    pathname === '/casino' || pathname === '/live-casino' || pathname.startsWith('/game');
  const sports = pathname.startsWith('/sports');
  const profile = pathname.startsWith('/profile');

  return (
    <nav
      aria-label={t('nav.games')}
      // The floating chat bubble steps aside for this bar's own Chat tab.
      data-mobile-tabbar=""
      className="fixed inset-x-4 bottom-4 z-30 flex h-16 items-center rl-drop-pane rounded-[34px] bg-black/45 px-1.5 backdrop-blur-xl lg:hidden"
    >
      {/* Opens and closes the menu panel, lit while it is open. */}
      <button
        type="button"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        className={`${ITEM} ${menuOpen ? ITEM_ON : ITEM_IDLE}`}
      >
        <Tab icon={menuIcon.src} label={t('nav.menu')} />
      </button>
      <TabLink href="/casino" active={casino}>
        <Tab icon={casinoIcon.src} label={t('nav.casino')} />
      </TabLink>
      <TabLink href="/sports" active={sports}>
        <Tab icon={sportsIcon.src} label={t('nav.sports')} />
      </TabLink>
      <button type="button" onClick={openChat} className={`${ITEM} ${ITEM_IDLE}`}>
        <Tab icon={chatIcon.src} label={t('nav.chat')} />
      </button>
      {token && (
        // Opens the account menu over the bar, as the desktop's profile button does.
        <ProfileMenu
          placement="above-tabbar"
          className="flex min-w-0 flex-1"
          trigger={({ open, toggle, menuId }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? menuId : undefined}
              className={`${ITEM} ${open || profile ? ITEM_ON : ITEM_IDLE}`}
            >
              <Tab icon={profileIcon.src} label={t('nav.profile')} />
            </button>
          )}
        />
      )}
    </nav>
  );
};

export default MobileTabBar;
