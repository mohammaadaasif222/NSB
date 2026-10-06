import type { FC } from 'react';
import LanguagePicker from '@/components/LanguagePicker';
import Button from '@/components/ui/Button';

interface AuthModalFooterProps {
  /** The opposite journey: "Register" on login, "Login" on register. */
  actionLabel: string;
  onAction: () => void;
}

/** Bottom rail of the auth modals' first screen: language on the start edge,
    the switch to the other journey on the end edge. */
const AuthModalFooter: FC<AuthModalFooterProps> = ({ actionLabel, onAction }) => (
  <div className="relative z-20 mt-6 flex items-center justify-between gap-3">
    <LanguagePicker glass dropUp />
    <Button size="md" onClick={onAction}>
      {actionLabel}
    </Button>
  </div>
);

export default AuthModalFooter;
