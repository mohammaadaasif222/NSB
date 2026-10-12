import { useState, type FC, type ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';

interface AuthFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  /** Small icon rendered inside the field's leading edge. */
  icon?: ReactNode;
  hint?: string;
  inputMode?: 'text' | 'email' | 'numeric' | 'tel';
  /** Mark field as optional */
  optional?: boolean;
  /**
   * The glass design carries the field name in the placeholder rather than a
   * standing label. The label is still rendered for screen readers unless a
   * caller has a reason to show it.
   */
  showLabel?: boolean;
}

const EyeIcon: FC<{ off: boolean }> = ({ off }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

const AuthField: FC<AuthFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  hint,
  inputMode,
  optional = false,
  showLabel = false,
}) => {
  const { t } = useTranslation();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && reveal ? 'text' : type;

  return (
    <div>
      <label
        htmlFor={id}
        className={showLabel ? 'block text-[13px] font-medium text-white/75 mb-1.5' : 'sr-only'}
      >
        {label}
        {optional && (
          <span className="text-white/50 text-[11px] ms-1">{t('misc.field.optional')}</span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {/*
          Clarity records what the screen shows, and every field this component
          renders is an address, a number or a password. Its default masking
          already covers inputs; this says so explicitly, so relaxing that
          setting in the Clarity dashboard can never start recording credentials
          by accident.
        */}
        <input
          id={id}
          data-clarity-mask="true"
          type={resolvedType}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder ?? label}
          onChange={(e) => onChange(e.target.value)}
          className={`glass-field h-13 w-full text-[14px] ${icon ? 'pl-11' : 'pl-4'} ${
            isPassword ? 'pr-12' : 'pr-4'
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? t('misc.field.hidePassword') : t('misc.field.showPassword')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <EyeIcon off={reveal} />
          </button>
        )}
      </div>

      {hint && <p className="text-[11px] text-white/40 mt-1.5 ps-1">{hint}</p>}
    </div>
  );
};

export default AuthField;

export const MailIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

export const LockIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const UserIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const PhoneIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
