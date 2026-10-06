import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { SUPPORT_EMAIL } from '@/constants/auth';

const CLASS = 'text-[14px] text-white/70 transition-colors hover:text-white';

/**
 * "Need help?" under the auth forms. Opens the Intercom messenger when an
 * operator has switched it on, and falls back to a support email otherwise.
 */
const NeedHelpLink: FC<{ subject: string; className?: string }> = ({ subject, className = '' }) => {
  const { t } = useTranslation();
  const { intercomEnabled, openIntercom } = useSupportChat();
  const label = t('registerModal.needHelp');

  return intercomEnabled ? (
    <button type="button" onClick={openIntercom} className={`${CLASS} ${className}`}>
      {label}
    </button>
  ) : (
    <a
      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`}
      className={`${CLASS} ${className}`}
    >
      {label}
    </a>
  );
};

export default NeedHelpLink;
