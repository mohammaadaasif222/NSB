import { useEffect, useId, useState, type FC } from 'react';
import { createPortal } from 'react-dom';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CloseIcon } from '@/components/icons';
import CircleIconButton from '@/components/ui/CircleIconButton';
import { formatRewardAmount } from '@/utils/money';
import type { BonusTrail, UserBonus } from '@/types';

const money = (amount: string, currency: string): string =>
  formatRewardAmount(amount, currency, 'bonus.awards');

const BonusTrailModal: FC<{ award: UserBonus; currency: string; onClose: () => void }> = ({
  award,
  currency,
  onClose,
}) => {
  const { t, locale } = useTranslation();
  const titleId = useId();
  const dialogRef = useModalA11y(onClose);
  const [trail, setTrail] = useState<BonusTrail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    void apiService
      .get<BonusTrail>(`/bonuses/${award.id}/trail`)
      .then((res) => {
        if (!live) return;
        if (res?.success && res.data) setTrail(res.data);
        else setFailed(true);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [award.id]);

  if (typeof document === 'undefined') return null;

  const bets = trail?.bets ?? [];

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
        onClick={(e) => e.stopPropagation()}
        className="rl-glass-deep flex max-h-[85vh] w-full max-w-[640px] flex-col rounded-t-[28px] p-5 sm:rounded-[34px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[18px] font-semibold text-white">
              {t('bonus.trailTitle')}
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-white/50">{award.bonus.name}</p>
          </div>
          <CircleIconButton onClick={onClose} label={t('common.close')}>
            <CloseIcon size={16} />
          </CircleIconButton>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {failed ? (
            <p className="text-[14px] text-white/64">{t('bonus.trailFailed')}</p>
          ) : !trail ? (
            <p className="text-[14px] text-white/64">{t('common.loading')}</p>
          ) : bets.length === 0 ? (
            <p className="text-[14px] text-white/64">{t('bonus.trailEmpty')}</p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
                  <th className="py-2 pr-2 font-semibold">{t('bonus.trailGame')}</th>
                  <th className="py-2 pr-2 text-right font-semibold">{t('bonus.trailBet')}</th>
                  <th className="py-2 pr-2 text-right font-semibold">{t('bonus.trailCounts')}</th>
                  <th className="py-2 text-right font-semibold">{t('bonus.trailAdded')}</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, index) => (
                  <tr
                    key={bet.bet_id ?? `${bet.created_at}-${index}`}
                    className="border-b border-white/5 text-[13px] text-white/80"
                  >
                    <td className="py-2 pr-2">
                      <span className="block max-w-[180px] truncate">
                        {bet.game ?? t('bonus.trailOther')}
                      </span>
                      <span className="block text-[11px] text-white/40">
                        {new Date(bet.created_at).toLocaleString(locale, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right">
                      {money(bet.bet_amount, currency)}
                      {bet.counted_amount && bet.counted_amount !== bet.bet_amount && (
                        <span className="block text-[11px] text-[#f9d028]">
                          {t('bonus.trailCapped', { amount: money(bet.counted_amount, currency) })}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-right">{bet.contribution}%</td>
                    <td className="py-2 text-right text-[#35d07f]">
                      {money(bet.wagering_progress, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BonusTrailModal;
