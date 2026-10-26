import type { FC } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { LINKED_PROVIDERS, type LinkableProvider } from '@/components/profile/providers';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import type { LinkProvider } from '@/types';

const isLinkable = (key: LinkableProvider['key']): key is LinkProvider =>
  key === 'google' || key === 'telegram';

const LinkedAccountsGroup: FC = () => {
  const { t } = useTranslation();
  const { accounts, loading, error, busy, refresh, toggle } = useLinkedAccounts();

  return (
    <FieldGroup label={t('profile.linkedAccounts')} cardClassName="max-lg:rounded-[34px]">
      {LINKED_PROVIDERS.map(({ key, label, mark }) => {
        if (!isLinkable(key)) {
          return (
            <SettingRow
              key={key}
              icon={mark}
              title={label}
              action={
                <ToggleSwitch
                  enabled={false}
                  label={label}
                  onToggle={() => toast.info(t('profile.link.comingSoon', { provider: label }))}
                />
              }
            />
          );
        }

        const account = accounts[key];

        return (
          <SettingRow
            key={key}
            icon={mark}
            title={label}
            detail={account?.display_name ?? undefined}
            action={
              <ToggleSwitch
                enabled={Boolean(account)}
                label={label}
                disabled={loading || Boolean(error) || busy !== null}
                onToggle={() => toggle(key)}
              />
            }
          />
        );
      })}

      {!loading && error && (
        <div className="px-[calc(var(--u)*18)] py-[calc(var(--u)*9)] text-center">
          <p className="text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#ef4462]">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rl-btn-gold mt-3 rounded-full px-4 py-2 text-xs font-semibold"
          >
            {t('profile.retry')}
          </button>
        </div>
      )}
    </FieldGroup>
  );
};

export default LinkedAccountsGroup;
