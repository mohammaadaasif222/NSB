import type { FC } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { TicketIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { BONUS_TITLE_KEYS } from '@/constants/bonus';
import { formatRewardAmount, formatWalletAmount } from '@/utils/money';
import type { UserBonus } from '@/types';

interface Props {
  award: UserBonus;
  currency: string;
  /** Server clock minus device clock — pass to useCountdown. */
  clockOffset: number;
  busyId: string | null;
  onForfeit: (awardId: string) => void;
}

/**
 * One award the player is working through.
 *
 * The progress bar is the point of the card: a wagering requirement is the
 * thing standing between the player and their money, and "$180 of $600
 * wagered" answers the question they actually have. The number is repeated in
 * text beside the bar, so the state is never carried by the bar's width alone.
 */
const ActiveBonusCard: FC<Props> = ({ award, currency, clockOffset, busyId, onForfeit }) => {
  const { t } = useTranslation();

  const busy = busyId === award.id;
  const expiresIn = useCountdown(award.expires_at, clockOffset);
  const hasRequirement = Number(award.wagering_required) > 0;

  return (
    <article className="rl-glass-deep max-lg:rl-glass-clear rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#252937] text-white/30"
            aria-hidden="true"
          >
            <TicketIcon size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-white">{award.bonus.name}</h3>
            <p className="text-[13px] text-white/50">{t(BONUS_TITLE_KEYS[award.bonus.type])}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[20px] font-semibold text-white">
            {formatRewardAmount(award.bonus_amount, currency)}
          </p>
          {award.credit_amount && award.credit_currency && (
            <p className="text-[12px] text-white/50">
              {formatWalletAmount(award.credit_amount, award.credit_currency)}
            </p>
          )}
        </div>
      </div>

      {hasRequirement ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              {t('bonus.wageringProgress')}
            </span>
            <span className="text-[11px] text-white/64">
              {formatRewardAmount(award.wagering_completed, currency)} /{' '}
              {formatRewardAmount(award.wagering_required, currency)}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={award.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('bonus.wageringProgress')}
          >
            <div
              className="h-full rounded-full bg-[#f9d028] transition-[width] duration-500"
              style={{ width: `${award.progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/50">
            {t('bonus.remaining', {
              amount: formatRewardAmount(award.wagering_remaining, currency),
            })}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[#35d07f]">
          {award.is_real_money ? t('bonus.noWageringReal') : t('bonus.noWagering')}
        </p>
      )}

      {/* The two terms that end an award early, stated plainly. */}
      <dl className="mt-3 space-y-1">
        {award.free_spins_awarded > 0 && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[11px] text-white/50">{t('bonus.freeSpins')}</dt>
            <dd className="text-[11px] text-white/72">
              {award.free_spins_awarded - award.free_spins_used} / {award.free_spins_awarded}
            </dd>
          </div>
        )}
        {award.max_bet_size && Number(award.max_bet_size) > 0 && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[11px] text-white/50">{t('bonus.maxBet')}</dt>
            <dd className="text-[11px] text-white/72">
              {formatRewardAmount(award.max_bet_size, currency)}
            </dd>
          </div>
        )}
        {award.expires_at && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[11px] text-white/50">{t('bonus.expiresIn')}</dt>
            <dd className="text-[11px] text-[#f9d028]">
              {expiresIn ? formatCountdown(expiresIn) : t('bonus.expiringNow')}
            </dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        onClick={() => onForfeit(award.id)}
        disabled={busyId !== null}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-white/12 text-[12px] font-semibold text-white/64 transition-colors hover:border-[#ef4462]/40 hover:text-[#ef4462] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <ButtonLoader /> : t('bonus.forfeit')}
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-white/40">
        {t('bonus.forfeitHint')}
      </p>
    </article>
  );
};

export default ActiveBonusCard;
