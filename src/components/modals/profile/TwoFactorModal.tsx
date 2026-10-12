import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from './ProfileModalShell';
import { analytics } from '@/services/analytics';

interface Props {
  currentlyEnabled: boolean;
  onClose: () => void;
  onSaved: (enabled: boolean) => void;
}

const TwoFactorModal: FC<Props> = ({ currentlyEnabled, onClose, onSaved }) => {
  // Security-sensitive profile changes are risk-scored: redirecting recovery
  // to a new address is how an account takeover is made permanent.
  const { run } = useSeonGuard();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const target = !currentlyEnabled;

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await run((headers) =>
        apiService.patch('/users/me', { two_factor_enabled: target }, { headers })
      );
      if (res?.success) {
        analytics.auth.twoFactorToggled(target);
        toast.success(t(target ? 'acct.twofa.enabledToast' : 'acct.twofa.disabledToast'));
        onSaved(target);
        onClose();
      } else {
        toast.error(res?.message || t('acct.twofa.failed'));
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const e = err as { message?: string };
      toast.error(e?.message || t('acct.twofa.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t(target ? 'acct.twofa.enableTitle' : 'acct.twofa.disableTitle')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={t(target ? 'acct.twofa.enable' : 'acct.twofa.disable')}
    >
      <p className="text-base leading-6 text-[#9da2b4]">
        {t(target ? 'acct.twofa.enableBody' : 'acct.twofa.disableBody')}
      </p>
    </ProfileModalShell>
  );
};

export default TwoFactorModal;
