import type { FC } from 'react';
import LanguagePicker from '@/components/LanguagePicker';
import Button from '@/components/ui/Button';

interface AuthModalFooterProps {
  /** The opposite journey: "Register" on login, "Login" on register. */
  actionLabel: string;
  onAction: () => void;
  /** Spacing overrides (the gap above it differs per journey on a phone). */
  className?: string;
}

/** Bottom rail of the auth modals' first screen: language on the start edge,
    the switch to the other journey on the end edge. */
const AuthModalFooter: FC<AuthModalFooterProps> = ({ actionLabel, onAction, className = '' }) => (
  <div className={`relative z-20 mt-6 flex items-center justify-between gap-3 ${className}`}>
    <LanguagePicker glass dropUp />
    <Button size="sm" onClick={onAction}>
      {actionLabel}
    </Button>
  </div>
);

export default AuthModalFooter;
