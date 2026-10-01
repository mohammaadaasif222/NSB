import { useEffect, useRef, useState, type FC } from 'react';
import type { CurrencyNetwork } from '@/types';

interface Props {
  label: string;
  networks: CurrencyNetwork[];
  value: string;
  onChange: (code: string) => void;
}

const NetworkPicker: FC<Props> = ({ label, networks, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = networks.find((n) => n.code === value);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 flex items-center justify-between text-left hover:border-slate-600 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm text-slate-100 font-semibold">
          {selected ? (
            <>
              <span>{selected.name}</span>
              {selected.code !== selected.name && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-white/5 border border-slate-700 rounded px-1.5 py-0.5">
                  {selected.code}
                </span>
              )}
            </>
          ) : (
            'Select network'
          )}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 max-h-64 overflow-y-auto rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1"
        >
          {networks.map((n) => (
            <button
              key={n.code}
              type="button"
              role="option"
              aria-selected={n.code === value}
              onClick={() => {
                onChange(n.code);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                n.code === value ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold">{n.name}</span>
                {/* Show the technical code (ERC20 / TRC20 / SOL / BEP20) as a
                    small badge so a player who cares about the protocol
                    can still see it. Skipped when the code equals the
                    display name (native chains: "Bitcoin" doesn't need a
                    "BTC" tag). */}
                {n.code !== n.name && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-white/5 border border-slate-700 rounded px-1.5 py-0.5">
                    {n.code}
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {n.deposit_confirmations} confirmation{n.deposit_confirmations === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkPicker;
