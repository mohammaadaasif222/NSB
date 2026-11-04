import { useEffect, type FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import ReferralCodeCard from '@/components/profile/referral/ReferralCodeCard';
import ReferralTable from '@/components/profile/referral/ReferralTable';
import TablePager from '@/components/profile/transactions/TablePager';
import { useReferral } from '@/hooks/useReferral';
import { analytics } from '@/services/analytics';
import { formatRewardAmount } from '@/utils/money';

/** Referrals in the account area: the default code, totals, and who signed up. */
const ReferralSection: FC = () => {
  const { t } = useTranslation();
  const features = usePlatformFeatures();
  const { summary, referred, pagination, page, setPage } = useReferral();
  const code = summary?.codes.find((c) => c.is_active)?.code ?? null;

  useEffect(() => {
    analytics.referral.sectionViewed();
  }, []);

  if (features.loaded && !features.referrals) {
    return (
      <div>
        <h2 className={SECTION_HEADING}>{t('profile.referral')}</h2>
        <p className="mt-6 text-sm text-[#9da2b4]">{t('ref.unavailable')}</p>
      </div>
    );
  }

  const stats = summary?.stats;
  const figures = [
    {
      label: t('aff.availableFunds'),
      value: stats ? formatRewardAmount(stats.available, 'USD') : '—',
    },
    {
      label: t('aff.totalEarnings'),
      value: stats ? formatRewardAmount(stats.total_earned, 'USD') : '—',
    },
    { label: t('aff.totalReferrals'), value: stats ? String(stats.referred) : '—' },
    {
      label: t('ref.commissionRate'),
      value: summary?.tier.current ? `${summary.tier.current.rate}%` : '—',
    },
  ];

  return (
    <div>
      <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.referral')}</h2>

      <div className="grid gap-[calc(var(--u)*22)] lg:mt-[calc(var(--u)*29)] lg:grid-cols-2">
        <ReferralCodeCard code={code} />

        <div className="rl-panel flex flex-col gap-[calc(var(--u)*16)] p-[calc(var(--u)*20)] max-lg:hidden">
          <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-[calc(var(--u)*12)]">
            {figures.map((f) => (
              <div
                key={f.label}
                className="rl-field-card flex min-w-0 flex-col items-center justify-center rounded-[calc(var(--u)*24)] px-3 text-center"
              >
                <p className="max-w-full truncate text-2xl leading-8 font-semibold text-[#f0f1f5]">
                  {f.value}
                </p>
                <p className="mt-1 max-w-full truncate text-sm leading-5 text-[#9da2b4]">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/referral"
            className="rl-btn-gold flex h-12 items-center justify-center rounded-[34px] px-4 text-base font-medium"
          >
            {t('ref.openDashboard')}
          </Link>
        </div>
      </div>

      <div className="mt-4 lg:mt-[calc(var(--u)*22)]">
        <ReferralTable rows={referred} />
      </div>
      {pagination && (
        <div className="mt-5">
          <TablePager page={page} totalPages={pagination.totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
};

export default ReferralSection;
