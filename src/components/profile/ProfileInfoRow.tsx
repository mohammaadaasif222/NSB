import type { FC, ReactNode } from 'react';

interface Props {
  label: string;
  value?: ReactNode;
  /** Secondary line under the value. */
  hint?: string;
  action?: ReactNode;
}

const ProfileInfoRow: FC<Props> = ({ label, value, hint, action }) => (
  <div className="rl-glass rl-glass-hover flex items-center justify-between gap-3 rounded-xl px-4 py-3">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</p>
      {value !== undefined && <p className="mt-0.5 truncate text-sm text-white">{value}</p>}
      {hint && <p className="mt-0.5 text-[11px] text-white/40">{hint}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/** The small pill used for every "Change" action on the profile. */
export const RowButton: FC<{ onClick: () => void; children: ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rl-btn-ghost whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium"
  >
    {children}
  </button>
);

export default ProfileInfoRow;
