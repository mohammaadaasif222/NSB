import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow, SoonToggle } from '@/components/profile/SectionShell';
import SessionsGroup from '@/components/profile/security/SessionsGroup';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { TwoFactorIcon } from '@/components/profile/profileIcons';
import { mailHostOf, WALLET_PROVIDERS } from '@/components/profile/providers';

interface Props {
  /** Drives the provider mark on the password row, as the design shows it. */
  email: string | null;
  twoFactorEnabled: boolean;
  onChangePassword: () => void;
  onToggle2FA: () => void;
}

/** Password, signed-in devices, 2FA and connected wallets. */
const SecuritySection: FC<Props> = ({ email, twoFactorEnabled, onChangePassword, onToggle2FA }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="rl-h-section">{t('profile.security')}</h2>

      <div className="mt-8 space-y-7.5">
        {/* The whole row is the control — the design gives it neither a button
            nor a chevron, so the hover is all that says it is one. */}
        <FieldGroup label={t('profile.password')}>
          <button
            type="button"
            onClick={onChangePassword}
            className="flex w-full items-center gap-3 px-4.5 py-2.25 text-start transition-colors hover:bg-white/5"
          >
            {mailHostOf(email).mark}
            <span className="min-w-0 flex-1 truncate text-base leading-6 font-medium text-[#f0f1f5]">
              {t('sec.changePassword')}
            </span>
          </button>
        </FieldGroup>

        <SessionsGroup />

        <FieldGroup label={t('profile.twoFactorShort')}>
          <SettingRow
            icon={<TwoFactorIcon />}
            title={t('profile.enable2fa')}
            action={<ToggleSwitch enabled={twoFactorEnabled} onToggle={onToggle2FA} />}
          />
        </FieldGroup>

        <FieldGroup label={t('sec.connectedWallet')}>
          {WALLET_PROVIDERS.map(({ key, label, mark }) => (
            <SettingRow key={key} icon={mark} title={label} action={<SoonToggle label={label} />} />
          ))}
        </FieldGroup>
      </div>
    </div>
  );
};

export default SecuritySection;
