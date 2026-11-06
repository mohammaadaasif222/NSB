import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';

interface Props {
  bonuses: string[];
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const WelcomeWithdrawalNotice: FC<Props> = ({ bonuses, checked, onChange, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={`rounded-[24px] border border-[#f9d028]/40 bg-[#f9d028]/10 px-5 py-3.5 ${className}`}
    >
      <p className="text-[14px] font-semibold leading-5 text-[#f0f1f5]">
        {t('welcome.withdrawTitle')}
      </p>
      <p className="mt-1 text-[13px] leading-5 text-[#9da2b4]">
        {t('welcome.withdrawBody', { bonuses: bonuses.join(', ') })}
      </p>
      <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 text-[13px] leading-5 text-[#f0f1f5]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#f9d028]"
        />
        {t('welcome.withdrawConfirm')}
      </label>
    </div>
  );
};

export default WelcomeWithdrawalNotice;
