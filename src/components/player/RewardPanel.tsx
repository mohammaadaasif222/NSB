import { useEffect, type FC } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { PanelHeader } from '@/components/player/HeaderPopover';
import ButtonLoader from '@/components/ButtonLoader';
import { ClockIcon, LinkIcon, REWARD_ICONS, TrophyIcon } from '@/components/icons';
import { analytics } from '@/services/analytics';
import { useRewards } from '@/hooks/useRewards';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';

/**
 * Rewards tray.
 *
 * Each row is one of the five rewards from GET /rewards/me: a Claim button
 * when something is claimable, otherwise what is building up and when it turns
 * claimable. Rewards switched off in the console are left out.
 *
 * The raffle card above the list is still a placeholder — there is no raffle
 * behind it yet.
 */

/** The headline raffle, which sits above the list on its own card. */
const RaffleCard: FC = () => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-700 p-3">
    <span
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300"
      aria-hidden="true"
    >
      <TrophyIcon size={18} />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-extrabold text-white">
        $20,000 WEEKLY RAFFLE
      </span>
      <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Raffle entry active
      </span>
    </span>

    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-300 tabular-nums">
      <LinkIcon size={12} />0
    </span>
  </div>
);

interface RowProps {
  reward: RewardTypeSummary;
  currency: string;
  clockOffset: number;
  /** The reward whose claim is in flight, if any — every Claim waits on it. */
  claiming: RewardType | null;
  onClaim: (type: RewardType) => void;
}

const RewardRow: FC<RowProps> = ({ reward, currency, clockOffset, claiming, onClaim }) => {
  const { t } = useTranslation();
  const Icon = REWARD_ICONS[reward.type];

  const claimable = reward.claimable_count > 0;
  const accruing = Number(reward.pending_amount) > 0;
  const expiresIn = useCountdown(claimable ? reward.expires_at : null, clockOffset);
  const availableIn = useCountdown(claimable ? null : reward.available_at, clockOffset);

  let detail: string;
  if (claimable) {
    detail = `${formatRewardAmount(reward.claimable_amount, currency)} · ${t('rewards.expiresIn', {
      time: formatCountdown(expiresIn ?? 0),
    })}`;
  } else if (accruing) {
    // Past its cycle end but not settled yet — the server is a pass behind.
    detail = availableIn
      ? `${t('rewards.pending', { amount: formatRewardAmount(reward.pending_amount, currency) })} · ${t(
          'rewards.availableIn',
          { time: formatCountdown(availableIn) }
        )}`
      : t('rewards.processing');
  } else {
    detail = t('rewards.nothingYet');
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5">
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          claimable ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-600/20 text-blue-300'
        }`}
        aria-hidden="true"
      >
        <Icon size={15} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-slate-100">
          {t(REWARD_TITLE_KEYS[reward.type])}
        </span>
        <span className="block truncate text-[11px] text-slate-500 tabular-nums">{detail}</span>
      </span>

      {claimable ? (
        <button
          type="button"
          onClick={() => onClaim(reward.type)}
          disabled={claiming !== null}
          className="inline-flex h-7 min-w-[3.5rem] flex-shrink-0 items-center justify-center rounded-lg bg-amber-500 px-3 text-[11px] font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 transition-colors"
        >
          {claiming === reward.type ? <ButtonLoader /> : t('rewards.claim')}
        </button>
      ) : (
        <span
          className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-500"
          aria-hidden="true"
        >
          <ClockIcon size={13} />
        </span>
      )}
    </li>
  );
};

const Notice: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl bg-slate-900 border border-slate-700 px-4 py-5 text-center text-xs text-slate-400">
    {children}
  </div>
);

const RewardPanel: FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { openLogin } = useAuthModal();
  const { summary, error, claiming, clockOffset, refresh, claim } = useRewards();

  const visible = summary?.rewards.filter((reward) => reward.enabled) ?? [];

  const body = (): React.ReactNode => {
    if (!token) {
      return (
        <Notice>
          <p>{t('rewards.loginPrompt')}</p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
          >
            {t('account.login')}
          </button>
        </Notice>
      );
    }

    if (!summary) {
      return error ? (
        <Notice>
          <p>{t('rewards.loadFailed')}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-3 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {t('rewards.retry')}
          </button>
        </Notice>
      ) : (
        <Notice>{t('common.loading')}</Notice>
      );
    }

    return (
      <>
        <ul className="space-y-2.5">
          {visible.map((reward) => (
            <RewardRow
              key={reward.type}
              reward={reward}
              currency={summary.currency}
              clockOffset={clockOffset}
              claiming={claiming}
              onClaim={(type) => void claim(type)}
            />
          ))}
        </ul>
        <p className="px-1 text-[11px] leading-snug text-slate-500">
          {t('rewards.paidTo', {
            currency: summary.payout.currency_code,
            network: summary.payout.network_code,
          })}
        </p>
      </>
    );
  };

  // The tray is mounted when it opens, so this counts openings. Claiming is
  // inert until the bonus endpoints exist; interest in claiming is not.
  useEffect(() => {
    analytics.bonus.panelViewed();
  }, []);

  return (
    <>
      <PanelHeader
        title={t('nav.rewards')}
        action={
          summary?.tier ? (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
              {summary.tier.name}
            </span>
          ) : undefined
        }
      />

      <div className="max-h-[26rem] space-y-2.5 overflow-y-auto thin-scrollbar px-4 pb-3">
        <RaffleCard />
        {body()}
      </div>

      <div className="border-t border-slate-700 p-3">
        <Link
          href="/rewards"
          className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
        >
          {t('rewards.allRewards')}
        </Link>
      </div>
    </>
  );
};

export default RewardPanel;
