import { useState, type FC, type FormEvent } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  /** The campaign or code whose claim is in flight, if any. */
  busyId: string | null;
  onRedeem: (couponCode: string) => Promise<unknown>;
}

/**
 * Redeem a bonus code.
 *
 * Not in the Figma frame, which draws the offers grid alone — but a player who
 * arrives holding a code has come here to type it, and there is nowhere else
 * in the app to do that. Kept, in the design's glass and type.
 */
const BonusCodeForm: FC<Props> = ({ busyId, onRedeem }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const couponCode = code.trim().toUpperCase();
    if (!couponCode) {
      return;
    }
    if (await onRedeem(couponCode)) {
      setCode('');
    }
  };

  return (
    <section className="rl-glass-deep max-lg:rl-glass-clear rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*24)]">
      <h2 className="text-[16px] font-semibold leading-6 text-[#f0f1f5] lg:text-[length:max(13px,calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
        {t('bonus.haveACode')}
      </h2>
      <p className="mt-1 text-[13px] leading-5 text-white/64 lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
        {t('bonus.haveACodeHint')}
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t('bonus.codePlaceholder')}
          aria-label={t('bonus.haveACode')}
          className="rl-field h-12 flex-1 rounded-full px-5 text-[15px] font-medium tracking-wide lg:h-[calc(var(--u)*56)] lg:text-[length:max(12px,calc(var(--u)*18))]"
        />
        <button
          type="submit"
          disabled={busyId !== null || !code.trim()}
          className="rl-btn-gold flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-semibold disabled:cursor-not-allowed lg:h-[calc(var(--u)*56)] lg:px-[calc(var(--u)*40)] lg:text-[length:max(12px,calc(var(--u)*18))]"
        >
          {busyId === code.trim().toUpperCase() ? <ButtonLoader /> : t('bonus.redeem')}
        </button>
      </form>
    </section>
  );
};

export default BonusCodeForm;
