import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { DEFAULT_TIMEZONE, THEME_OPTIONS, type ApiUser } from '@/types/profile';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { RowButton } from '@/components/profile/ProfileInfoRow';
import LanguagePicker from '@/components/LanguagePicker';
import { ClockIcon, SunIcon, GlobeIcon } from '@/components/icons';

interface Props {
  me: ApiUser;
  onChangeUsername: () => void;
  onChangeTimezone: () => void;
  onChangeTheme: () => void;
}

/**
 * The settings that are genuinely wired: display name, theme, time zone and
 * language. Theme and time zone persist through PATCH /users/me; the language
 * is a client-side choice the i18n provider stores locally.
 */
const PreferencesSection: FC<Props> = ({
  me,
  onChangeUsername,
  onChangeTimezone,
  onChangeTheme,
}) => {
  const { t } = useTranslation();
  const themeLabel = THEME_OPTIONS.find((o) => o.value === me.theme)?.label ?? 'Dark';

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.personal')}>
        <SettingRow
          title={t('profile.username')}
          detail={me.username || t('profile.notSet')}
          action={<RowButton onClick={onChangeUsername}>{t('profile.change')}</RowButton>}
        />
      </FieldGroup>

      <FieldGroup label={t('profile.preferences')}>
        <SettingRow
          icon={<SunIcon size={15} />}
          title={t('profile.theme')}
          detail={themeLabel}
          action={<RowButton onClick={onChangeTheme}>{t('profile.change')}</RowButton>}
        />
        <SettingRow
          icon={<ClockIcon size={15} />}
          title={t('profile.timezone')}
          detail={me.timezone || DEFAULT_TIMEZONE}
          action={<RowButton onClick={onChangeTimezone}>{t('profile.change')}</RowButton>}
        />
        <SettingRow
          icon={<GlobeIcon size={15} />}
          title={t('profile.language')}
          detail={t('common.language')}
          action={<LanguagePicker />}
        />
      </FieldGroup>
    </div>
  );
};

export default PreferencesSection;
