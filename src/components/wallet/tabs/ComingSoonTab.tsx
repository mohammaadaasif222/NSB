import type { FC } from 'react';

/** Placeholder body used by the tabs that aren't wired yet. */
interface Props {
  title: string;
}

const ComingSoonTab: FC<Props> = ({ title }) => (
  <div className="py-12 flex flex-col items-center text-center gap-2">
    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-100">{title} — coming soon</p>
    <p className="text-xs text-slate-400 max-w-xs">
      We're wiring this tab up. For now, use Deposit and Withdraw for crypto.
    </p>
  </div>
);

export default ComingSoonTab;
