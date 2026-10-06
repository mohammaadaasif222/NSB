import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CloseIcon } from '@/components/icons';

/** Same shape the rest of the app validates addresses with. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  onClose: () => void;
}

/**
 * Ask for a statistics breakdown by email.
 *
 * The form is real — the address is validated here, client-side — but there is
 * NO ENDPOINT behind it. Rather than accept a click and drop the request, a
 * valid submission says so. To wire it up: replace the `setNotice` branch in
 * `handleSubmit` with the POST, and give the shell the loading/error handling
 * `ChangeEmailModal` already demonstrates.
 *
 * Styled standalone rather than through `ProfileModalShell`: that shell serves
 * six working modals in the old slate palette and has a Cancel/Save footer,
 * which this design replaces with a close button and one full-width action.
 */
const RequestStatsModal: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // The old profile modals have no key handling; Escape is expected of a
  // dialog and costs one listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (): void => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL.test(trimmed)) {
      setNotice('');
      setError(t('stats.invalidEmail'));
      return;
    }
    setError('');
    setNotice(t('stats.requestUnavailable'));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="rl-menu relative w-full max-w-md rounded-3xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('stats.requestStatistics')}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('stats.close')}
          className="rl-glass rl-glass-hover absolute end-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-white/70"
        >
          <CloseIcon size={15} strokeWidth={2} />
        </button>

        <h2 className="pe-12 text-xl font-bold text-white sm:text-[22px]">
          {t('stats.requestStatistics')}
        </h2>
        <p className="mt-2 pe-8 text-[13px] leading-relaxed text-white/45">
          {t('stats.requestBody')}
        </p>

        <label className="mt-6 block text-xs text-white/50" htmlFor="stats-email">
          {t('stats.emailLabel')}
        </label>
        <input
          id="stats-email"
          data-clarity-mask="true"
          type="email"
          value={email}
          placeholder={t('stats.emailLabel')}
          onChange={(e) => setEmail(e.target.value)}
          className="rl-field mt-2 w-full rounded-full px-5 py-3.5 text-sm font-semibold placeholder:font-normal"
        />

        {error && <p className="mt-2 px-1 text-xs text-[#ef4462]">{error}</p>}
        {notice && <p className="mt-2 px-1 text-xs text-[#fcd535]">{notice}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          className="rl-btn-gold mt-5 w-full rounded-full py-3.5 text-sm font-bold"
        >
          {t('stats.submit')}
        </button>
      </div>
    </div>
  );
};

export default RequestStatsModal;
