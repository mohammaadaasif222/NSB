import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FacebookMark, GmailMark, TelegramMark, WhatsappMark } from '@/components/brand';
import { MailIcon, PhoneIcon } from '@/components/icons';
import AuthMethodList from '@/components/auth/AuthMethodList';
import SocialDot from '@/components/auth/SocialDot';
import { LOBBY_STATS } from '@/constants/stats';

import type { SignupMethod } from '@/types';

interface MethodStepProps {
  onSelectMethod: (method: SignupMethod) => void;
  onGoogle: () => void;
  onTelegram: () => void;
  /** Providers the backend does not support yet (Facebook, WhatsApp). */
  onUnavailable: (provider: string) => void;
  googleBusy?: boolean;
}

/** First screen: how does the player want to sign up? */
const MethodStep: FC<MethodStepProps> = ({
  onSelectMethod,
  onGoogle,
  onTelegram,
  onUnavailable,
  googleBusy,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <AuthMethodList
        tab={t('registerModal.registeredToday', { count: LOBBY_STATS.registeredToday })}
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

      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center">
          <SocialDot
            size={40}
            label={t('auth.methodTelegram')}
            colour="text-[#2aabee]"
            onClick={onTelegram}
            first
          >
            <TelegramMark size={18} />
          </SocialDot>
          <SocialDot
            size={40}
            label="Facebook"
            colour="text-[#1877f2]"
            onClick={() => onUnavailable('Facebook')}
          >
            <FacebookMark size={18} />
          </SocialDot>
          <SocialDot
            size={40}
            label="WhatsApp"
            colour="text-[#25d366]"
            onClick={() => onUnavailable('WhatsApp')}
          >
            <WhatsappMark size={19} />
          </SocialDot>
        </div>
        <span className="text-[15px] text-white/70">{t('registerModal.moreOptions')}</span>
      </div>
    </div>
  );
};

export default MethodStep;
