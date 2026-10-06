import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { useAuth } from '@/context/AuthContext';
import Glyph from '@/components/player/Glyph';
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
 * way to the account, since its top bar has no avatar. Menu opens the same
 * drawer the rail is on desktop; Chat opens the support messenger.
 */
const MobileTabBar: FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { openIntercom } = useSupportChat();
  const { token } = useAuth();

  // The home page belongs to neither section; its designs light no tab.
  const casino = pathname === '/casino' || pathname.startsWith('/game');
  const sports = pathname === '/sports';
  const profile = pathname.startsWith('/profile');

  return (
    <nav
      aria-label={t('nav.games')}
      // The floating chat bubble steps aside for this bar's own Chat tab.
      data-mobile-tabbar=""
      className="fixed inset-x-4 bottom-4 z-30 flex h-16 items-center rounded-[34px] border border-white/10 bg-black/45 px-1.5 backdrop-blur-xl lg:hidden"
    >
      <button type="button" onClick={onOpenMenu} className={`${ITEM} ${ITEM_IDLE}`}>
        <Tab icon={menuIcon.src} label={t('nav.menu')} />
      </button>
      <TabLink href="/casino" active={casino}>
        <Tab icon={casinoIcon.src} label={t('nav.casino')} />
      </TabLink>
      <TabLink href="/sports" active={sports}>
        <Tab icon={sportsIcon.src} label={t('nav.sports')} />
      </TabLink>
      <button type="button" onClick={openIntercom} className={`${ITEM} ${ITEM_IDLE}`}>
        <Tab icon={chatIcon.src} label={t('nav.chat')} />
      </button>
      {token && (
        <TabLink href="/profile" active={profile}>
          <Tab icon={profileIcon.src} label={t('nav.profile')} />
        </TabLink>
      )}
    </nav>
  );
};

export default MobileTabBar;
