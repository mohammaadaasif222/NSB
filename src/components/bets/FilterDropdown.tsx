import { useEffect, useId, useMemo, useRef, useState, type FC, type KeyboardEvent } from 'react';
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@/components/icons';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  /** Shown before the choice, e.g. "Game:". */
  label: string;
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Adds a search box at the top of the list. */
  searchPlaceholder?: string;
  emptyText?: string;
}

/**
 * A filter control: a pill showing "Label: choice" that opens a list. With
 * `searchPlaceholder` the list has a search box, for a long list of games.
 *
 * It is a listbox, so it works from the keyboard: Arrow keys move, Enter picks,
 * Escape closes and hands focus back to the pill.
 */
const FilterDropdown: FC<Props> = ({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  searchPlaceholder,
  emptyText,
}) => {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  const close = (refocus = false) => {
    setOpen(false);
    setQuery('');
    if (refocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, visible.findIndex((o) => o.value === value)));
    if (searchPlaceholder) searchBox.current?.focus();
    // Only when the list opens or the search narrows it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  const pick = (o: DropdownOption) => {
    onChange(o.value);
    close(true);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && visible[active]) {
      e.preventDefault();
      pick(visible[active]);
    }
  };

  return (
    <div ref={root} className="relative shrink-0" onKeyDown={open ? onKeyDown : undefined}>
      <button
        ref={trigger}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`rl-chip flex h-[46px] w-full min-w-[calc(var(--u)*170)] items-center justify-between gap-3 rounded-full px-4 text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#f0f1f5] lg:h-[calc(var(--u)*48)] ${
          open ? 'rl-chip-active' : ''
        }`}
      >
        <span className="truncate">
          <span className="text-[#9da2b4]">{label} </span>
          <span className="font-medium">{selected?.label ?? ''}</span>
        </span>
        <ChevronDownIcon
          size={16}
          className={`shrink-0 text-[#9da2b4] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-30 mt-2 w-full min-w-[calc(var(--u)*240)] overflow-hidden rounded-2xl border border-white/10 bg-[#16181f] shadow-2xl">
          {searchPlaceholder && (
            <label className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
              <SearchIcon size={16} className="shrink-0 text-[#9da2b4]" />
              <input
                ref={searchBox}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#f0f1f5] outline-none placeholder:text-[#9da2b4]"
              />
            </label>
          )}
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-label={ariaLabel}
            className="thin-scrollbar max-h-[280px] overflow-y-auto py-1"
          >
            {visible.length === 0 && (
              <li className="px-4 py-6 text-center text-[13px] text-[#9da2b4]">{emptyText}</li>
            )}
            {visible.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[14px] ${
                  i === active ? 'bg-white/10 text-white' : 'text-[#cfd2dc]'
                } ${o.value === value ? 'font-medium' : ''}`}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <CheckIcon size={16} className="shrink-0 text-[#ffe779]" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
