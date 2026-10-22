import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import ModalInput from '@/components/inputs/ModalInput';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  currentUsername: string;
  onClose: () => void;
  onSaved: (username: string) => void;
}

const ChangeUsernameModal: FC<Props> = ({ currentUsername, onClose, onSaved }) => {
  // Security-sensitive profile changes are risk-scored: redirecting recovery
  // to a new address is how an account takeover is made permanent.
  const { run } = useSeonGuard();
  const { t } = useTranslation();

  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError(t('acct.username.tooShort', { min: 3 }));
      return;
    }
    if (trimmed === currentUsername) {
      setError(t('acct.username.same'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await run((headers) =>
        apiService.patch('/users/me', { username: trimmed }, { headers })
      );
      if (res?.success) {
        toast.success(t('acct.username.updated'));
        onSaved(trimmed);
        onClose();
      } else {
        setError(res?.message || t('acct.username.failed'));
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const e = err as { message?: string; errors?: Record<string, string> };
      setError(e?.errors?.username || e?.message || t('acct.username.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t('acct.username.title')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ModalInput
        label={t('acct.username.label')}
        value={username}
        onChange={setUsername}
        error={error}
        placeholder={t('acct.username.placeholder')}
      />
      <p className="text-sm leading-6 text-[#9da2b4]">{t('acct.username.onceOnly')}</p>
    </ProfileModalShell>
  );
};

export default ChangeUsernameModal;
