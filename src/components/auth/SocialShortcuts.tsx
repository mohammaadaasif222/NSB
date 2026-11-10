import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import SocialDot from '@/components/auth/SocialDot';
import {
  DiscMark,
  SOCIAL_PROVIDER_UI,
  useSocialProviderClick,
  type SocialLoginActions,
} from '@/components/auth/socialProviders';
import { useSocialLoginProviders } from '@/hooks/useSocialLoginProviders';

interface SocialShortcutsProps {
  actions: SocialLoginActions;
  /** Opens the full provider list; draws the "more option" link beside the discs. */
  onMore?: () => void;
  className?: string;
}

/**
 * The overlapping row of round provider shortcuts under the method list,
 * followed by "more option", as the design draws it.
 *
 * Which providers appear, and in what order, is set in the admin console
 * (CRM → Social login). Google is left out: it already has its own
 * "Recommended" button in the list above.
 */
const SocialShortcuts: FC<SocialShortcutsProps> = ({
  actions,
  onMore,
  className = 'pt-[6px] sm:pt-4',
}) => {
  const { t } = useTranslation();
  const { order } = useSocialLoginProviders();
  const clickFor = useSocialProviderClick(actions);
  const shown = order.filter((provider) => provider !== 'google' && clickFor(provider));

  if (shown.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-[14px] ${className}`}>
      <div className="flex items-center">
        {shown.map((provider, index) => (
          <SocialDot
            key={provider}
            size={40}
            label={t(SOCIAL_PROVIDER_UI[provider].label)}
            colour=""
            onClick={clickFor(provider)!}
            first={index === 0}
          >
            <DiscMark provider={provider} className="h-6 w-6 sm:h-[22px] sm:w-[22px]" />
          </SocialDot>
        ))}
      </div>

      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="text-[15px] leading-6 text-[#9da2b4] transition-colors hover:text-[#f0f1f5]"
        >
          {t('registerModal.moreOptions')}
        </button>
      )}
    </div>
  );
};

export default SocialShortcuts;
