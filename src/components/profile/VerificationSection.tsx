import { useEffect, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow, SectionPlaceholder } from '@/components/profile/SectionShell';
import { RowButton } from '@/components/profile/ProfileInfoRow';
import { BadgeCheckIcon, CheckIcon, MailIcon } from '@/components/icons';
import { analytics } from '@/services/analytics';
import type { ApiUser } from '@/types/profile';

interface Props {
  me: ApiUser;
  onChangeEmail: () => void;
}

/**
 * Account verification.
 *
 * Email is the one check the backend actually performs, so it is reported for
 * real. Identity documents (KYC) have no endpoint behind them yet.
 */
const VerificationSection: FC<Props> = ({ me, onChangeEmail }) => {
  const { t } = useTranslation();
  // Absent on accounts the backend has not answered for yet, which for this
  // purpose is the same as not verified.
  const emailVerified = Boolean(me.is_email_verified);

  // How many players reach verification, and how many of them arrive already
  // verified — the base rate the document flow will be measured against when it
  // exists.
  useEffect(() => {
    analytics.kyc.sectionViewed(emailVerified);
    // Once per visit to the section; the flag is read as it was on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.emailAccount')}>
        <SettingRow
          icon={<MailIcon size={15} />}
          title={me.email}
          detail={me.is_email_verified ? t('profile.emailVerified') : t('profile.emailUnverified')}
          action={
            me.is_email_verified ? (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                aria-label={t('profile.emailVerified')}
              >
                <CheckIcon size={13} />
              </span>
            ) : (
              <RowButton onClick={onChangeEmail}>{t('profile.change')}</RowButton>
            )
          }
        />
      </FieldGroup>

      <FieldGroup label={t('profile.verification')}>
        <SectionPlaceholder icon={<BadgeCheckIcon size={26} />} />
      </FieldGroup>
    </div>
  );
};

export default VerificationSection;
