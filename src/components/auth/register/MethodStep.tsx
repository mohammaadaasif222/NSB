import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { GmailMark } from '@/components/brand';
import { MailIcon, PhoneIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';
import SocialShortcuts from '@/components/auth/SocialShortcuts';
import type { SocialLoginActions } from '@/components/auth/socialProviders';
import { useSocialLoginProviders } from '@/hooks/useSocialLoginProviders';
import { useTotalRegistrationsLabel } from '@/hooks/useTotalRegistrations';

import type { SignupMethod } from '@/types';

interface MethodStepProps {
  onSelectMethod: (method: SignupMethod) => void;
  onGoogle: () => void;
  /** Handlers for the round provider shortcuts; which show is set by the admin. */
  socialActions: SocialLoginActions;
  onMore?: () => void;
  googleBusy?: boolean;
}

/** First screen: how does the player want to sign up? */
const MethodStep: FC<MethodStepProps> = ({
  onSelectMethod,
  onGoogle,
  socialActions,
  onMore,
  googleBusy,
}) => {
  const { t } = useTranslation();
  const totalRegistrations = useTotalRegistrationsLabel();
  const { isEnabled } = useSocialLoginProviders();

  return (
    <div className="space-y-3">
      <AuthMethodList
        tab={totalRegistrations}
        methods={[
          // Switched off in the admin console → no Gmail button at all.
          ...(isEnabled('google')
            ? [
                {
                  id: 'gmail',
                  icon: <GmailMark size={28} />,
                  label: t('auth.methodGmail'),
                  badge: t('registerModal.recommended'),
                  onClick: onGoogle,
                  disabled: googleBusy,
                },
              ]
            : []),
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

      <SocialShortcuts actions={socialActions} onMore={onMore} />
    </div>
  );
};

export default MethodStep;
