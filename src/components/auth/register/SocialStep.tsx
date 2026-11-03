import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { TelegramMark } from '@/components/brand';
import Button from '@/components/ui/Button';

interface SocialStepProps {
  onTelegram: () => void;
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
 * "more option" opens. Telegram is the one provider here today.
 */
const SocialStep: FC<SocialStepProps> = ({ onTelegram }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3.5 pb-5">
      <ProviderButton
        icon={<TelegramMark size={20} />}
        colour="text-[#2aabee]"
        label={t('auth.methodTelegram')}
        onClick={onTelegram}
      />
    </div>
  );
};

export default SocialStep;
