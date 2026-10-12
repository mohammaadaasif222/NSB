import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { POPUP_SURFACE } from '@/components/player/popupSurface';
import { WALLET_PILL, WALLET_VALUE } from './WalletField';

export interface WalletOption<V extends string> {
  value: V;
  label: string;
  /** Quieter text at the row's end in the list (a full name). */
  detail?: string;
}

interface Props<V extends string> {
  id?: string;
  options: readonly WalletOption<V>[];
  value: V | '';
  onChange: (value: V) => void;
  /** Shown when nothing is picked yet. */
  placeholder: string;
  /** Grey text before the chevron — the design's "USD" / "$0.00". */
  trailing?: ReactNode;
}

/**
 * The wallet modal's dropdown: the selected value in the design's pill, a
 * grey trailing note and the chevron on the end; the list opens under it on
 * the header popups' surface.
 */
const WalletSelect = <V extends string>({
  id,
  options,
  value,
  onChange,
  placeholder,
  trailing,
}: Props<V>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${WALLET_PILL} w-full text-start transition-colors hover:border-white/30`}
      >
        <span className={`min-w-0 flex-1 truncate ${WALLET_VALUE}`}>
          {selected?.label ?? placeholder}
        </span>
        {trailing && (
          <span className="shrink-0 text-[16px] font-bold leading-6 text-[#9da2b4] sm:text-[18px]">
            {trailing}
          </span>
        )}
        {/* The design's 11px chevron. */}
        <ChevronDownIcon
          size={22}
          strokeWidth={1.6}
          className={`shrink-0 text-[#f0f1f5] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-[24px] p-1.5 ${POPUP_SURFACE.raised}`}
        >
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between gap-3 rounded-[18px] px-4 text-start text-[15px] transition-colors ${
                  on ? 'bg-white/10 text-[#f0f1f5]' : 'text-[#f0f1f5] hover:bg-white/5'
                }`}
              >
                <span className="font-semibold">{o.label}</span>
                {o.detail && (
                  <span className="truncate text-[13px] text-[#9da2b4]">{o.detail}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WalletSelect;
