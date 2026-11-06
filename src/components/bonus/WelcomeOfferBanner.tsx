import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import type { WelcomeOffer } from '@/types';
import { formatOfferAmount } from '@/utils/money';
import { showsWelcomeOffer } from '@/hooks/useWelcomeOffer';
import { displayText } from '@/utils/displayText';

interface Props {
  offer: WelcomeOffer | null;
  className?: string;
  large?: boolean;
}

const WelcomeOfferBanner: FC<Props> = ({ offer, className = '', large = false }) => {
  const { t, locale } = useTranslation();
  if (!showsWelcomeOffer(offer)) return null;

  const percent = Math.max(...offer.options.map((option) => option.match_percentage));

  return (
    <div
      className={`rl-liquid rounded-[24px] ${large ? 'px-5 py-5' : 'px-4 py-3'} text-center ${className}`}
    >
      <p
        className={`font-semibold tracking-[-0.02em] text-[#f9d028] ${
          large ? 'text-[32px] leading-10' : 'text-[18px] leading-6'
        }`}
      >
        {displayText(offer.texts, locale, 'banner_headline') ??
          t('welcome.bannerHeadline', { percent })}
      </p>
      <p
        className={`${large ? 'mt-2 text-[14px]' : 'mt-0.5 text-[13px]'} leading-5 text-[#f0f1f5]`}
      >
        {displayText(offer.texts, locale, 'banner_body') ??
          t('welcome.bannerBody', { min: formatOfferAmount(offer.min_deposit, offer.currency) })}
      </p>
    </div>
  );
};

export default WelcomeOfferBanner;
