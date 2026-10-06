import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { ApiUser } from '@/types/profile';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { TwoFactorIcon } from '@/components/profile/profileIcons';
import ProfileIdentity from '@/components/profile/ProfileIdentity';
import EmailAccountRow from '@/components/profile/EmailAccountRow';
import LinkedAccountsGroup from '@/components/profile/LinkedAccountsGroup';
import ToggleSwitch from '@/components/profile/ToggleSwitch';

interface Props {
  me: ApiUser;
  onToggle2FA: () => void;
}

/** Identity, the email behind the account, 2FA, and third-party links. */
const ProfileSection: FC<Props> = ({ me, onToggle2FA }) => {
  const { t, locale } = useTranslation();

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
        <p className="text-end text-base leading-6 text-[#9da2b4] sm:absolute sm:end-0 sm:top-0">
          {t('profile.joinedAt', { date: joined })}
        </p>
      )}

      <div className="sm:pt-2.5">
        <ProfileIdentity me={me} />
      </div>

      <div className="mt-14.5 space-y-7.5">
        <EmailAccountRow email={me.email} verified={me.is_email_verified} />

        <FieldGroup label={t('profile.twoFactorShort')}>
          <SettingRow
            icon={<TwoFactorIcon />}
            title={t('profile.enable2fa')}
            action={<ToggleSwitch enabled={me.two_factor_enabled} onToggle={onToggle2FA} />}
          />
        </FieldGroup>

        <LinkedAccountsGroup />
      </div>
    </div>
  );
};

export default ProfileSection;
