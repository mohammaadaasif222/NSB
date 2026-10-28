import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { ApiUser } from '@/types/profile';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { TwoFactorIcon } from '@/components/profile/profileIcons';
import ProfileIdentity from '@/components/profile/ProfileIdentity';
import EmailAccountRow from '@/components/profile/EmailAccountRow';
import LinkedAccountsGroup from '@/components/profile/LinkedAccountsGroup';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { ContactPhoneIcon } from '@/components/icons';

interface Props {
  me: ApiUser;
  onToggle2FA: () => void;
  onChangeAvatar: () => void;
  /** Opens "Add & Verify Email" for an account with no email. */
  onAddEmail?: () => void;
  /** Opens "Verify Your Email" for an account whose email is unverified. */
  onVerifyEmail?: () => void;
}

/** Identity, the email behind the account, 2FA, and third-party links. */
const ProfileSection: FC<Props> = ({ me, onToggle2FA, onChangeAvatar, onAddEmail, onVerifyEmail }) => {
  const { t, locale } = useTranslation();
  const { two_factor: twoFactorOn, email_verification: emailVerificationOn } = usePlatformFeatures();

  const joined = me.created_at
    ? new Date(me.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="relative">
      {/* Pinned to the panel's top corner from `sm` up, as the design has it —
          the avatar then starts level with it rather than below it. On a phone
          there is no corner to spare, so it stays in flow. */}
      {joined && (
        <p className="text-end text-[12px] leading-5 text-[#9da2b4] sm:absolute sm:end-0 sm:top-0 lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5]">
          {t('profile.joinedAt', { date: joined })}
        </p>
      )}

      {/* The avatar starts 10 below the "Joined at" line in the design. */}
      <div className="mt-5 sm:mt-0 sm:pt-[calc(var(--u)*10)]">
        <ProfileIdentity me={me} onChangeAvatar={onChangeAvatar} />
      </div>

      {/* 32 from the ID line to the first group label, 30 between groups. */}
      <div className="mt-[26px] space-y-[18px] lg:mt-[calc(var(--u)*32)] lg:space-y-[calc(var(--u)*30)]">
        {me.mobile && (
          <FieldGroup label={t('verify.phoneNumber')}>
            <SettingRow
              icon={<ContactPhoneIcon size={20} strokeWidth={1.5} />}
              title={t('verify.phoneNumber')}
              detail={`${me.country_code ? `+${me.country_code.replace(/\D/g, '')} ` : ''}${me.mobile}`}
              layout="inline"
            />
          </FieldGroup>
        )}

        <EmailAccountRow
          email={me.email}
          verified={me.is_email_verified}
          onAddEmail={!me.email && emailVerificationOn ? onAddEmail : undefined}
          onVerifyEmail={me.email && !me.is_email_verified && emailVerificationOn ? onVerifyEmail : undefined}
        />

        {twoFactorOn && (
          <FieldGroup label={t('profile.twoFactorShort')}>
            <SettingRow
              icon={<TwoFactorIcon />}
              title={t('profile.enable2fa')}
              action={<ToggleSwitch enabled={me.two_factor_enabled} onToggle={onToggle2FA} />}
            />
          </FieldGroup>
        )}

        <LinkedAccountsGroup />
      </div>
    </div>
  );
};

export default ProfileSection;
