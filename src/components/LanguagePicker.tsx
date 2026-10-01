import { useEffect, useRef, useState, type FC } from 'react';
import { useI18n } from '@/context/I18nContext';
import { GlobeIcon } from '@/components/icons';

const ChevronDown: FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`transition-transform ${open ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface Props {
  /** `compact` drops the label on small screens (used in the top bar). */
  compact?: boolean;
  /** Frosted styling, for the glass auth card. */
  glass?: boolean;
  /** Open the list above the trigger — it sits at the foot of the auth card. */
  dropUp?: boolean;
  /**
   * Round globe button with no flag or label, matching the other icon
   * controls in the top bar. The menu then hangs from the start edge, since
   * the trigger sits at the start of the header.
   */
  iconOnly?: boolean;
  /**
   * The lobby shell's frosted pill — globe, label and chevron. Distinct from
   * `glass`, which is the auth card's heavier frosting on a fixed backdrop.
   */
  shell?: boolean;
}

/** Language switcher, backed by the real i18n dictionaries. */
const LanguagePicker: FC<Props> = ({
  compact = false,
  glass = false,
  dropUp = false,
  iconOnly = false,
  shell = false,
}) => {
  const { locale, setLocale, meta, locales, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const triggerClass = glass
    ? 'glass-pill flex items-center gap-2 px-3.5 py-2 text-sm text-white/85'
    : iconOnly
      ? 'rl-glass rl-glass-hover inline-flex h-[38px] w-[38px] items-center justify-center rounded-full text-white/65 hover:text-white'
      : shell
        ? 'rl-glass rl-glass-hover flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] text-white/75'
        : 'flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors';

  const frosted = glass || iconOnly || shell;

  const menuClass = glass
    ? 'glass-menu absolute start-0 z-40 w-48 overflow-hidden py-1 max-h-72 overflow-y-auto thin-scrollbar'
    : iconOnly || shell
      ? `rl-menu absolute ${iconOnly ? 'start-0' : 'end-0'} z-40 w-44 rounded-xl overflow-hidden py-1 max-h-72 overflow-y-auto thin-scrollbar`
      : 'absolute end-0 z-40 w-44 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden py-1 max-h-72 overflow-y-auto thin-scrollbar';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        className={triggerClass}
        title={iconOnly ? meta.label : undefined}
      >
        {iconOnly ? (
          <GlobeIcon size={17} />
        ) : (
          <>
            {shell ? <GlobeIcon size={14} /> : <span aria-hidden="true">{meta.flag}</span>}
            <span className={`font-medium ${compact ? 'hidden sm:inline' : ''}`}>{meta.label}</span>
            <ChevronDown open={open} />
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.language')}
          className={`${menuClass} ${dropUp ? 'bottom-11' : 'top-11'}`}
        >
          {locales.map((l) => {
            const active = l.code === locale;
            const activeClass = frosted ? 'bg-white/15 text-white' : 'bg-blue-600/15 text-blue-300';
            const idleClass = frosted
              ? 'text-white/75 hover:bg-white/10 hover:text-white'
              : 'text-slate-200 hover:bg-white/5';

            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  active ? activeClass : idleClass
                }`}
              >
                <span aria-hidden="true">{l.flag}</span>
                <span className="flex-1 text-start">{l.label}</span>
                {active && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;
