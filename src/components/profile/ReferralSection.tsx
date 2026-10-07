import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import ReferralCodeCard from '@/components/profile/referral/ReferralCodeCard';
import ReferralTable from '@/components/profile/referral/ReferralTable';
import { fetchReferrals, type ReferralRow } from '@/components/profile/referral/mockReferral';
import { analytics } from '@/services/analytics';

/**
 * Referrals.
 *
 * NOT WIRED. There is no referral endpoint: the code and every row below come
 * from `referral/mockReferral.ts`, which is the one file to replace. The code
 * in particular must not ship as it stands — see the note in that file.
 *
 * The design puts a second card beside the code, and leaves it empty. Nothing
 * is rendered there rather than shipping a hollow box; the column is held open
 * so dropping its content in later needs no layout change.
 */
const ReferralSection: FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<readonly ReferralRow[]>([]);

  // Demand for a feature that does not exist yet: how many players go looking
  // for a referral code before there is one to give them.
  useEffect(() => {
    analytics.referral.sectionViewed();
  }, []);

  useEffect(() => {
    let live = true;
    void fetchReferrals().then((result) => {
      if (live) setRows(result.rows);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div>
      <h2 className={SECTION_HEADING}>{t('profile.referral')}</h2>

      <div className="mt-[calc(var(--u)*29)] grid gap-[calc(var(--u)*22)] lg:grid-cols-2">
        <ReferralCodeCard />
      </div>

      <div className="mt-[calc(var(--u)*22)]">
        <ReferralTable rows={rows} />
      </div>
    </div>
  );
};

export default ReferralSection;
