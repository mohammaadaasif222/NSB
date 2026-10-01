import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import ButtonLoader from '@/components/ButtonLoader';
import { REWARD_ICONS } from '@/components/icons';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { REWARD_DESCRIPTION_KEYS, REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';

interface Props {
  reward: RewardTypeSummary;
  currency: string;
  clockOffset: number;
  /** The reward whose claim is in flight, if any — every Claim waits on it. */
  claiming: RewardType | null;
  onClaim: (type: RewardType) => void;
}

/**
 * One reward on the rewards page: what can be claimed now and until when, what
 * is still building up and when it turns claimable, the rate at the player's
 * tier, and how a claim pays out.
 */
const RewardCard: FC<Props> = ({ reward, currency, clockOffset, claiming, onClaim }) => {
  const { t } = useTranslation();
  const Icon = REWARD_ICONS[reward.type];

  const claimable = reward.claimable_count > 0;
  const accruing = Number(reward.pending_amount) > 0;
  const expiresIn = useCountdown(claimable ? reward.expires_at : null, clockOffset);
  const availableIn = useCountdown(reward.available_at, clockOffset);

  // A zero countdown on a reward still accruing means its cycle has ended and
  // the server has not settled it yet.
  const accrualNote = availableIn
    ? t('rewards.availableIn', { time: formatCountdown(availableIn) })
    : t('rewards.processing');

  let split: string | null = null;
  if (reward.split && reward.type === 'CASHBACK') {
    split = t('rewards.splitCashback', {
      instant: reward.split.instant,
      monthly: reward.split.monthly,
    });
  } else if (reward.split) {
    split = t('rewards.split', {
      instant: reward.split.instant,
      weekly: reward.split.weekly,
      monthly: reward.split.monthly,
    });
  } else if (reward.type === 'WEEKLY' || reward.type === 'MONTHLY') {
    split = t('rewards.paidInFull');
  }

  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 ${
        claimable
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-900'
          : 'border-slate-800 bg-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            claimable ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-600/15 text-blue-300'
          }`}
          aria-hidden="true"
        >
          <Icon size={20} />
        </span>
        {reward.rate_percentage !== null && (
          <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 tabular-nums">
            {t('rewards.rate', { percent: reward.rate_percentage })}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-bold text-white">{t(REWARD_TITLE_KEYS[reward.type])}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {t(REWARD_DESCRIPTION_KEYS[reward.type])}
      </p>

      <div className="mt-4 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          {claimable ? t('rewards.readyToClaim') : t('rewards.status.pending')}
        </p>
        <p className="mt-0.5 text-2xl font-extrabold text-white tabular-nums">
          {formatRewardAmount(
            claimable ? reward.claimable_amount : reward.pending_amount,
            currency
          )}
        </p>
        <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
          {claimable
            ? t('rewards.expiresIn', { time: formatCountdown(expiresIn ?? 0) })
            : accruing
              ? accrualNote
              : t('rewards.nothingYet')}
        </p>
        {claimable && accruing && (
          <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
            {t('rewards.pending', { amount: formatRewardAmount(reward.pending_amount, currency) })}{' '}
            · {accrualNote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClaim(reward.type)}
        disabled={!claimable || claiming !== null}
        className={`mt-4 inline-flex h-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
          claimable
            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-60'
            : 'bg-slate-800 border border-slate-700 text-slate-500'
        }`}
      >
        {claiming === reward.type ? <ButtonLoader /> : t('rewards.claim')}
      </button>

      <div className="mt-4 space-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
        {split && <p>{split}</p>}
        <p className="flex items-center justify-between gap-2 tabular-nums">
          <span>{t('rewards.claimedTotal')}</span>
          <span className="text-slate-300">
            {formatRewardAmount(reward.claimed_total, currency)}
          </span>
        </p>
      </div>
    </article>
  );
};

export default RewardCard;
