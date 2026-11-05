import { useSupportChat } from '@/context/SupportChatContext';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { CHAT_TOGGLE_EVENT } from '@/components/player/ChatDrawer';
import { SUPPORT_EMAIL } from '@/constants/auth';

/**
 * Opens support the one way every entry point shares (the top bar's headset,
 * the rail's Live Support row, the phone's tab bar, the footer): Intercom when
 * the operator has it on; otherwise the built-in chat, whose drawer lives with
 * the top bar and is asked for by event — a guest signs in first, since the
 * chat is tied to an account; otherwise an email to support.
 */
export const useOpenSupport = (): (() => void) => {
  const { intercomEnabled, internalChatEnabled, openIntercom } = useSupportChat();
  const { token } = useAuth();
  const { openLogin } = useAuthModal();

  return () => {
    if (intercomEnabled) openIntercom();
    else if (internalChatEnabled && !token) openLogin();
    else if (internalChatEnabled) window.dispatchEvent(new Event(CHAT_TOGGLE_EVENT));
    else window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };
};
