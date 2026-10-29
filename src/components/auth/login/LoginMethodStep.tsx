import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { GmailMark } from '@/components/brand';
import { MailIcon, PhoneIcon, UserIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';
import SocialShortcuts from '@/components/auth/SocialShortcuts';
import { useRegisteredTodayLabel } from '@/hooks/useRegisteredToday';

import type { LoginMethod } from '@/types';

interface LoginMethodStepProps {
  onSelectMethod: (method: LoginMethod) => void;
  onGoogle: () => void;
  onTelegram: () => void;
  onUnavailable: (provider: string) => void;
  onMore: () => void;
  googleBusy?: boolean;
}

/** First screen of login: Gmail, or a password with username / mobile / email. */
const LoginMethodStep: FC<LoginMethodStepProps> = ({
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
        tab={t('loginModal.suggestion')}
        phoneTab={registeredToday}
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
            // The phone design lists it last, after Email.
            phoneOrder: 9,
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
        moreLabel={t('lobby.hero.moreOptions')}
        className="pt-[2px] sm:pt-1"
      />
    </div>
  );
};

export default LoginMethodStep;
