import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { formatRewardAmount } from '@/utils/money';
import type { ReferralSummary } from '@/types';

interface Props {
  summary: ReferralSummary | null;
  claiming: boolean;
  onCollect: () => void;
}

/**
 * What the referrer has made, and the button that pays it out.
 *
 * Four figures over a bar, inside the same edged card as the code beside it.
 * The design draws the four with absolute positions at uneven intervals; they
 * are equal tracks here, which keeps them evenly lit at any width and reads
 * the same — the dividers are what the eye measures them against, and those
 * stay between the same pairs.
 *
 * Below the breakpoint the four fall to a 2x2, as the phone design has it,
 * with a rule between the two columns of each row.
 */
const ReferralStats: FC<Props> = ({ summary, claiming, onCollect }) => {
  const { t } = useTranslation();
  const s = summary?.stats;
  const usd = (amount: string | undefined) => (amount ? formatRewardAmount(amount, 'USD') : '—');

  const stats: { key: string; label: string; value: string }[] = [
    { key: 'earnings', label: t('aff.totalEarnings'), value: usd(s?.total_earned) },
    { key: 'wagered', label: t('aff.totalWagered'), value: usd(s?.total_wagered) },
    { key: 'collected', label: t('aff.totalCollected'), value: usd(s?.claimed) },
    { key: 'referrals', label: t('aff.totalReferrals'), value: s ? String(s.referred) : '—' },
  ];
  const tier = summary?.tier;
  const notes = [
    tier?.current
      ? tier.next
        ? t('ref.tierNext', {
            rate: tier.current.rate,
            next: tier.next.rate,
            needed: Math.max(0, tier.next.min_active - (s?.active ?? 0)),
          })
        : t('ref.tierTop', { rate: tier.current.rate })
      : null,
    s && Number(s.held) > 0 ? t('ref.heldNote', { amount: usd(s.held) }) : null,
    s && Number(s.pending_review) > 0
      ? t('ref.reviewNote', { amount: usd(s.pending_review) })
      : null,
    summary && !summary.can_claim && Number(s?.available ?? 0) > 0
      ? t('ref.minClaimNote', { amount: usd(summary.min_claim) })
      : null,
  ].filter((note): note is string => !!note);

  return (
    <section className="rl-glass-edge @container flex h-full flex-col px-5 pt-[26px] pb-5 sm:px-6.5 sm:pt-13.75 sm:pb-6.5 2xl:px-8">
      {/* Four across wherever a quarter of the card can hold "$984,125.00" —
          every desktop, laptop and tablet width, because the figures change
          size rather than changing places. A monitor and a laptop must not read
          as two different designs.

          A phone is the one width where that stops being true: the card is 324
          of content there, a quarter is 73, and the longest figure needs 75 —
          so it truncates to "$984,125.0…". Below 384 of card it falls to the
          phone design's 2x2, a rule between each row's two columns. */}
      <div className="grid grid-cols-2 gap-y-[35px] [&>*:nth-child(even)]:border-s [&>*:nth-child(even)]:border-white/15 @sm:grid-cols-4 @sm:gap-y-0 @sm:[&>*+*]:border-s @sm:[&>*+*]:border-white/15">
        {stats.map((s) => (
          <div key={s.key} className="px-1 text-center @xl:px-2">
            <p className="truncate text-[24px] leading-8 font-semibold text-[#f0f1f5] @sm:text-[15px] @sm:leading-5 @sm:tracking-[-0.48px] @lg:text-[17px] @lg:leading-6 @xl:text-xl @xl:leading-7 @2xl:text-2xl @2xl:leading-8">
              {s.value}
            </p>
            <p className="mt-2 truncate text-[14px] leading-5 text-[#9da2b4] @sm:mt-1 @sm:text-[11px] @sm:leading-4 @2xl:mt-2 @2xl:text-sm @2xl:leading-5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* 69 tall against a 48 button is 10.5 of inset all round — the bar is the
          button's own pill grown by that much, which is why it is not a panel. */}
      <div className="mt-[29px] flex h-[70px] items-center gap-3 rounded-[34px] bg-white/7 py-2.5 ps-5 pe-3.5 @sm:mt-8 @sm:h-17.25 @sm:pe-2.5 @sm:ps-6.5 @2xl:mt-10.25">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] leading-4 text-[#9da2b4]">{t('aff.availableFunds')}</p>
          <p className="truncate text-[20px] leading-7 font-semibold tracking-normal text-[#f0f1f5] @sm:rl-h-card">
            {usd(s?.available)}
          </p>
        </div>

        <button
          type="button"
          onClick={onCollect}
          disabled={!summary?.can_claim || claiming}
          className="rl-btn-gold h-12 w-[104px] shrink-0 rounded-[34px] px-2 text-[18px] leading-7 font-medium disabled:opacity-50 sm:w-32.5"
        >
          {t('aff.collect')}
        </button>
      </div>

      {notes.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs leading-5 text-[#9da2b4]">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReferralStats;
