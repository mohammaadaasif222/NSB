import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { GmailMark } from '@/components/brand';
import { MailIcon, PhoneIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';
import SocialShortcuts from '@/components/auth/SocialShortcuts';
import { useRegisteredTodayLabel } from '@/hooks/useRegisteredToday';

import type { SignupMethod } from '@/types';

interface MethodStepProps {
  onSelectMethod: (method: SignupMethod) => void;
  onGoogle: () => void;
  onTelegram: () => void;
  /** Providers the backend does not support yet (Facebook, WhatsApp). */
  onUnavailable: (provider: string) => void;
  /** "more option": every social provider, on a step of its own. */
  onMore: () => void;
  googleBusy?: boolean;
}

/** First screen: how does the player want to sign up? */
const MethodStep: FC<MethodStepProps> = ({
  onSelectMethod,
  onGoogle,
  onTelegram,
  onUnavailable,
  onMore,
  googleBusy,
}) => {
  const { t } = useTranslation();
  const registeredToday = useRegisteredTodayLabel();

  return (
    <div className="space-y-3">
      <AuthMethodList
        tab={registeredToday}
        methods={[
          {
            id: 'gmail',
            icon: <GmailMark size={28} />,
            label: t('auth.methodGmail'),
            badge: t('registerModal.recommended'),
            onClick: onGoogle,
            disabled: googleBusy,
          },
          {
            id: 'mobile',
            icon: <PhoneIcon size={26} strokeWidth={1.5} />,
            label: t('registerModal.mobile'),
            onClick: () => onSelectMethod('mobile'),
          },
          {
            id: 'email',
            icon: <MailIcon size={28} strokeWidth={1.5} />,
            label: t('registerModal.email'),
            onClick: () => onSelectMethod('email'),
          },
        ]}
      />

      <SocialShortcuts
        onTelegram={onTelegram}
        onUnavailable={onUnavailable}
        onMore={onMore}
        moreLabel={t('registerModal.moreOptions')}
      />
    </div>
  );
};

export default MethodStep;
