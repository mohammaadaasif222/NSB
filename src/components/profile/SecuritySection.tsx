import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ShieldIcon } from '@/components/icons';
import ProfileInfoRow, { RowButton } from './ProfileInfoRow';
import ToggleSwitch from './ToggleSwitch';

interface Props {
  twoFactorEnabled: boolean;
  onChangePassword: () => void;
  onToggle2FA: () => void;
}

const SecuritySection: FC<Props> = ({ twoFactorEnabled, onChangePassword, onToggle2FA }) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-4">
        <span className="text-blue-400">
          <ShieldIcon />
        </span>
        {t('profile.security')}
      </h3>

      <div className="space-y-2">
        <ProfileInfoRow
          label={t('profile.password')}
          value="••••••••••"
          action={<RowButton onClick={onChangePassword}>{t('profile.change')}</RowButton>}
        />

        <ProfileInfoRow
          label={t('profile.twoFactor')}
          value={twoFactorEnabled ? t('profile.enabled') : t('profile.disabled')}
          action={<ToggleSwitch enabled={twoFactorEnabled} onToggle={onToggle2FA} />}
        />
      </div>
    </section>
  );
};

export default SecuritySection;
