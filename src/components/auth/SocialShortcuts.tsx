import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { TelegramMark } from '@/components/brand';
import SocialDot from '@/components/auth/SocialDot';

interface SocialShortcutsProps {
  onTelegram: () => void;
  onMore: () => void;
  moreLabel: string;
  className?: string;
}

const SocialShortcuts: FC<SocialShortcutsProps> = ({
  onTelegram,
  onMore,
  moreLabel,
  className = 'pt-[6px] sm:pt-4',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="flex items-center max-sm:[&_svg]:h-6 max-sm:[&_svg]:w-6">
        <SocialDot
          size={40}
          label={t('auth.methodTelegram')}
          colour="text-[#2aabee]"
          onClick={onTelegram}
          first
          glass
        >
          <TelegramMark size={18} />
        </SocialDot>
      </div>
      <button
        type="button"
        onClick={onMore}
        className="text-[16px] font-medium text-[#9da2b4] transition-colors hover:text-white sm:text-[15px] sm:font-normal sm:text-white/70"
      >
        {moreLabel}
      </button>
    </div>
  );
};

export default SocialShortcuts;
