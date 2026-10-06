import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
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
        toast.success(
          target ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled'
        );
        onSaved(target);
        onClose();
      } else {
        toast.error(res?.message || 'Failed to update 2FA');
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to update 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={target ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={target ? 'Enable' : 'Disable'}
    >
      <p className="text-base leading-6 text-[#9da2b4]">
        {target
          ? 'Two-Factor Authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.'
          : 'Disabling Two-Factor Authentication will make your account less secure. Are you sure you want to continue?'}
      </p>
    </ProfileModalShell>
  );
};

export default TwoFactorModal;
