import { useState, type FC, type ReactNode } from 'react';

interface Props {
  id: string;
  label: ReactNode;
  /** For a label that is not a plain <label> — e.g. the over / under switch. */
  ariaLabel?: string;
  value: number;
  decimals: number;
  suffix?: string;
  disabled?: boolean;
  /** Apply a typed value; the owner clamps it and the field shows the result. */
  onCommit: (value: number) => void;
}

/**
 * A number the player can type, applied on blur or Enter. Free-form while
 * focused, so "0." on the way to "0.5" is not snapped back mid-keystroke; the
 * rest of the time it shows the owner's value, whatever changed it.
 */
const DiceField: FC<Props> = ({
  id,
  label,
  ariaLabel,
  value,
  decimals,
  suffix,
  disabled = false,
  onCommit,
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (): void => {
    if (draft !== null) {
      const parsed = Number(draft);
      if (draft.trim() !== '' && Number.isFinite(parsed)) {
        onCommit(parsed);
      }
    }
    setDraft(null);
  };

  return (
    <div className="min-w-0">
      <div className="mb-1 flex h-5 items-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 focus-within:border-blue-500">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-label={ariaLabel}
          value={draft ?? value.toFixed(decimals)}
          disabled={disabled}
          onFocus={() => setDraft(value.toFixed(decimals))}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-semibold text-slate-100 tabular-nums outline-none disabled:cursor-not-allowed disabled:text-slate-500"
        />
        {suffix && <span className="pr-3 text-xs font-semibold text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
};

export default DiceField;
