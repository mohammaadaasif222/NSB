import { useState, type FC } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { formatOfferAmount, formatRewardAmount } from '@/utils/money';
import type { UserBonus } from '@/types';

interface Props {
  award: UserBonus;
  currency: string;
  busy: boolean;
  onCancel: () => void;
  className?: string;
}

const money = (amount: string, currency: string): string =>
  formatRewardAmount(amount, currency, 'bonus.awards');

const WelcomeBonusPanel: FC<Props> = ({ award, currency, busy, onCancel, className = '' }) => {
  const { t } = useTranslation();
  const { summary } = useWallet();
  const [confirming, setConfirming] = useState(false);
  const left = useCountdown(award.expires_at);

  const real = summary?.balance?.real_amount ?? '0';
  const bonus = summary?.balance?.bonus_amount ?? award.bonus_amount;
  const multiplier =
    Number(award.bonus_amount) > 0
      ? Number(award.wagering_required) / Number(award.bonus_amount)
      : 0;
  const progress = Math.max(0, Math.min(100, award.progress));

  if (confirming) {
    return (
      <section
        className={`rounded-[24px] border border-[#f9d028]/40 bg-[#f9d028]/10 px-5 py-4 text-center ${className}`}
        aria-labelledby="welcome-cancel-title"
      >
        <p
          id="welcome-cancel-title"
          className="text-[12px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#f9d028]"
        >
          {t('welcome.cancelTitle')}
        </p>
        <p className="mt-2 text-[16px] font-semibold leading-6 text-[#f0f1f5]">
          {t('welcome.cancelBody')}
        </p>
        <dl className="mt-3 space-y-1.5 text-left text-[13px] leading-5">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9da2b4]">{t('welcome.cancelKeepsReal')}</dt>
            <dd className="font-semibold text-[#3ad07a]">{money(real, currency)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9da2b4]">{t('welcome.cancelRemoves')}</dt>
            <dd className="font-semibold text-[#f0f1f5]">{money(bonus, currency)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[12px] leading-4 text-white/48">{t('welcome.cancelOnce')}</p>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="rl-btn-gold mt-4 flex h-12 w-full items-center justify-center rounded-full text-[16px] font-semibold disabled:opacity-60"
        >
          {t('welcome.cancelKeep')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="mt-2.5 text-[13px] leading-5 text-[#9da2b4] underline underline-offset-2 hover:text-[#f0f1f5] disabled:opacity-60"
        >
          {busy ? <ButtonLoader /> : t('welcome.cancelConfirm')}
        </button>
      </section>
    );
  }

  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 ${className}`}
      aria-labelledby="welcome-panel-title"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="welcome-panel-title" className="text-[15px] font-semibold leading-5 text-[#f0f1f5]">
          {multiplier > 0
            ? t('welcome.panelTitle', {
                name: award.bonus.name,
                wagering: Number(multiplier.toFixed(2)),
              })
            : award.bonus.name}
        </h3>
        {left !== null && left > 0 && (
          <span className="shrink-0 text-[12px] leading-4 text-[#9da2b4]">
            {t('welcome.panelEnds', { time: formatCountdown(left) })}
          </span>
        )}
      </div>

      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={t('welcome.panelProgressLabel')}
      >
        <div className="h-full rounded-full bg-[#f9d028]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1.5 text-[12px] leading-4 text-[#9da2b4]">
        {t('welcome.panelProgress', {
          done: money(award.wagering_completed, currency),
          required: money(award.wagering_required, currency),
        })}
      </p>

      <dl className="mt-3 space-y-1.5 text-[13px] leading-5">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#9da2b4]">{t('welcome.panelReal')}</dt>
          <dd className="font-semibold text-[#3ad07a]">{money(real, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#9da2b4]">{t('welcome.panelBonus')}</dt>
          <dd className="font-semibold text-[#f9d028]">{money(bonus, currency)}</dd>
        </div>
        {award.max_convertible && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9da2b4]">{t('welcome.panelUnlock')}</dt>
            <dd className="font-semibold text-[#f0f1f5]">
              {formatOfferAmount(award.max_convertible, currency)}
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-2.5 text-[12px] leading-4 text-white/48">{t('welcome.panelHint')}</p>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-2 text-[13px] leading-5 text-[#9da2b4] underline underline-offset-2 hover:text-[#f0f1f5]"
      >
        {t('welcome.cancelLink')}
      </button>
    </section>
  );
};

export default WelcomeBonusPanel;
