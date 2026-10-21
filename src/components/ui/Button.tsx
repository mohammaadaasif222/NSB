import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import ButtonLoader from '@/components/ButtonLoader';

type Variant = 'gold' | 'option';
type Size = 'sm' | 'md' | 'lg' | 'row';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `gold` = primary action (Continue, Login); `option` = a glass choice row. */
  variant?: Variant;
  /** `sm` = 40px pill, `md` = 48px pill, `lg` = 56px pill, `row` = an auth method row. */
  size?: Size;
  fullWidth?: boolean;
  /** Swaps the label for a spinner and blocks clicks. */
  loading?: boolean;
  children: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  gold: 'rl-btn-gold font-medium',
  option: 'rl-option font-normal',
};

const SIZE: Record<Size, string> = {
  sm: 'h-10 px-6 text-base',
  md: 'h-11 px-6 text-[15px] sm:h-12 sm:px-9 sm:text-base',
  lg: 'h-14 px-6 text-lg',
  row: 'h-14 px-6 text-base',
};

const Button: FC<ButtonProps> = ({
  variant = 'gold',
  size = 'lg',
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`relative inline-flex items-center justify-center gap-2.5 rounded-full ${VARIANT[variant]} ${SIZE[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...rest}
  >
    {loading ? <ButtonLoader /> : children}
  </button>
);

export default Button;
