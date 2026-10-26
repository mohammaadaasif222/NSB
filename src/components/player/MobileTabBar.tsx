import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { useAuth } from '@/context/AuthContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useAuthModal } from '@/context/AuthModalContext';
import Glyph from '@/components/player/Glyph';
import ProfileMenu from '@/components/player/ProfileMenu';
import GameSearchModal from '@/components/player/GameSearchModal';
import { CHAT_TOGGLE_EVENT } from '@/components/player/ChatDrawer';
import menuIcon from '@/assets/lobby/tabbar/menu.svg';
import searchIcon from '@/assets/lobby/tabbar/search.svg';
import giftIcon from '@/assets/lobby/tabbar/gift.svg';
import chatIcon from '@/assets/lobby/tabbar/chat.svg';
import profileIcon from '@/assets/lobby/tabbar/profile.svg';
import backIcon from '@/assets/lobby/tabbar/back.svg';
import headsetIcon from '@/assets/lobby/tabbar/headset.svg';
import roulette from '@/assets/lobby/tabbar/roulette.webp';
import ball from '@/assets/lobby/tabbar/ball.webp';

const GLASS = 'rl-menu-rim bg-black/45 backdrop-blur-xl';
const ITEM =
  'flex h-10 min-w-0 flex-1 items-center justify-center rounded-[44px] transition-colors';
const ITEM_ON = 'bg-[#252937] text-[#f9d028]';
const ITEM_IDLE = 'text-[#f0f1f5] hover:bg-white/5';
const DISC = `${GLASS} flex h-[50px] w-[50px] items-center justify-center rounded-full text-[#f0f1f5]`;

const SECTION = {
  casino: {
    src: roulette.src,
    glow: 'drop-shadow-[0_0_17px_rgba(170,20,20,0.55)]',
    href: '/casino',
  },
  sports: { src: ball.src, glow: 'drop-shadow-[0_0_17px_rgba(22,163,52,0.55)]', href: '/sports' },
} as const;
type Section = keyof typeof SECTION;

type Mode = 'bar' | 'switch' | 'collapsed' | 'wide';

const IconItem: FC<{
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}> = ({ icon, label, active = false, onClick, href }) => {
  const className = `${ITEM} ${active ? ITEM_ON : ITEM_IDLE}`;
  const glyph = <Glyph src={icon} className="h-6 w-6" />;
  return href ? (
    <Link href={href} aria-label={label} title={label} className={className}>
      {glyph}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={active || undefined}
      className={className}
    >
      {glyph}
    </button>
  );
};

/** A section's render with its glow, sized by the caller. */
const SectionArt: FC<{ section: Section; className: string }> = ({ section, className }) => (
  <img
    src={SECTION[section].src}
    alt=""
    className={`pointer-events-none object-contain ${SECTION[section].glow} ${className}`}
  />
);


