import { useEffect, useId, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CloseIcon } from '@/components/icons';
import { getRollover } from '@/services/rollover';
import {
  ROLLOVER_PROGRESSION_LIMIT,
  ROLLOVER_STATUS_KEYS,
  ROLLOVER_STATUS_STYLE,
} from '@/constants/rollover';
import { formatWalletAmount } from '@/utils/money';
import type { ApiError, DepositRollover, DepositRolloverDetail } from '@/types';

interface Props {
  rollover: DepositRollover;
  locale: string;
  onClose: () => void;
}

const Row: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2 last:border-0">
    <dt className="shrink-0 text-[12px] text-white/50">{label}</dt>
    <dd className="min-w-0 truncate text-right text-[13px] font-medium text-[#f0f1f5]">{value}</dd>
  </div>
);

const RolloverDetailsModal: FC<Props> = ({ rollover, locale, onClose }) => {
  const { t } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const titleId = useId();
  const dialogRef = useModalA11y(onClose);

  const [detail, setDetail] = useState<DepositRolloverDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setDetail(null);
    setFailed(false);

    void getRollover(rollover.id)
      .then((res) => {
        if (!live) return;
        if (res?.success && res.data) {
          setDetail(res.data);
        } else {
          setFailed(true);
        }
      })
      .catch((err: ApiError) => {
        if (live) {
          setFailed(true);
          console.warn('Could not load rollover detail', err?.message);
        }
      });

    return () => {
      live = false;
    };
  }, [rollover.id]);

  const formatMoment = (iso: string | null): string =>
    iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  if (typeof document === 'undefined') {
    return null;
  }

  const progressions = detail?.progressions ?? [];

  const shown = detail ?? rollover;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="rl-modal-glass flex max-h-[96vh] w-full max-w-[520px] flex-col p-5 outline-none sm:max-h-[92vh] sm:p-7"
      >
        <div className="flex shrink-0 items-start">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-[18px] leading-7 font-semibold tracking-[-0.4px] text-[#f0f1f5] sm:text-[22px]"
          >
            {t('roll.detail.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('roll.detail.close')}
            className="rl-chip -mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-[#f0f1f5]"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="thin-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto">
          <div className="text-center">
            <p className="text-[12px] text-white/50">{t('roll.detail.remaining')}</p>
            <p className="mt-0.5 text-[26px] font-semibold text-[#ffe779]">
              {formatCurrencyDisplay(shown.wagering_remaining)}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLLOVER_STATUS_STYLE[shown.status]}`}
            >
              {t(ROLLOVER_STATUS_KEYS[shown.status])}
            </span>
          </div>

          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={shown.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('roll.table.progress')}
          >
            <div
              className={`h-full rounded-full ${
                shown.status === 'COMPLETED' ? 'bg-[#35d07f]' : 'bg-[#f9d028]'
              }`}
              style={{ width: `${shown.progress}%` }}
            />
          </div>

          <dl className="mt-4">
            {shown.deposit && (
              <>
                <Row
                  label={t('roll.detail.deposit')}
                  value={formatWalletAmount(shown.deposit.amount, shown.deposit.currency_code)}
                />
                <Row
                  label={t('roll.detail.depositValue')}
                  value={
                    shown.deposit.amount_usd ? formatCurrencyDisplay(shown.deposit.amount_usd) : '—'
                  }
                />
              </>
            )}
            {shown.bonus && (
              <>
                <Row label={t('roll.detail.bonus')} value={shown.bonus.name} />
                <Row
                  label={t('roll.detail.bonusAmount')}
                  value={formatCurrencyDisplay(shown.base_amount)}
                />
              </>
            )}
            <Row
              label={t('roll.detail.multiplier')}
              value={t('roll.multiplier', { times: Number(shown.wagering_multiplier) })}
            />
            <Row
              label={t('roll.detail.required')}
              value={formatCurrencyDisplay(shown.wagering_required)}
            />
            <Row
              label={t('roll.detail.completed')}
              value={formatCurrencyDisplay(shown.wagering_completed)}
            />
            <Row label={t('roll.detail.opened')} value={formatMoment(shown.created_at)} />
            {shown.completed_at && (
              <Row label={t('roll.detail.cleared')} value={formatMoment(shown.completed_at)} />
            )}
            {shown.bonus?.status === 'ACTIVE' && shown.bonus.expires_at && (
              <Row label={t('roll.detail.expires')} value={formatMoment(shown.bonus.expires_at)} />
            )}
            {shown.deposit?.tx_hash && (
              <Row
                label={t('roll.detail.txHash')}
                value={
                  <span className="font-mono text-[11px] text-white/64">
                    {shown.deposit.tx_hash}
                  </span>
                }
              />
            )}
          </dl>

          <h3 className="mt-5 text-[12px] font-semibold tracking-wide text-white/40 uppercase">
            {t('roll.detail.bets')}
          </h3>

          {failed ? (
            <p className="mt-2 text-[12px] text-white/50">{t('roll.detail.loadFailed')}</p>
          ) : !detail ? (
            <p className="mt-2 text-[12px] text-white/40">{t('common.loading')}</p>
          ) : progressions.length === 0 ? (
            <p className="mt-2 text-[12px] text-white/50">{t('roll.detail.betsEmpty')}</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {progressions.map((progression) => (
                <li
                  key={progression.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2"
                >
                  <span className="text-[11px] text-white/50">
                    {formatMoment(progression.created_at)}
                  </span>
                  <span className="text-[12px] text-white/72">
                    {t('roll.detail.betStake')} {formatCurrencyDisplay(progression.bet_amount)}
                    {progression.wagering_progress !== progression.bet_amount && (
                      <span className="ml-2 text-[#ffe779]">
                        {t('roll.detail.betCounted')}{' '}
                        {formatCurrencyDisplay(progression.wagering_progress)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {progressions.length >= ROLLOVER_PROGRESSION_LIMIT && (
            <p className="mt-2 text-[11px] text-white/40">
              {t('roll.detail.betsCapped', { count: ROLLOVER_PROGRESSION_LIMIT })}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RolloverDetailsModal;
