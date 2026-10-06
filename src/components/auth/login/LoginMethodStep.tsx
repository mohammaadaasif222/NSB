import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { GmailMark } from '@/components/brand';
import { MailIcon, PhoneIcon, UserIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';

import type { LoginMethod } from '@/types';

interface LoginMethodStepProps {
  onSelectMethod: (method: LoginMethod) => void;
  onGoogle: () => void;
  googleBusy?: boolean;
}

/** First screen of login: Gmail, or a password with username / mobile / email. */
const LoginMethodStep: FC<LoginMethodStepProps> = ({ onSelectMethod, onGoogle, googleBusy }) => {
  const { t } = useTranslation();

  return (
    <AuthMethodList
      tab={t('loginModal.suggestion')}
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
          id: 'username',
          icon: <UserIcon size={28} strokeWidth={1.5} />,
          label: t('loginModal.username'),
          onClick: () => onSelectMethod('username'),
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
  );
};

export default LoginMethodStep;
