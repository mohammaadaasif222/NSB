import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import ModalInput from '@/components/inputs/ModalInput';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from './ProfileModalShell';
import { analytics } from '@/services/analytics';
import type { ApiUser } from '@/types/profile';

interface Props {
  /** The signed-in user — used to detect social-login accounts that have no
   * existing password and therefore should not be asked for a current one. */
  user: ApiUser;
  onClose: () => void;
}

const ChangePasswordModal: FC<Props> = ({ user, onClose }) => {
  // Changing a password is a security-sensitive change and is risk-scored:
  // it is how a hijacked session is turned into a permanent takeover.
  const { run } = useSeonGuard();
  const { t } = useTranslation();
  /** True when the account was created via a social provider (Google, Telegram,
   * …) and has no password the user knows. Those users only create a new one. */
  const isSocial = Boolean(user.provider);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const e: Record<string, string> = {};
    if (!isSocial && !current) e.current = t('acct.pw.currentRequired');
    if (next.length < 6) e.next = t('acct.pw.tooShort', { min: 6 });
    if (!isSocial && next && next === current) e.next = t('acct.pw.sameAsCurrent');
    if (confirm !== next) e.confirm = t('acct.pw.mismatch');
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const res = await run((headers) =>
        apiService.post(
          '/users/me/change-password',
          {
            ...(!isSocial && { current_password: current }),
            new_password: next,
          },
          { headers }
        )
      );
      if (res?.success) {
        analytics.auth.passwordChanged();
        toast.success(t('acct.pw.changed'));
        onClose();
      } else {
        setErrors({ current: res?.message || t('acct.pw.failed') });
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const ex = err as { message?: string; errors?: Record<string, string> };
      setErrors({
        current: ex?.errors?.current_password || ex?.message || t('acct.pw.failed'),
        next: ex?.errors?.new_password || '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t('sec.changePassword')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={t('acct.pw.update')}
    >
      {!isSocial && (
        <ModalInput
          label={t('acct.pw.current')}
          type="password"
          value={current}
          onChange={setCurrent}
          error={errors.current}
          showToggle
        />
      )}
      <ModalInput
        label={t('acct.pw.new')}
        type="password"
        value={next}
        onChange={setNext}
        error={errors.next}
        showToggle
      />
      <ModalInput
        label={t('acct.pw.confirm')}
        type="password"
        value={confirm}
        onChange={setConfirm}
        error={errors.confirm}
        showToggle
      />
    </ProfileModalShell>
  );
};

export default ChangePasswordModal;
