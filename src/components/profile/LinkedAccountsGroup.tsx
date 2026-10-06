import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow, SoonToggle } from '@/components/profile/SectionShell';
import { LINKED_PROVIDERS } from '@/components/profile/providers';

/**
 * Third-party accounts a player could attach.
 *
 * NOT WIRED. There is no linking endpoint — no OAuth handshake, nothing
 * storing a connection — so these are inert switches rather than toggles that
 * would appear to bind an account and forget it on the next load. The
 * catalogue itself lives in `providers.tsx`.
 */
const LinkedAccountsGroup: FC = () => {
  const { t } = useTranslation();

  return (
    <FieldGroup label={t('profile.linkedAccounts')}>
      {LINKED_PROVIDERS.map(({ key, label, mark }) => (
        <SettingRow key={key} icon={mark} title={label} action={<SoonToggle label={label} />} />
      ))}
    </FieldGroup>
  );
};

export default LinkedAccountsGroup;
