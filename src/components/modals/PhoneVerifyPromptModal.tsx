import type { FC } from 'react';
import { useRouter } from 'next/router';
import Modal from '@/components/ui/Modal';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { isUnverifiedPhoneAccount } from '@/utils/phoneVerification';

const PROFILE_PATH = '/profile';

const PhoneVerifyPromptModal: FC = () => {
  const { me } = useMe();
  const { t } = useTranslation();
  const router = useRouter();
  const { phone_verify_modal: promptOn, loaded } = usePlatformFeatures();

  const open =
    loaded &&
    promptOn &&
    isUnverifiedPhoneAccount(me) &&
    !(
      router.pathname === PROFILE_PATH &&
      (!router.query.section || router.query.section === 'profile')
    );

  return (
    <Modal
      open={open}
      onClose={() => undefined}
      labelledBy="phone-verify-prompt-title"
      className="w-full max-w-[480px] p-6 sm:p-7"
    >
      <div className="space-y-5 text-center">
        <h2
          id="phone-verify-prompt-title"
          className="text-[20px] leading-7 font-semibold tracking-[-0.56px] text-[#f0f1f5] sm:text-[28px] sm:leading-9"
        >
          {t('acct.phone.verifyTitle')}
        </h2>
        <p className="text-base leading-6 text-[#9da2b4]">
          {t('acct.phone.verifyPromptBody', {
            phone: `${me?.country_code ? `+${me.country_code.replace(/\D/g, '')} ` : ''}${me?.mobile ?? ''}`,
          })}
        </p>
        <button
          type="button"
          data-autofocus
          onClick={() =>
            void router.push({ pathname: PROFILE_PATH, query: { section: 'profile' } })
          }
          className="rl-btn-gold flex h-14 w-full items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium"
        >
          {t('acct.phone.verifyPhone')}
        </button>
      </div>
    </Modal>
  );
};

export default PhoneVerifyPromptModal;
