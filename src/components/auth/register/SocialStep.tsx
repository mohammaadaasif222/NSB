import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FacebookMark, TelegramMark, WhatsappMark } from '@/components/brand';
import Button from '@/components/ui/Button';

interface SocialStepProps {
  onTelegram: () => void;
  /** Providers the backend does not support yet (Facebook, WhatsApp). */
  onUnavailable: (provider: string) => void;
}

/** One provider: its mark beside its name, centred in the design's 56px pill. */
const ProviderButton: FC<{
  icon: ReactNode;
  /** The brand colour, as a text-colour class — the marks draw in currentColor. */
  colour: string;
  label: string;
  onClick: () => void;
}> = ({ icon, colour, label, onClick }) => (
  // The design's 56px pill with a 16px label (the button's own size steps up to 18).
  <Button variant="option" size="row" fullWidth onClick={onClick}>
    <span className={`flex h-[22px] w-[22px] items-center justify-center ${colour}`}>{icon}</span>
    <span className="font-medium">{label}</span>
  </Button>
);

/**
 * "Register with": the social providers, one full-width pill each — what
 * "more option" opens. Telegram signs in for real; Facebook and WhatsApp say
 * they are coming, as the shortcut discs beside "more option" already do.
 */
const SocialStep: FC<SocialStepProps> = ({ onTelegram, onUnavailable }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3.5 pb-5">
      <ProviderButton
        icon={<TelegramMark size={20} />}
        colour="text-[#2aabee]"
        label={t('auth.methodTelegram')}
        onClick={onTelegram}
      />
      <ProviderButton
        icon={<FacebookMark size={20} />}
        colour="text-[#1877f2]"
        label="Facebook"
        onClick={() => onUnavailable('Facebook')}
      />
      <ProviderButton
        icon={<WhatsappMark size={22} />}
        colour="text-[#25d366]"
        label="WhatsApp"
        onClick={() => onUnavailable('WhatsApp')}
      />
    </div>
  );
};

export default SocialStep;
