import type { FC, ReactNode } from 'react';

interface Props {
  label: string;
  value?: ReactNode;
  /** Secondary line under the value. */
  hint?: string;
  action?: ReactNode;
}

const ProfileInfoRow: FC<Props> = ({ label, value, hint, action }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/60 border border-slate-800 px-4 py-3 hover:border-slate-600 transition-colors">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {value !== undefined && <p className="mt-0.5 text-sm text-slate-100 truncate">{value}</p>}
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
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
    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
  >
    {children}
  </button>
);

export default ProfileInfoRow;
