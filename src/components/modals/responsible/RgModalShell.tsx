import { useEffect, type FC, type ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CloseIcon } from '@/components/icons';

/**
 * The dialog the Responsible Gambling section uses.
 *
 * Separate from `ProfileModalShell` on purpose: that one is built from the
 * slate palette, which the per-user theme remap rewrites. A confirmation that
 * closes an account for five years should look identical on every skin, so
 * this one is built from the `rl-*` glass the rest of the section uses.
 *
 * Escape and a backdrop click both cancel. The confirm button is never the
 * default focus — in this section every primary action is the irreversible
 * one, so it has to be reached deliberately.
 */
interface Props {
  title: string;
  /** Sits under the title, before the body. */
  lead?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  /** Styles the primary as destructive and pairs it with a red focus ring. */
  destructive?: boolean;
  submitDisabled?: boolean;
  loading?: boolean;
  /** Set when the dialog's content can run long — the body then scrolls. */
  scrollBody?: boolean;
  children: ReactNode;
}

const RgModalShell: FC<Props> = ({
  title,
  lead,
  onClose,
  onSubmit,
  submitLabel,
  destructive = false,
  submitDisabled = false,
  loading = false,
  scrollBody = false,
  children,
}) => {
  const { t } = useTranslation();

  // Escape closes, and the page behind does not scroll while this is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rg-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="rl-menu flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[28px] sm:max-h-[86vh] sm:rounded-[28px]"
      >
        <header className="flex items-start gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            <h2 id="rg-modal-title" className="rl-h-card text-[#f0f1f5]">
              {title}
            </h2>
            {lead && <p className="mt-1.5 text-sm leading-6 text-[#9da2b4]">{lead}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('rgc.close')}
            className="rl-glass rl-glass-hover -me-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9da2b4] hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </header>

        <div className={`px-5 py-5 sm:px-6 ${scrollBody ? 'min-h-0 flex-1 overflow-y-auto' : ''}`}>
          {children}
        </div>

        <footer className="flex flex-col-reverse gap-2.5 border-t border-white/8 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rl-btn-ghost h-11 rounded-full px-5 text-sm font-medium"
          >
            {t('rgc.cancel')}
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled || loading}
            className={
              destructive
                ? 'h-11 rounded-full border border-transparent px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                : 'rl-btn-gold h-11 rounded-full px-5 text-sm font-semibold disabled:cursor-not-allowed'
            }
            style={destructive ? { background: '#e33827' } : undefined}
          >
            {loading ? t('rgc.saving') : submitLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RgModalShell;
