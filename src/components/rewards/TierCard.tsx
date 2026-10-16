import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CrownIcon } from '@/components/icons';
import { formatAmount, withCurrency } from '@/utils/money';
import type { RewardSummary } from '@/types';
import {
  ICON_WELL,
  LABEL,
  MUTED,
  PANEL,
  PROGRESS_FILL,
  PROGRESS_TRACK,
  TILE,
} from './rewardStyles';

const Stat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className={`min-w-0 ${TILE}`}>
    <dt className={LABEL}>{label}</dt>
    <dd className="mt-0.5 truncate text-[18px] leading-7 font-medium text-[#f0f1f5] tabular-nums">
      {value}
    </dd>
  </div>
);

/**
 * The player's VIP standing: their tier, the rates it earns, lifetime wagering
 * and how far the next tier is. Tiers are set by lifetime wagering alone.
 */
const TierCard: FC<{ summary: RewardSummary }> = ({ summary }) => {
  const { t } = useTranslation();
  const { tier, next_tier: next, currency } = summary;
  const money = (amount: string): string => withCurrency(formatAmount(amount), currency);

  return (
    <section className={PANEL}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <span className={ICON_WELL(true)} aria-hidden="true">
            <CrownIcon size={24} />
          </span>
          <div>
            <p className={LABEL}>{t('rewards.tier')}</p>
            <p className="text-[28px] leading-9 font-semibold tracking-[-0.02em] text-[#f0f1f5]">
              {tier?.name ?? t('rewards.noTier')}
            </p>
          </div>
        </div>

        <dl className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
          <Stat label={t('rewards.lifetimeWagered')} value={money(summary.lifetime_wagered)} />
          <Stat label={t('rewards.claimedTotal')} value={money(summary.claimed_total)} />
          <Stat
            label={t('rewards.col.rakeback')}
            value={tier ? `${tier.rakeback_percentage}%` : '—'}
          />
          <Stat
            label={t('rewards.col.cashback')}
            value={tier ? `${tier.cashback_percentage}%` : '—'}
          />
        </dl>
      </div>

      <div className="mt-5">
        <div
          className={PROGRESS_TRACK}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.tier_progress}
        >
          <div className={PROGRESS_FILL} style={{ width: `${summary.tier_progress}%` }} />
        </div>
        <p className={`mt-3 tabular-nums ${MUTED}`}>
          {next && summary.next_tier_remaining
            ? t('rewards.toNextTier', {
                amount: money(summary.next_tier_remaining),
                tier: next.name,
              })
            : t('rewards.topTier')}
        </p>
      </div>
    </section>
  );
};

export default TierCard;
