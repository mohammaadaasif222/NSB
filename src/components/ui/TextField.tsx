import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string;
  /** Accessible name. The design shows the name as the placeholder, so the
      label is visually hidden unless `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  /** Rendered inside the pill before the input, e.g. a dial-code picker. */
  leading?: ReactNode;
  /** Rendered inside the pill after the input, e.g. a show-password toggle. */
  trailing?: ReactNode;
  invalid?: boolean;
  /** Classes for the outer wrapper (positioning, grid placement). */
  wrapperClassName?: string;
}

/**
 * Pill-shaped text input. The pill is the wrapper, not the <input>, so
 * adornments of any width sit inside it without padding arithmetic.
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      showLabel = false,
      leading,
      trailing,
      invalid = false,
      wrapperClassName = '',
      className = '',
      placeholder,
      ...inputProps
    },
    ref
  ) => (
    <div className={wrapperClassName}>
      <label
        htmlFor={id}
        className={showLabel ? 'mb-1.5 block text-[13px] font-medium text-white/75' : 'sr-only'}
      >
        {label}
      </label>
      <div
        className={`rl-field flex h-12 items-center gap-2 px-4 text-[14px] max-sm:border-white/20 max-sm:bg-white/5 sm:px-5 sm:text-[15px] ${
          invalid ? '!border-[#ef4462]/70' : ''
        }`}
      >
        {leading}
        {/* Every field this renders is a credential or contact detail; masked
            explicitly so relaxing Clarity's defaults can never record one. */}
        <input
          ref={ref}
          id={id}
          data-clarity-mask="true"
          placeholder={placeholder ?? label}
          aria-invalid={invalid || undefined}
          className={`h-full min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-[#c8ccd8] sm:placeholder:text-white/70 ${className}`}
          {...inputProps}
        />
        {trailing}
      </div>
    </div>
  )
);

TextField.displayName = 'TextField';

export default TextField;
