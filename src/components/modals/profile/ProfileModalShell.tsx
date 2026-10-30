import { useId, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/context/I18nContext';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CloseIcon } from '@/components/icons';

/**
 * The account dialogs' shell.
 *
 * REBUILT FROM THE DESIGN'S GLASS. What was here was a slate-900 card with a
 * blue Save button — the palette this app shipped before the Figma file, and
 * nothing like the dialogs the design draws. Those are measured in
 * `SetLimitModal` and `SelfExclusionConfirmModal`; this carries the same
 * numbers, so an account dialog and a Responsible Gambling one are the same
 * object: 581 wide, 34 of radius, blurred glass over a 60% black backdrop, a
 * centred title with the close chip beside it, and the actions stacked at the
 * bottom — gold primary, then a white-10% cancel under it.
 *
 * There is a second reason beyond looks. The slate palette is rewritten by the
 * per-user theme remap, so these dialogs changed colour per skin while the
 * design's own ones did not. Built from `rl-*` they now match on every theme.
 *
 * `useModalA11y` brings what this shell never had: Tab stays inside, Escape
 * closes, focus goes back where it came from, and the page behind does not
 * scroll underneath.
 *
 * Portalled to <body>. The shell is opened from inside the top bar (logout,
 * from the profile menu), and the bar's `backdrop-filter` makes it the
 * containing block for `position: fixed` descendants — rendered in place, the
 * overlay covered the bar alone and the dialog hung off the top of the screen.
 */
interface ProfileModalShellProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
  /** Reds the primary — for the dialogs that take something away. */
  destructive?: boolean;
  look?: 'glass' | 'auth';
  children: ReactNode;
}

/* Both actions, same shape: the design gives them equal weight and stacks
   them rather than putting a quiet link beside a loud button. */
const BUTTON =
  'flex h-14 w-full shrink-0 items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium transition-colors';

const ProfileModalShell: FC<ProfileModalShellProps> = ({
  title,
  onClose,
  onSubmit,
  loading,
  submitLabel,
  submitDisabled = false,
  destructive = false,
  look = 'glass',
  children,
}) => {
  const auth = look === 'auth';
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useModalA11y(onClose);

  // Only ever opened by a click, so this is a client render; the guard keeps
  // a server render from reaching for `document`.
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4 ${auth ? '' : 'bg-black/60'}`}
      onClick={onClose}
      role="presentation"
    >
      {auth && <div aria-hidden className="rl-modal-overlay pointer-events-none fixed inset-0" />}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`${auth ? 'rl-modal-card rl-modal-rim' : 'rl-modal-glass'} flex max-h-[96vh] w-full max-w-[480px] flex-col p-5 outline-none sm:max-h-[92vh] sm:p-7`}
      >
        <div className="flex shrink-0 items-start">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-center text-[20px] leading-7 font-semibold tracking-[-0.56px] text-[#f0f1f5] sm:text-[28px] sm:leading-9"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rl-chip -mt-2 flex h-12 w-12 shrink-0 items-center justify-center text-[#f0f1f5]"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* `min-h-0` is what lets this shrink and scroll instead of growing and
            pushing the buttons off a short screen. */}
        <div className="thin-scrollbar mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
          {children}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || submitDisabled}
          className={
            destructive
              ? `${BUTTON} mt-6 bg-[#e33827] text-white hover:bg-[#f04433] disabled:cursor-not-allowed disabled:opacity-50`
              : `${BUTTON} rl-btn-gold mt-6 disabled:cursor-not-allowed disabled:opacity-50`
          }
        >
          {loading ? t('common.saving') : (submitLabel ?? t('acct.save'))}
        </button>

        <button
          type="button"
          onClick={onClose}
          className={`${BUTTON} mt-2.5 ${auth ? 'rl-option' : 'bg-white/10 text-[#f0f1f5] hover:bg-white/15'}`}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModalShell;
