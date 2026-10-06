import type { FC, ReactNode } from 'react';

/**
 * The KYC form's field furniture, in the account area's glass language.
 *
 * Class strings rather than wrapper components for the controls themselves:
 * `DobSelect` and the native `<select>` take a className, and the inputs carry
 * their own ids, validation and disabled state. Only the label / error frame
 * is worth a component.
 */

/** Text inputs and selects. Sized to the account area's other controls. */
export const FIELD_INPUT =
  'rl-field w-full rounded-full px-5 py-4 text-base leading-6 disabled:cursor-not-allowed disabled:opacity-55';

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
    <div className="mb-1.5 flex items-baseline justify-between gap-2 px-1">
      <label htmlFor={htmlFor} className="text-sm leading-5 text-[#9da2b4]">
        {label}
        {required && <span className="text-[#ef4462]"> *</span>}
      </label>
      {hint}
    </div>
    {children}
  </div>
);

export default FormField;
