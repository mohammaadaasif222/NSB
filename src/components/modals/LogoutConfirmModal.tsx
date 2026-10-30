import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from '@/components/modals/profile/ProfileModalShell';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation step in front of logout.
 *
 * Logout is one click away in the account menu and clears the session outright,
 * so it asks first. Escape and a backdrop click both cancel — the destructive
 * action is only ever reached deliberately.
 *
 * Built on `ProfileModalShell` rather than carrying its own slate card, so it
 * is the same glass object as every other dialog. `destructive` reds the
 * primary; the shell supplies the cancel beneath it.
 */
const LogoutConfirmModal: FC<Props> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <ProfileModalShell
      title={t('account.logoutTitle')}
      onClose={onCancel}
      onSubmit={onConfirm}
      loading={false}
      submitLabel={t('account.logoutConfirm')}
      look="auth"
    >
      <p className="text-base leading-6 text-[#9da2b4]">{t('account.logoutMessage')}</p>
    </ProfileModalShell>
  );
};

export default LogoutConfirmModal;
