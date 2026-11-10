import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import {
  SOCIAL_PROVIDER_UI,
  useSocialProviderClick,
  type SocialLoginActions,
} from '@/components/auth/socialProviders';
import { useSocialLoginProviders } from '@/hooks/useSocialLoginProviders';

interface SocialStepProps {
  actions: SocialLoginActions;
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
 * "more option" opens. Which ones, and their order, come from the admin
 * console (CRM → Social login).
 */
const SocialStep: FC<SocialStepProps> = ({ actions }) => {
  const { t } = useTranslation();
  const { order } = useSocialLoginProviders();
  const clickFor = useSocialProviderClick(actions);

  return (
    <div className="flex flex-col gap-3.5 pb-5">
      {order
        .filter((provider) => clickFor(provider))
        .map((provider) => {
          const { label, colour, Mark } = SOCIAL_PROVIDER_UI[provider];
          return (
            <ProviderButton
              key={provider}
              icon={<Mark size={20} />}
              colour={colour}
              label={t(label)}
              onClick={clickFor(provider)!}
            />
          );
        })}
    </div>
  );
};

export default SocialStep;
