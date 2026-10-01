import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CrownIcon } from '@/components/icons';
import { formatAmount, withCurrency } from '@/utils/money';
import type { RewardSummary } from '@/types';

const Stat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 truncate text-sm font-semibold text-slate-100 tabular-nums">{value}</dd>
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
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300"
            aria-hidden="true"
          >
            <CrownIcon size={24} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {t('rewards.tier')}
            </p>
            <p className="text-xl font-extrabold text-white">{tier?.name ?? t('rewards.noTier')}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
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
          className="h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.tier_progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-[width] duration-500"
            style={{ width: `${summary.tier_progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400 tabular-nums">
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
