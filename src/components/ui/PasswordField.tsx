import { forwardRef, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import TextField, { type TextFieldProps } from '@/components/ui/TextField';

/** Open eye while the password is visible, closed lashes while hidden. */
const EyeGlyph: FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {open ? (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M3 10c2.2 2.6 5.3 4 9 4s6.8-1.4 9-4" />
        <path d="m5 12.5-1.5 2M9 14l-.6 2.3M15 14l.6 2.3M19 12.5l1.5 2" />
      </>
    )}
  </svg>
);

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;

/** A TextField with a show / hide toggle. */
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>((props, ref) => {
  const { t } = useTranslation();
  const [reveal, setReveal] = useState(false);

  return (
    <TextField
      ref={ref}
      type={reveal ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-label={reveal ? t('auth.hide') : t('auth.show')}
          aria-pressed={reveal}
          className="-me-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
        >
          <EyeGlyph open={reveal} />
        </button>
      }
      {...props}
    />
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
