import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { SUPPORT_EMAIL } from '@/constants/auth';

const LOOK = {
  auth: 'text-[14px] text-white/70 transition-colors hover:text-white',
  /** Takes the text style around it, underlined so it reads as a link. */
  inherit:
    'underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#f9d028]',
} as const;

interface Props {
  /** The support email's subject, when the messenger is off. */
  subject: string;
  label?: string;
  look?: keyof typeof LOOK;
  className?: string;
}

/**
 * "Need help?" under the auth forms and the wallet's Deposit and Withdraw.
 * Opens the Intercom messenger when an operator has switched it on, and falls
 * back to a support email otherwise.
 */
const NeedHelpLink: FC<Props> = ({ subject, label: text, look = 'auth', className = '' }) => {
  const { t } = useTranslation();
  const { intercomEnabled, openIntercom } = useSupportChat();
  const label = text ?? t('registerModal.needHelp');
  const css = `${LOOK[look]} ${className}`;

  return intercomEnabled ? (
    <button type="button" onClick={openIntercom} className={css}>
      {label}
    </button>
  ) : (
    <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`} className={css}>
      {label}
    </a>
  );
};

export default NeedHelpLink;
