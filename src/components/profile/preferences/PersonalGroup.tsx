import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { RowButton } from '@/components/profile/SectionShell';
import { PrefCard, PrefRowShell } from '@/components/profile/preferences/PrefGroupView';
import { DEFAULT_TIMEZONE, timezoneLabelKey, type ApiUser } from '@/types/profile';

interface Props {
  me: ApiUser;
  onChangeUsername: () => void;
  onChangeTimezone: () => void;
}

/**
 * Display name and time zone.
 *
 * Not in the design, kept because both are wired — they write through
 * PATCH /users/me — and the account area offers no other way to reach them.
 * Dropping the rows would strand two working settings.
 */
const PersonalGroup: FC<Props> = ({ me, onChangeUsername, onChangeTimezone }) => {
  const { t } = useTranslation();
  const timezone = me.timezone || DEFAULT_TIMEZONE;
  const timezoneKey = timezoneLabelKey(timezone);

  const rows: { key: string; label: string; value: string; onChange: (() => void) | null }[] = [
    {
      key: 'username',
      label: t('profile.username'),
      value: me.username || t('profile.notSet'),
      onChange: me.username_changed_at ? null : onChangeUsername,
    },
    {
      key: 'timezone',
      label: t('profile.timezone'),
      value: timezoneKey ? t(timezoneKey) : timezone,
      onChange: onChangeTimezone,
    },
  ];

  return (
    <section className="space-y-1 lg:space-y-[calc(var(--u)*6)]">
      <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
        {t('profile.personal')}
      </h3>

      <PrefCard rows={rows.length}>
        {rows.map((row) => (
          <PrefRowShell key={row.key} label={row.label}>
            <span className="flex items-center gap-[calc(var(--u)*10)]">
              <span className="max-w-[calc(var(--u)*144)] truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]">
                {row.value}
              </span>
              {row.onChange && <RowButton onClick={row.onChange}>{t('profile.change')}</RowButton>}
            </span>
          </PrefRowShell>
        ))}
      </PrefCard>
    </section>
  );
};

export default PersonalGroup;
