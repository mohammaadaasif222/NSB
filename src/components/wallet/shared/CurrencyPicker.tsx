import { useEffect, useRef, useState, type FC } from 'react';
import type { Currency } from '@/types';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  label: string;
  currencies: Currency[];
  value: string;
  onChange: (code: string) => void;
}

const CurrencyPicker: FC<Props> = ({ label, currencies, value, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = currencies.find((c) => c.code === value);

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
          {selected ? selected.code : t('acct.wallet.selectCurrency')}
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
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              role="option"
              aria-selected={c.code === value}
              onClick={() => {
                onChange(c.code);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left flex items-center justify-between text-sm transition-colors ${
                c.code === value ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="font-semibold">{c.code}</span>
              <span className="text-xs text-slate-400">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyPicker;