const MobileTabBar: FC<{ menuOpen: boolean; onToggleMenu: () => void }> = ({
  menuOpen,
  onToggleMenu,
}) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { token } = useAuth();
  const { rewards: rewardsOn } = usePlatformFeatures();
  const { openIntercom, intercomEnabled, internalChatEnabled } = useSupportChat();
  const { openLogin } = useAuthModal();
  const [mode, setMode] = useState<Mode>('bar');
  const [searching, setSearching] = useState(false);
  const lastY = useRef(0);

  // The built-in chat when it is on — its drawer lives with the top bar, so
  // the tab asks for it by event; Intercom otherwise.
  const openChat = (): void => {
    if (internalChatEnabled && token) window.dispatchEvent(new Event(CHAT_TOGGLE_EVENT));
    else openIntercom();
  };

  const openSupport = (): void => {
    if (intercomEnabled) openIntercom();
    else if (!token) openLogin();
    else window.dispatchEvent(new Event(CHAT_TOGGLE_EVENT));
  };
  const supportOn = intercomEnabled || internalChatEnabled;

  const section: Section = pathname.startsWith('/sports') ? 'sports' : 'casino';
  const profile = pathname.startsWith('/profile');

  // A new page starts on the full bar.
  useEffect(() => setMode('bar'), [pathname]);

  // Down folds the bar, up brings it back. A few pixels of slack so a
  // finger's jitter does not flicker it, and never while the menu is open.
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = (): void => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (Math.abs(dy) < 8) return;
      lastY.current = y;
      if (menuOpen) return;
      if (dy > 0 && y > 120) setMode((m) => (m === 'bar' ? 'collapsed' : m));
      else if (dy < 0) setMode((m) => (m === 'collapsed' || m === 'wide' ? 'bar' : m));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  const menuItem = (
    <IconItem icon={menuIcon.src} label={t('nav.menu')} active={menuOpen} onClick={onToggleMenu} />
  );
  const searchItem = (
    <IconItem icon={searchIcon.src} label={t('search.title')} onClick={() => setSearching(true)} />
  );
  const chatItem = <IconItem icon={chatIcon.src} label={t('nav.chat')} onClick={openChat} />;

  let content: ReactNode;
  if (mode === 'switch') {
    content = (
      <>
        <button
          type="button"
          onClick={() => setMode('bar')}
          aria-label={t('auth.back')}
          title={t('auth.back')}
          className={`${DISC} absolute start-4 top-0`}
        >
          <Glyph src={backIcon.src} className="h-[25px] w-[25px] rtl:rotate-180" />
        </button>
        <div
          className={`${GLASS} absolute left-1/2 top-0 flex h-[50px] w-[142px] -translate-x-1/2 items-center gap-0 rounded-[34px] px-[5px]`}
        >
          {(['casino', 'sports'] as const).map((s) => (
            <Link
              key={s}
              href={SECTION[s].href}
              aria-current={s === section ? 'page' : undefined}
              onClick={() => setMode('bar')}
              className={`relative h-10 w-[66px] rounded-[44px] ${s === section ? 'bg-white/20' : ''}`}
            >
              <SectionArt
                section={s}
                className={
                  s === 'casino'
                    ? 'absolute -top-2 left-[13px] h-10 w-10'
                    : 'absolute -top-0.5 left-[19px] h-[30px] w-[30px]'
                }
              />
              <span className="absolute inset-x-0 top-6 text-center text-[10px] leading-[13px] text-white">
                {t(s === 'casino' ? 'nav.casino' : 'nav.sports')}
              </span>
            </Link>
          ))}
        </div>
      </>
    );
  } else if (mode === 'collapsed') {
    content = (
      <button
        type="button"
        onClick={() => setMode('wide')}
        aria-label={t('nav.menu')}
        title={t('nav.menu')}
        aria-expanded={false}
        className={`${DISC} absolute end-4 top-0`}
      >
        <Glyph src={menuIcon.src} className="h-6 w-6" />
      </button>
    );
  } else if (mode === 'wide') {
    content = (
      <div
        className={`${GLASS} absolute inset-x-4 top-0 flex h-[50px] items-center rounded-[34px] px-[5px]`}
      >
        {menuItem}
        {(['casino', 'sports'] as const).map((s) => (
          <Link
            key={s}
            href={SECTION[s].href}
            aria-label={t(s === 'casino' ? 'nav.casino' : 'nav.sports')}
            title={t(s === 'casino' ? 'nav.casino' : 'nav.sports')}
            aria-current={s === section && pathname !== '/' ? 'page' : undefined}
            className={`${ITEM} ${ITEM_IDLE}`}
          >
            <img
              src={SECTION[s].src}
              alt=""
              className={s === 'casino' ? 'h-[38px] w-[38px]' : 'h-[34px] w-[34px]'}
            />
          </Link>
        ))}
        {searchItem}
        {chatItem}
      </div>
    );
  } else {
    content = (
      <>
        <div
          className={`${GLASS} absolute start-4 end-[87px] top-0 flex h-[50px] items-center rounded-[34px] px-[5px]`}
        >
          {menuItem}
          {searchItem}
          <IconItem
            icon={giftIcon.src}
            label={t('nav.rewards')}
            href={rewardsOn ? '/rewards' : '/promotions'}
          />
          {chatItem}
          {token && (
            <ProfileMenu
              placement="above-tabbar"
              className="flex min-w-0 flex-1"
              trigger={({ open, toggle, menuId }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={t('nav.profile')}
                  title={t('nav.profile')}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls={open ? menuId : undefined}
                  className={`${ITEM} ${open || profile ? ITEM_ON : ITEM_IDLE}`}
                >
                  <Glyph src={profileIcon.src} className="h-6 w-6" />
                </button>
              )}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setMode('switch')}
          aria-expanded={false}
          aria-label={t(section === 'casino' ? 'nav.casino' : 'nav.sports')}
          className={`${GLASS} absolute -end-[7px] top-0 h-[50px] w-[82px] rounded-[34px]`}
        >
          <SectionArt
            section={section}
            className={
              section === 'casino'
                ? 'absolute -top-0.5 start-6 h-10 w-10'
                : 'absolute top-[3px] start-[30px] h-[30px] w-[30px]'
            }
          />
          <span className="absolute start-0 end-[7px] top-8 text-center text-[10px] leading-[13px] text-white">
            {t(section === 'casino' ? 'nav.casino' : 'nav.sports')}
          </span>
        </button>
      </>
    );
  }

  return (
    <>
      <nav
        aria-label={t('nav.games')}
        data-mobile-tabbar=""
        className="fixed inset-x-0 bottom-6 z-30 h-[50px] overflow-x-clip lg:hidden"
      >
        {content}
      </nav>
      {supportOn && !menuOpen && (
        <button
          type="button"
          onClick={openSupport}
          aria-label={t('nav.liveChat')}
          title={t('nav.liveChat')}
          className={`${DISC} fixed bottom-[87px] end-4 z-30 !h-[60px] !w-[60px] lg:hidden [body:has([data-chat-drawer=open])_&]:hidden [body:has([data-profile-sheet])_&]:hidden`}
        >
          <Glyph src={headsetIcon.src} className="h-[30px] w-[30px]" />
        </button>
      )}
      {searching && <GameSearchModal onClose={() => setSearching(false)} />}
    </>
  );
};

export default MobileTabBar;
