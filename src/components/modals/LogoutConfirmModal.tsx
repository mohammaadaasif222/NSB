import { useEffect, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

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
 */
const LogoutConfirmModal: FC<Props> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="logout-modal-title" className="text-lg font-bold text-slate-100">
          {t('account.logoutTitle')}
        </h2>

        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{t('account.logoutMessage')}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-slate-300 hover:text-white transition-colors"
          >
            {t('account.logoutCancel')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            {t('account.logoutConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
