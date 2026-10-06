import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/components/icons';

/**
 * A select that the page draws instead of the operating system.
 *
 * A native `<select>` paints its option list in a window outside the document.
 * Nothing in a stylesheet reaches it: not the radius, not the glass, not the
 * highlight colour — `color-scheme: dark` moves it from white to black and that
 * is the whole of what CSS can do there. Under a dialog built from 34px
 * capsules and blurred glass, a square black list with the system's blue bar
 * reads as a different application.
 *
 * So the list is rendered here, as elements, and the control keeps the
 * keyboard behaviour a real select has: typing is the one thing left out, and
 * it is a worthwhile gap to note — on a list of three or four labelled
 * options, which is all this is used for, the arrow keys cover it.
 *
 * Portalled to `document.body` on purpose. The dialog that hosts this scrolls
 * its own body, and a list positioned inside that scroller gets clipped by it;
 * the dialog also carries `backdrop-filter`, which makes it the containing
 * block for anything `fixed` inside it. Leaving the subtree sidesteps both.
 */
export interface RlOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  /** Goes on the trigger, so a `<label htmlFor>` still finds this control. */
  id: string;
  value: T | '';
  options: readonly RlOption<T>[];
  onChange: (value: T) => void;
  /** Shown when nothing is chosen yet. */
  placeholder?: string;
  className?: string;
}

/** Row height and the list's own padding — used to guess at the space needed. */
const ROW = 48;
const PAD = 12;
const GAP = 8;
const MAX = 288;

function RlSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  placeholder,
  className = '',
}: Props<T>): React.ReactElement {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{
    left: number;
    width: number;
    top: number;
    maxHeight: number;
    up: boolean;
  } | null>(null);

  useEffect(() => setMounted(true), []);

  const selected = options.findIndex((o) => o.value === value);
  const label = selected >= 0 ? options[selected].label : (placeholder ?? '');

  /* Measured against the live trigger every time, because the dialog it sits
     in can be scrolled or resized while the list is open. */
  const place = useCallback((): void => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const wanted = Math.min(options.length * ROW + PAD, MAX);
    const below = window.innerHeight - r.bottom - GAP * 2;
    const above = r.top - GAP * 2;
    const up = below < wanted && above > below;
    setBox({
      left: r.left,
      width: r.width,
      top: up ? r.top - GAP : r.bottom + GAP,
      maxHeight: Math.max(96, Math.min(wanted, up ? above : below)),
      up,
    });
  }, [options.length]);

  // Opening lands on whatever is currently chosen, as a native list does.
  const show = (): void => {
    setActive(selected >= 0 ? selected : 0);
    place();
    setOpen(true);
  };

  const hide = (focusTrigger = true): void => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const pick = (i: number): void => {
    onChange(options[i].value);
    hide();
  };

  useEffect(() => {
    if (!open) return;

    listRef.current?.focus();

    const onPointerDown = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (listRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      hide(false);
    };
    /* Capture, so a scroll inside the dialog body moves the list with its
       trigger rather than leaving it stranded mid-air. */
    const onScroll = (): void => place();

    /*
     * Escape has to close the list and stop there. The dialog hosting this
     * listens for Escape on `document` to close itself, so without taking the
     * key here one press would shut both and throw away a half-filled form.
     * Capture phase, because that runs before the dialog's own listener.
     */
    const onEscape = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      hide();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, place]);

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        show();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        hide();
        break;
      case 'Tab':
        hide(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        pick(active);
        break;
    }
  };

  const listStyle: CSSProperties = {
    position: 'fixed',
    left: box?.left,
    top: box?.top,
    width: box?.width,
    maxHeight: box?.maxHeight,
    transform: box?.up ? 'translateY(-100%)' : undefined,
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? hide() : show())}
        onKeyDown={onKeyDown}
        /* The placeholder is not dimmed: the design draws "Limit Type" in the
           same bold near-white as a chosen value, and the label above the
           control already says what is being asked for. */
        className={`rl-modal-field flex h-14 w-full items-center ps-6 pe-14 text-start text-[18px] leading-6 font-bold text-[#f0f1f5] outline-none focus-visible:border-white/30 ${className}`}
      >
        <span className="min-w-0 truncate">{label}</span>
      </button>

      <ChevronDownIcon
        size={16}
        className={`pointer-events-none absolute end-6 top-1/2 -translate-y-1/2 text-[#f0f1f5] transition-transform duration-150 ${
          open ? '-rotate-180' : ''
        }`}
      />

      {mounted &&
        open &&
        box &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onKeyDown}
            style={listStyle}
            className="rl-menu thin-scrollbar z-60 overflow-y-auto rounded-3xl p-1.5 outline-none"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <div
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className={`flex h-10.5 cursor-pointer items-center rounded-full px-4.5 text-[16px] leading-6 font-medium transition-colors ${
                    isSelected ? 'text-[#f9d028]' : 'text-[#f0f1f5]'
                  } ${i === active ? 'bg-white/10' : ''}`}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

export default RlSelect;
