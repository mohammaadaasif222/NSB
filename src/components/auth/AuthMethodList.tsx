import type { FC, ReactNode } from 'react';
import Button from '@/components/ui/Button';

export interface AuthMethodOption {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  /** Small gold pill flush with the row's end edge, e.g. "Recommended". */
  badge?: string;
  disabled?: boolean;
}

interface AuthMethodListProps {
  methods: AuthMethodOption[];
  /** White tab resting on the first row, e.g. "1.2K Registered Today". */
  tab?: string;
}

/** One full-width method row: icon, label, and an optional badge. */
const MethodRow: FC<AuthMethodOption> = ({ icon, label, onClick, badge, disabled }) => (
  <Button variant="option" fullWidth onClick={onClick} disabled={disabled}>
    <span className="flex h-7 items-center text-white">{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="absolute end-0 top-1/2 -translate-y-1/2 rounded-s-full bg-[var(--rl-gold)] px-2 py-0.5 text-[9px] font-medium leading-4 text-[#111216]">
        {badge}
      </span>
    )}
  </Button>
);

/** The stack of sign-in / sign-up choices shared by the login and register modals. */
const AuthMethodList: FC<AuthMethodListProps> = ({ methods, tab }) => {
  const [first, ...rest] = methods;
  if (!first) return null;

  return (
    <div className="space-y-3">
      <div className="pt-4 sm:pt-6">
        {tab && (
          <div className="flex justify-center">
            <span className="rounded-t-lg bg-white px-3.5 py-2 text-[13px] font-medium leading-none text-[#111216]">
              {tab}
            </span>
          </div>
        )}
        <MethodRow {...first} />
      </div>
      {rest.map((m) => (
        <MethodRow key={m.id} {...m} />
      ))}
    </div>
  );
};

export default AuthMethodList;
