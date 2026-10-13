import { useEffect, type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import ButtonLoader from '@/components/ButtonLoader';
import { REWARD_ICONS } from '@/components/icons';
import { analytics } from '@/services/analytics';
import { useRewards } from '@/hooks/useRewards';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';

/**
 * Rewards tray, as the design draws it: the raffle card, a row per reward,
 * and All Rewards.
 *
 * Each row is one of the rewards from GET /rewards/me — the design's sample
 * rows (Daily Reload, Pre-Monthly…) are not rewards the platform has, so the
 * real ones are drawn in their style instead. On the right, Claim when
 * something is claimable, otherwise what is building up. Rewards switched off
 * in the console are left out.
 *
 * The raffle card is still a placeholder — there is no raffle behind it yet.
 */

/* Every size is written out in full: Tailwind only generates class names it
   can read whole in the source. 16/500 titles, 12/500 uppercase subtitles. */
const TITLE =
  'block truncate text-[16px] font-medium leading-6 text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const SUBTITLE =
  'block truncate text-[12px] font-medium uppercase leading-5 tracking-[1px] text-[#9da2b4] tabular-nums lg:text-[length:max(min(11px,12px),calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]';
const GOLD =
  'text-[16px] font-medium leading-6 text-[#ffe779] tabular-nums lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/** The headline raffle, on a lighter card above the list. */
const RaffleCard: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-[94px] items-center gap-3 rounded-[34px] rl-drop-pane bg-white/20 px-4 lg:h-[calc(var(--u)*94)] lg:gap-[calc(var(--u)*12)] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*16)]">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#666666] lg:h-[calc(var(--u)*36)] lg:w-[calc(var(--u)*36)] lg:rounded-[calc(var(--u)*8)]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 18 18"
          fill="none"
          className="h-[18px] w-[18px] lg:h-[calc(var(--u)*18)] lg:w-[calc(var(--u)*18)]"
        >
          <rect x="2" y="2" width="14" height="14" rx="2" stroke="#d0d0d0" strokeWidth="2" />
          <circle cx="6.5" cy="6.5" r="1.5" fill="#d0d0d0" />
          <path d="M16 11.5 12 7.5 3 16" stroke="#d0d0d0" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className={TITLE}>{t('lobby.raffle.title', { amount: '$20,000' })}</span>
        <span className={`${SUBTITLE} mt-0.5`}>{t('lobby.raffle.active')}</span>
      </span>
    </div>
  );
};

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
    <li className="flex h-[70px] items-center gap-3 rounded-[24px] rl-drop-pane bg-white/10 px-4 pe-5 lg:h-[calc(var(--u)*70)] lg:gap-[calc(var(--u)*12)] lg:rounded-[calc(var(--u)*24)] lg:pe-[calc(var(--u)*20)] lg:ps-[calc(var(--u)*16)]">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-[#f0f1f5]/80 lg:h-[calc(var(--u)*36)] lg:w-[calc(var(--u)*36)]"
        aria-hidden="true"
      >
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className={TITLE}>{t(REWARD_TITLE_KEYS[reward.type])}</span>
        <span className={SUBTITLE}>{detail}</span>
      </span>

      {claimable ? (
        <button
          type="button"
          onClick={() => onClaim(reward.type)}
          disabled={claiming !== null}
          className={`${GOLD} flex-shrink-0 transition-[filter] hover:brightness-125 disabled:opacity-60`}
        >
          {claiming === reward.type ? <ButtonLoader /> : t('rewards.claim')}
        </button>
      ) : (
        <span className={`${GOLD} flex-shrink-0`}>
          {formatRewardAmount(reward.pending_amount, currency)}
        </span>
      )}
    </li>
  );
};

/** A message in a row's place — signed out, loading or failed. */
const Notice: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-[24px] bg-white/10 px-4 py-5 text-center text-[14px] leading-5 rl-drop-pane text-[#9da2b4] lg:rounded-[calc(var(--u)*24)]">
    {children}
  </div>
);

const RewardPanel: FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { openLogin } = useAuthModal();
  const { summary, error, claiming, clockOffset, refresh, claim } = useRewards();

  const visible = summary?.rewards.filter((reward) => reward.enabled) ?? [];

  const body = (): ReactNode => {
    if (!token) {
      return (
        <Notice>
          <p>{t('rewards.loginPrompt')}</p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-[#f9d028] px-5 text-[14px] font-medium text-[#07080a] transition-[filter] hover:brightness-110"
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
            className="mt-3 inline-flex h-9 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium text-[#f0f1f5] transition-colors hover:bg-white/15"
          >
            {t('rewards.retry')}
          </button>
        </Notice>
      ) : (
        <Notice>{t('common.loading')}</Notice>
      );
    }

    return (
      <ul className="flex flex-col gap-2.5 lg:gap-[calc(var(--u)*10)]">
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
    );
  };

  // The tray is mounted when it opens, so this counts openings. Claiming is
  // inert until the bonus endpoints exist; interest in claiming is not.
  useEffect(() => {
    analytics.bonus.panelViewed();
  }, []);

  return (
    <div className="thin-scrollbar max-h-[calc(100dvh-140px)] overflow-y-auto p-4 pb-[26px] lg:p-[calc(var(--u)*16)] lg:pb-[calc(var(--u)*26)]">
      <RaffleCard />
      <div className="mt-3.5 lg:mt-[calc(var(--u)*14)]">{body()}</div>
      <Link
        href="/rewards"
        className="mt-[18px] flex h-14 items-center justify-center rounded-full bg-[#f9d028] text-[18px] font-medium leading-7 text-[#07080a] transition-[filter] hover:brightness-110 lg:mt-[calc(var(--u)*18)] lg:h-[calc(var(--u)*56)] lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
      >
        {t('rewards.allRewards')}
      </Link>
    </div>
  );
};

export default RewardPanel;
