import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

export interface DisclosureOption<V extends string> {
  value: V;
  label: string;
}

interface Props<V extends string> {
  id: string;
  options: readonly DisclosureOption<V>[];
  value: V | '';
  onChange: (value: V) => void;
  /** Shown until something is picked. */
  placeholder: string;
}

/**
 * A select that opens in place rather than over the page — the suggestion
 * box's category, as the design draws it: a 56px glass pill with the choice
 * and a chevron, which grows downward into a panel listing the options under
 * a hairline, pushing what follows it down.
 */
const DisclosureSelect = <V extends string>({
  id,
  options,
  value,
  onChange,
  placeholder,
}: Props<V>) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const listId = `${id}-options`;

  return (
    <div className="rounded-[34px] border border-white/25 bg-white/[0.08] backdrop-blur-md">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex h-[54px] w-full items-center justify-between gap-3 px-5 text-start text-[16px] leading-7 text-[#f0f1f5] sm:text-[18px]"
      >
        <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
        {/* Down whether open or not, as drawn. */}
        <ChevronDownIcon size={22} strokeWidth={1.6} className="shrink-0" />
      </button>

      {open && (
        <>
          <div aria-hidden="true" className="mx-5 h-px bg-white/10" />
          <ul id={listId} role="listbox" aria-labelledby={id} className="py-[13px]">
            {options.map((o) => (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex h-[38px] w-full items-center px-5 text-start text-[15px] leading-6 transition-colors hover:bg-white/[0.04] sm:text-[16px] ${
                    o.value === value ? 'font-medium text-[#ffe779]' : 'text-[#f0f1f5]'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default DisclosureSelect;
