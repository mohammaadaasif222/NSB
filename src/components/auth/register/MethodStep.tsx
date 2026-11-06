import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { GmailMark } from '@/components/brand';
import { MailIcon, PhoneIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';
import SocialShortcuts from '@/components/auth/SocialShortcuts';
import { useTotalRegistrationsLabel } from '@/hooks/useTotalRegistrations';

import type { SignupMethod } from '@/types';

interface MethodStepProps {
  onSelectMethod: (method: SignupMethod) => void;
  onGoogle: () => void;
  onTelegram: () => void;
  onMore?: () => void;
  googleBusy?: boolean;
}

/** First screen: how does the player want to sign up? */
const MethodStep: FC<MethodStepProps> = ({
  onSelectMethod,
  onGoogle,
  onTelegram,
  googleBusy,
}) => {
  const { t } = useTranslation();
  const totalRegistrations = useTotalRegistrationsLabel();

  return (
    <div className="space-y-3">
      <AuthMethodList
        tab={totalRegistrations}
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
      />
    </div>
  );
};

export default MethodStep;
