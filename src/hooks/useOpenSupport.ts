import { useSupportChat } from '@/context/SupportChatContext';
import { SUPPORT_EMAIL } from '@/constants/auth';

export const useOpenSupport = (): (() => void) => {
  const { intercomEnabled, openIntercom } = useSupportChat();

  return () => {
    if (intercomEnabled) openIntercom();
    else window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };
};
