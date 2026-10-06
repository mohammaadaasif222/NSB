import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import menuIcon from '@/assets/lobby/rail/tab-menu.svg';
import casinoIcon from '@/assets/lobby/rail/tab-casino.svg';
import sportsIcon from '@/assets/lobby/rail/tab-sports.svg';
import chatIcon from '@/assets/lobby/rail/tab-chat.svg';

const ITEM =
  'flex h-[58px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[44px] text-[12px] leading-5 text-[#f0f1f5] transition-colors';

/**
 * The phone's bottom bar, as the design draws it: a floating dark glass pill
 * with Menu, Casino, Sports and Chat. Menu opens the same drawer the rail is
 * on desktop; Chat opens the support messenger.
 */
const MobileTabBar: FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { openIntercom } = useSupportChat();

  const casino = pathname === '/' || pathname === '/casino' || pathname.startsWith('/game');
  const sports = pathname === '/sports';

  return (
    <nav
      aria-label={t('nav.games')}
      // The floating chat bubble steps aside for this bar's own Chat tab.
      data-mobile-tabbar=""
      className="fixed inset-x-4 bottom-4 z-30 flex h-16 items-center rounded-[34px] border border-white/10 bg-black/45 px-4 backdrop-blur-xl lg:hidden"
    >
      <button type="button" onClick={onOpenMenu} className={`${ITEM} hover:bg-white/5`}>
        <img src={menuIcon.src} alt="" className="h-6 w-6" />
        {t('nav.menu')}
      </button>
      <Link
        href="/casino"
        aria-current={casino ? 'page' : undefined}
        className={`${ITEM} ${casino ? 'bg-[#252937]' : 'hover:bg-white/5'}`}
      >
        <img src={casinoIcon.src} alt="" className="h-6 w-6" />
        {t('nav.casino')}
      </Link>
      <Link
        href="/sports"
        aria-current={sports ? 'page' : undefined}
        className={`${ITEM} ${sports ? 'bg-[#252937]' : 'hover:bg-white/5'}`}
      >
        <img src={sportsIcon.src} alt="" className="h-6 w-6" />
        {t('nav.sports')}
      </Link>
      <button type="button" onClick={openIntercom} className={`${ITEM} hover:bg-white/5`}>
        <img src={chatIcon.src} alt="" className="h-6 w-6" />
        {t('nav.chat')}
      </button>
    </nav>
  );
};

export default MobileTabBar;
