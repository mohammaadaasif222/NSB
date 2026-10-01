import { useEffect, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SectionPlaceholder } from '@/components/profile/SectionShell';
import { UsersIcon } from '@/components/icons';
import { analytics } from '@/services/analytics';

/**
 * Referrals.
 *
 * No referral endpoint exists, so no code can be issued — showing a fabricated
 * one would be worse than useless, since a player might share it.
 */
const ReferralSection: FC = () => {
  const { t } = useTranslation();

  // Demand for a feature that does not exist yet: how many players go looking
  // for a referral code before there is one to give them.
  useEffect(() => {
    analytics.referral.sectionViewed();
  }, []);

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.referral')}>
        <SectionPlaceholder icon={<UsersIcon size={26} />} />
      </FieldGroup>
    </div>
  );
};

export default ReferralSection;
