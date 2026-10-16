import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import ButtonLoader from '@/components/ButtonLoader';
import { REWARD_ICONS } from '@/components/icons';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { REWARD_DESCRIPTION_KEYS, REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';
import { CARD, GHOST_BUTTON, GOLD_BUTTON, ICON_WELL, LABEL, MUTED, PILL } from './rewardStyles';

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
      // Ready to claim: the chosen-chip treatment — a gold edge and glow.
      className={`flex flex-col ${CARD} ${
        claimable ? 'ring-1 ring-[#f9d028]/60 shadow-[0_0_24px_rgba(249,208,40,0.18)]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={ICON_WELL(claimable)} aria-hidden="true">
          <Icon size={20} />
        </span>
        {reward.rate_percentage !== null && (
          <span className={PILL}>{t('rewards.rate', { percent: reward.rate_percentage })}</span>
        )}
      </div>

      <h3 className="mt-4 text-[18px] leading-7 font-medium text-[#f0f1f5]">
        {t(REWARD_TITLE_KEYS[reward.type])}
      </h3>
      <p className={`mt-1 ${MUTED}`}>{t(REWARD_DESCRIPTION_KEYS[reward.type])}</p>

      <div className="mt-5 flex-1">
        <p className={LABEL}>
          {claimable ? t('rewards.readyToClaim') : t('rewards.status.pending')}
        </p>
        <p
          className={`mt-0.5 text-[28px] leading-9 font-semibold tabular-nums ${claimable ? 'text-[#ffe779]' : 'text-[#f0f1f5]'}`}
        >
          {formatRewardAmount(
            claimable ? reward.claimable_amount : reward.pending_amount,
            currency
          )}
        </p>
        <p className={`mt-1 tabular-nums ${LABEL}`}>
          {claimable
            ? t('rewards.expiresIn', { time: formatCountdown(expiresIn ?? 0) })
            : accruing
              ? accrualNote
              : t('rewards.nothingYet')}
        </p>
        {claimable && accruing && (
          <p className={`mt-1 tabular-nums ${LABEL}`}>
            {t('rewards.pending', { amount: formatRewardAmount(reward.pending_amount, currency) })}{' '}
            · {accrualNote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClaim(reward.type)}
        disabled={!claimable || claiming !== null}
        className={`mt-5 w-full ${claimable ? GOLD_BUTTON : GHOST_BUTTON}`}
      >
        {claiming === reward.type ? <ButtonLoader /> : t('rewards.claim')}
      </button>

      <div className={`mt-5 space-y-1 border-t border-white/[0.08] pt-4 ${LABEL}`}>
        {split && <p>{split}</p>}
        <p className="flex items-center justify-between gap-2 tabular-nums">
          <span>{t('rewards.claimedTotal')}</span>
          <span className="text-[#f0f1f5]">
            {formatRewardAmount(reward.claimed_total, currency)}
          </span>
        </p>
      </div>
    </article>
  );
};

export default RewardCard;
