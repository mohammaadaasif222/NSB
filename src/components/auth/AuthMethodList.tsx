import type { CSSProperties, FC, ReactNode } from 'react';
import Button from '@/components/ui/Button';

export interface AuthMethodOption {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  /** Small gold pill flush with the row's end edge, e.g. "Recommended". */
  badge?: string;
  disabled?: boolean;
  /** Where the phone design puts this method, when it differs (CSS order). */
  phoneOrder?: number;
}

interface AuthMethodListProps {
  methods: AuthMethodOption[];
  /** White tab resting on the first row, e.g. "1.2K Registered Today". */
  tab?: string;
  /** The tab's text on a phone, where its design words it differently. */
  phoneTab?: string;
}

/** One full-width method row: icon, label, and an optional badge. */
const MethodRow: FC<AuthMethodOption> = ({ icon, label, onClick, badge, disabled }) => (
  <Button
    variant="option"
    size="row"
    fullWidth
    onClick={onClick}
    disabled={disabled}
    className="font-medium"
  >
    <span className="flex h-7 items-center text-white">{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="absolute end-0 top-1/2 -translate-y-1/2 rounded-s-full bg-[var(--rl-gold)] px-2 py-0.5 text-[9px] font-medium leading-4 text-[#111216]">
        {badge}
      </span>
    )}
  </Button>
);

/**
 * The stack of sign-in / sign-up choices shared by the login and register
 * modals. On a phone the tab sits 45 under the header rail, 42 tall with a
 * slate hairline, as that design draws it, and a method can take its own
 * place in the phone's order (`phoneOrder`).
 */
const AuthMethodList: FC<AuthMethodListProps> = ({ methods, tab, phoneTab }) => {
  const [first, ...rest] = methods;
  if (!first) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="pt-[19px] sm:pt-6">
        {tab && (
          <div className="flex justify-center">
            <span className="rounded-t-lg border border-b-0 border-[#9da2b4] bg-white px-3.5 py-[13px] text-[14px] font-medium leading-none text-[#111216] sm:border-0 sm:py-3">
              {phoneTab ? (
                <>
                  <span className="sm:hidden">{phoneTab}</span>
                  <span className="hidden sm:inline">{tab}</span>
                </>
              ) : (
                tab
              )}
            </span>
          </div>
        )}
        <MethodRow {...first} />
      </div>
      {rest.map((m) => (
        <div
          key={m.id}
          className={m.phoneOrder ? 'max-sm:[order:var(--o)]' : undefined}
          style={m.phoneOrder ? ({ '--o': m.phoneOrder } as CSSProperties) : undefined}
        >
          <MethodRow {...m} />
        </div>
      ))}
    </div>
  );
};

export default AuthMethodList;
