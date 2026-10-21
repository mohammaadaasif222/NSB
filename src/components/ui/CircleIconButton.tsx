import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

interface CircleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the button shows only an icon. */
  label: string;
  children: ReactNode;
}

/** Round icon-only control — the modal's back and close buttons. */
const CircleIconButton: FC<CircleIconButtonProps> = ({
  label,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`rl-circle-btn rl-glass-rim flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default CircleIconButton;
