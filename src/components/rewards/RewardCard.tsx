import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import ButtonLoader from '@/components/ButtonLoader';
import { REWARD_ICONS } from '@/components/icons';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';
import RewardDetailModal from './RewardDetailModal';
import RewardInfoButton from './RewardInfoButton';
import { CARD, GHOST_BUTTON, GOLD_BUTTON, ICON_WELL, LABEL } from './rewardStyles';

interface Props {
  reward: RewardTypeSummary;
  currency: string;
  clockOffset: number;
  /** The reward whose claim is in flight, if any — every Claim waits on it. */
  claiming: RewardType | null;
  onClaim: (type: RewardType) => void;
}

/**
 * One reward on the rewards page: what can be claimed now and until when, and
 * what is still building up and when it turns claimable.
 *
 * The card carries only what changes — the figure, the countdown, the Claim
 * button. What a reward *is*, how often it settles, how a claim splits across
 * the cycles, what it is worked out from and what a VIP gets extra is standing
 * copy that read the same on all five cards; it sits behind the info button
 * now (RewardDetailModal). A player scanning for something to claim sees five
 * short cards at once instead of scrolling past five paragraphs they have
 * already read, and the detail they do want has room to be complete.
 */
const RewardCard: FC<Props> = ({ reward, currency, clockOffset, claiming, onClaim }) => {
  const { t } = useTranslation();
  const Icon = REWARD_ICONS[reward.type];
  const [infoOpen, setInfoOpen] = useState(false);

  const claimable = reward.claimable_count > 0;
  const accruing = Number(reward.pending_amount) > 0;
  const expiresIn = useCountdown(claimable ? reward.expires_at : null, clockOffset);
  const availableIn = useCountdown(reward.available_at, clockOffset);

  // A zero countdown on a reward still accruing means its cycle has ended and
  // the server has not settled it yet.
  const accrualNote = availableIn
    ? t('rewards.availableIn', { time: formatCountdown(availableIn) })
    : t('rewards.processing');

  const title = t(REWARD_TITLE_KEYS[reward.type]);

  return (
    <article
      // Ready to claim: the chosen-chip treatment — a gold edge and glow.
      className={`flex h-full flex-col ${CARD} ${
        claimable ? 'ring-1 ring-[#f9d028]/60 shadow-[0_0_24px_rgba(249,208,40,0.18)]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={ICON_WELL(claimable)} aria-hidden="true">
          <Icon size={20} />
        </span>
        <RewardInfoButton
          reward={title}
          open={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        />
      </div>

      <h3 className="mt-3 text-[16px] leading-6 font-medium text-[#f0f1f5]">{title}</h3>

      <div className="mt-3 flex-1">
        <p className={LABEL}>
          {claimable ? t('rewards.readyToClaim') : t('rewards.status.pending')}
        </p>
        <p
          className={`mt-0.5 text-[24px] leading-8 font-semibold tabular-nums ${claimable ? 'text-[#ffe779]' : 'text-[#f0f1f5]'}`}
        >
          {formatRewardAmount(
            claimable ? reward.claimable_amount : reward.pending_amount,
            currency
          )}
        </p>
        <p className={`mt-0.5 tabular-nums ${LABEL}`}>
          {claimable
            ? t('rewards.expiresIn', { time: formatCountdown(expiresIn ?? 0) })
            : accruing
              ? accrualNote
              : t('rewards.nothingYet')}
        </p>
        {claimable && accruing && (
          <p className={`mt-0.5 tabular-nums ${LABEL}`}>
            {t('rewards.pending', { amount: formatRewardAmount(reward.pending_amount, currency) })}{' '}
            · {accrualNote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClaim(reward.type)}
        disabled={!claimable || claiming !== null}
        className={`mt-4 w-full ${claimable ? GOLD_BUTTON : GHOST_BUTTON}`}
      >
        {claiming === reward.type ? <ButtonLoader /> : t('rewards.claim')}
      </button>

      {infoOpen && (
        <RewardDetailModal
          type={reward.type}
          summary={reward}
          currency={currency}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </article>
  );
};

export default RewardCard;
