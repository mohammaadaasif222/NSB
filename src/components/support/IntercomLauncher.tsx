import type { FC } from 'react';
import { useSupportChat } from '@/context/SupportChatContext';
import { useTranslation } from '@/context/I18nContext';
import { ChatIcon } from '@/components/icons';

/**
 * The Intercom bubble.
 *
 * Ours rather than Intercom's own launcher, for two reasons: it can be styled
 * to the rest of the site, and it disappears the moment an operator switches
 * Intercom off in System config — Intercom's launcher would need the workspace
 * itself disabled.
 *
 * Clicking is also what downloads the widget on a cold page. Until then this
 * button costs one DOM node and no network.
 *
 * Sits above the built-in chat panel's top-bar icon rather than beside it, so
 * that with both switched on a player sees two clearly separate things instead
 * of two chat icons side by side.
 *
 * On a phone page with the tab bar it is hidden: the bar brings its own
 * support button (MobileTabBar), shown whichever chat is switched on.
 */
const IntercomLauncher: FC = () => {
  const { intercomEnabled, openIntercom } = useSupportChat();
  const { t } = useTranslation();

  // Intercom defaults to off until the settings call answers, so this renders
  // nothing at all rather than flashing a bubble that is then taken away.
  if (!intercomEnabled) return null;

  const label = t('nav.liveChat');

  return (
    <button
      type="button"
      onClick={openIntercom}
      aria-label={label}
      title={label}
      // With the built-in panel also switched on, two controls in the page
      // share the accessible name "Live chat". This distinguishes them for
      // tests; distinguishing them for screen readers needs a second i18n
      // string, which is a copy decision rather than a code one.
      data-testid="intercom-launcher"
      className="rl-glass rl-glass-hover fixed bottom-5 end-5 z-[90] flex h-13 w-13 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg shadow-black/40 backdrop-blur transition-[transform,inset-inline-end] duration-300 ease-out hover:scale-105 max-lg:[body:has([data-mobile-tabbar])_&]:hidden max-sm:[body:has([data-chat-drawer=open])_&]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcd535] sm:bottom-6 sm:end-6 sm:[body:has([data-chat-drawer=open])_&]:end-[calc(var(--chat-drawer-w)+1.5rem)]"
    >
      <ChatIcon size={22} />
    </button>
  );
};

export default IntercomLauncher;
