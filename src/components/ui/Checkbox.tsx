import type { FC, ReactNode } from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}

/** Square checkbox with the gold tick. The native input stays in the DOM for
    keyboard and screen-reader support; the box is drawn beside it. */
const Checkbox: FC<CheckboxProps> = ({ id, checked, onChange, children, className = '' }) => (
  <label htmlFor={id} className={`group flex cursor-pointer items-center gap-3 ${className}`}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/40 ${
        checked
          ? 'border-[var(--rl-gold)] bg-white/[0.06] text-[var(--rl-gold)]'
          : 'border-white/25 bg-white/[0.06] group-hover:border-white/45'
      }`}
    >
      {checked && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
    <span className="text-[13px] text-white/85">{children}</span>
  </label>
);

export default Checkbox;
