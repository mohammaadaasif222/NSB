import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import LanguagePicker from '@/components/LanguagePicker';
import { useTranslation } from '@/context/I18nContext';

/**
 * Auth layout: a single frosted "modal" floating over a dark, softly lit
 * stage. The card is centred at every breakpoint and never touches the
 * viewport edge — on short screens the page scrolls rather than the card
 * shrinking, so the form stays comfortable on a phone in landscape.
 *
 * Purely presentational. It owns no auth state; the pages that use it keep
 * their own fields, validation and submit handlers.
 */

interface AuthShellProps {
  /** Muted line under the wordmark, e.g. "Login with". */
  subtitle?: string;
  /** Secondary line, smaller still — the marketing blurb. */
  caption?: string;
  /** Renders the top-left "Back" affordance as a link to another page. */
  backHref?: string;
  /** Same affordance, but for stepping back within the page (chooser ⇄ form). */
  onBack?: () => void;
  backLabel?: string;
  /** Where the ✕ sends the visitor. Defaults to the lobby. */
  closeHref?: string;
  /** Bottom-right pill — the opposite journey (Login ⇄ Register). */
  action?: { href: string; label: string };
  /** Small print under the form. */
  legal?: ReactNode;
  /** Register needs more room than login. */
  width?: 'md' | 'lg';
  children: ReactNode;
}

const CloseIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const BackIcon: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/** Shared by both back affordances so the link and the button look identical. */
const BACK_CLASS =
  'flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors';

const AuthShell: FC<AuthShellProps> = ({
  subtitle,
  caption,
  backHref,
  onBack,
  backLabel,
  closeHref = '/',
  action,
  legal,
  width = 'md',
  children,
}) => {
  const { t } = useTranslation();
  const back = backLabel ?? t('auth.back');

  return (
    <div className="auth-stage min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Colour behind the glass — without these the frosting has nothing to
        refract and the card reads as flat grey. */}
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div
        className={`glass-card auth-card-in w-full ${
          width === 'lg' ? 'max-w-[520px]' : 'max-w-[440px]'
        } px-5 py-6 sm:px-8 sm:py-8`}
      >
        {/* Top rail: back on the left, close on the right. Both are optional,
          and the rail keeps its height either way so the wordmark never
          shifts between screens. */}
        <div className="relative z-10 flex items-start justify-between min-h-9">
          {backHref && (
            <Link href={backHref} className={BACK_CLASS}>
              <BackIcon />
              {back}
            </Link>
          )}
          {!backHref && onBack && (
            <button type="button" onClick={onBack} className={BACK_CLASS}>
              <BackIcon />
              {back}
            </button>
          )}
          {!backHref && !onBack && <span />}

          <Link
            href={closeHref}
            aria-label={t('common.close')}
            className="glass-icon-btn flex h-9 w-9 items-center justify-center"
          >
            <CloseIcon />
          </Link>
        </div>

        {/* Identity block */}
        <div className="relative z-10 text-center -mt-1">
          <span className="auth-wordmark block text-4xl sm:text-[42px] font-extrabold select-none">
            ROLLUCK
          </span>
          {subtitle && <p className="mt-2 text-sm text-white/65">{subtitle}</p>}
          {caption && (
            <p className="mt-2 text-[12px] leading-relaxed text-white/45 max-w-[340px] mx-auto">
              {caption}
            </p>
          )}
        </div>

        <div className="relative z-10 mt-6">{children}</div>

        {legal && (
          <p className="relative z-10 mt-6 text-center text-[11.5px] leading-relaxed text-white/45">
            {legal}
          </p>
        )}

        {/* Bottom rail: language on the left, the opposite journey on the right.
          The picker opens upward here — it sits at the card's floor. */}
        <div className="relative z-20 mt-7 flex items-center justify-between gap-3">
          <LanguagePicker glass dropUp />
          {action && (
            <Link
              href={action.href}
              className="glass-pill px-6 py-2 text-sm font-medium whitespace-nowrap"
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
