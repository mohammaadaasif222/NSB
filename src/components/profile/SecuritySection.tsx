import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  SECTION_HEADING,
  FieldGroup,
  SettingRow,
  SoonToggle,
} from '@/components/profile/SectionShell';
import SessionsGroup from '@/components/profile/security/SessionsGroup';
import TransactionPinGroup from '@/components/profile/security/TransactionPinGroup';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
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
  const { two_factor: twoFactorOn } = usePlatformFeatures();

  return (
    <div>
      <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.security')}</h2>

      <div className="space-y-5 lg:mt-[calc(var(--u)*32)] lg:space-y-[calc(var(--u)*30)]">
        {/* The whole row is the control — the design gives it neither a button
            nor a chevron, so the hover is all that says it is one. */}
        <FieldGroup label={t('profile.password')}>
          <button
            type="button"
            onClick={onChangePassword}
            className="flex w-full items-center gap-[calc(var(--u)*12)] px-[calc(var(--u)*18)] py-[calc(var(--u)*9)] text-start transition-colors hover:bg-white/5"
          >
            {mailHostOf(email).mark}
            <span className="min-w-0 flex-1 truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
              {t('sec.changePassword')}
            </span>
          </button>
        </FieldGroup>

        <SessionsGroup />

        <TransactionPinGroup />

        {twoFactorOn && (
          <FieldGroup label={t('profile.twoFactorShort')}>
            <SettingRow
              icon={<TwoFactorIcon />}
              title={t('profile.enable2fa')}
              action={<ToggleSwitch enabled={twoFactorEnabled} onToggle={onToggle2FA} narrow />}
            />
          </FieldGroup>
        )}

        <FieldGroup label={t('sec.connectedWallet')} cardClassName="max-lg:rounded-[34px]">
          {WALLET_PROVIDERS.map(({ key, label, mark }) => (
            <SettingRow key={key} icon={mark} title={label} action={<SoonToggle narrow label={label} />} />
          ))}
        </FieldGroup>
      </div>
    </div>
  );
};

export default SecuritySection;
