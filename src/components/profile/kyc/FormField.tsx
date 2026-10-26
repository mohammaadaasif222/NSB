import type { FC, ReactNode } from 'react';

/**
 * The KYC form's field furniture, in the account area's glass language.
 *
 * Class strings rather than wrapper components for the controls themselves:
 * `DobSelect` and the native `<select>` take a className, and the inputs carry
 * their own ids, validation and disabled state. Only the label / error frame
 * is worth a component.
 */

/**
 * Text inputs and selects. Sized to the account area's other controls, in
 * `--u` with them — see the note at the head of `SectionShell`.
 */
export const FIELD_INPUT =
  'rl-field h-12 w-full rounded-full py-0 ps-[26px] pe-5 text-[14px] leading-5 max-lg:!border-white/20 max-lg:!bg-white/5 disabled:cursor-not-allowed disabled:opacity-55 lg:h-auto lg:px-[calc(var(--u)*20)] lg:py-[calc(var(--u)*16)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5]';

/** Options inside a native select, which paints them on its own surface. */
export const FIELD_OPTION = 'bg-[#14161b] text-white';
export const FIELD_PLACEHOLDER = 'bg-[#14161b] text-white/40';

interface Props {
  label: string;
  htmlFor?: string;
  /** Shown at the end of the label line — "18+ Requirement", a lock note. */
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

/** A labelled control. */
const FormField: FC<Props> = ({ label, htmlFor, hint, required, children }) => (
  <div>
    <div className="mb-[calc(var(--u)*6)] flex items-baseline justify-between gap-[calc(var(--u)*8)] lg:px-[calc(var(--u)*4)]">
      <label
        htmlFor={htmlFor}
        className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]"
      >
        {label}
        {required && <span className="text-[#ef4462]"> *</span>}
      </label>
      {hint}
    </div>
    {children}
  </div>
);

export default FormField;
