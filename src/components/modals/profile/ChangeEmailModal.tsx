import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import ModalInput from '@/components/inputs/ModalInput';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  /** Null when the account has no email yet — the field opens empty. */
  currentEmail: string | null;
  onClose: () => void;
  onSaved: (email: string) => void;
}

const ChangeEmailModal: FC<Props> = ({ currentEmail, onClose, onSaved }) => {
  // Security-sensitive profile changes are risk-scored: redirecting recovery
  // to a new address is how an account takeover is made permanent.
  const { run } = useSeonGuard();
  const { t } = useTranslation();

  const [email, setEmail] = useState(currentEmail ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t('stats.invalidEmail'));
      return;
    }
    if (trimmed === currentEmail?.toLowerCase()) {
      setError(t('acct.email.same'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await run((headers) =>
        apiService.patch('/users/me', { email: trimmed }, { headers })
      );
      if (res?.success) {
        toast.success(t('acct.email.updated'));
        onSaved(trimmed);
        onClose();
      } else {
        setError(res?.message || t('acct.email.failed'));
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const e = err as { message?: string; errors?: Record<string, string> };
      setError(e?.errors?.email || e?.message || t('acct.email.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t('acct.email.title')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ModalInput
        label={t('acct.email.label')}
        type="email"
        value={email}
        onChange={setEmail}
        error={error}
        placeholder="you@example.com"
      />
    </ProfileModalShell>
  );
};

export default ChangeEmailModal;
