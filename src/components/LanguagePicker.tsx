import { useEffect, useRef, useState, type FC } from 'react';
import { useI18n } from '@/context/I18nContext';
import CountryFlag from '@/components/flags/CountryFlag';
import globeIcon from '@/assets/lobby/footer/lang-globe.svg';
import chevronIcon from '@/assets/lobby/footer/lang-chevron.svg';
import barGlobe from '@/assets/lobby/rail/bar-language.svg';
import { TranslateIcon, FooterChevron } from '@/components/player/footer/footerIcons';
import { POPUP_SURFACE } from '@/components/player/popupSurface';
import type { Locale, LocaleMeta } from '@/i18n/locales';

/**
 * The language list, as every design draws it: a 142px glass panel headed
 * "Language", then a row per language — its round flag and its own name —
 * 35px apart, the current one on a faint pill. Every picker opens this.
 */
export const LanguageMenu: FC<{
  locales: readonly LocaleMeta[];
  current: Locale;
  onSelect: (code: Locale) => void;
  title: string;
  /** Placement classes (absolute position) from the picker. */
  className?: string;
}> = ({ locales, current, onSelect, title, className = '' }) => (
  <div
    role="listbox"
    aria-label={title}
    className={`z-40 w-[142px] rounded-[24px] px-[7px] pb-[9px] pt-[13px] ${POPUP_SURFACE.raised} ${className}`}
  >
    <p className="px-1.5 text-[12px] leading-5 text-[#9da2b4]">{title}</p>
    <div className="mt-2 flex flex-col gap-[3px]">
      {locales.map((l) => {
        const active = l.code === current;
        return (
          <button
            key={l.code}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(l.code)}
            className={`flex h-8 w-full items-center gap-[7px] rounded-full px-1.5 text-start text-[14px] font-medium leading-5 text-[#f0f1f5] transition-colors ${
              active ? 'bg-white/10' : 'hover:bg-white/[0.07]'
            }`}
          >
            <CountryFlag country={l.country} size={21} className="ring-0" />
            <span className="truncate">{l.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const ChevronDown: FC<{ open: boolean; size?: number }> = ({ open, size = 12 }) => (
  <svg
    width={size}
    height={size}
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

/**
 * The account row's chevron — heavier, and pointing along the row rather than
 * down it, which is how the design closes a value row. Turns down on open so
 * the trigger still says which way the list went.
 */
const ChevronLead: FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${open ? 'rotate-90' : ''}`}
    aria-hidden="true"
  >
    <path d="M6 13.3333L11.3333 8L6 2.66667" />
  </svg>
);

interface Props {
  /** `compact` drops the label on small screens (used in the top bar). */
  compact?: boolean;
  /** Frosted styling for the auth modals' footer — sized to match the gold
   *  action button beside it (Button size="md"). */
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
  /**
   * No pill at all — flag, label and chevron sitting bare on a card row. The
   * Preferences tab's value rows carry their controls this way.
   */
  plain?: boolean;
  /**
   * The site footer's capsule — taller than the shell's, and headed by the
   * translate glyph rather than a flag, which is what the design draws there.
   */
  footer?: boolean;
}

/** Language switcher, backed by the real i18n dictionaries. */
const LanguagePicker: FC<Props> = ({
  compact = false,
  glass = false,
  dropUp = false,
  iconOnly = false,
  shell = false,
  plain = false,
  footer = false,
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
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const triggerClass = glass
    ? 'glass-pill flex h-11 items-center gap-2 px-4 text-[15px] text-white sm:h-12 sm:px-5 sm:text-base'
    : iconOnly
      ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-colors hover:bg-white/10 lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]'
      : shell
        ? 'flex h-12 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 text-[16px] font-medium leading-6 text-white backdrop-blur-md transition-colors hover:bg-white/10'
        : 'flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors';

  // Where the list opens. The auth card's rises over its own trigger, as the
  // design draws it; the rest hang off their trigger on the side with room.
  const placement = glass
    ? `start-0 ${dropUp ? 'bottom-0' : 'top-0'}`
    : iconOnly
      ? 'start-0 top-12 lg:top-[calc(var(--u)*56)]'
      : dropUp
        ? `end-0 ${shell ? 'bottom-14' : 'bottom-11'}`
        : 'end-0 top-11';

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
          <img
            src={barGlobe.src}
            alt=""
            className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
          />
        ) : (
          <>
            {footer ? (
              <TranslateIcon />
            ) : shell ? (
              <img src={globeIcon.src} alt="" className="h-6 w-6" />
            ) : (
              <CountryFlag country={meta.country} size={glass ? 24 : 18} />
            )}
            <span className={`${plain ? '' : 'font-medium'} ${compact ? 'hidden sm:inline' : ''}`}>
              {meta.label}
            </span>
            {footer ? (
              <FooterChevron open={open} />
            ) : plain ? (
              <ChevronLead open={open} />
            ) : shell ? (
              <img
                src={chevronIcon.src}
                alt=""
                className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            ) : (
              <ChevronDown open={open} size={glass ? 16 : 12} />
            )}
          </>
        )}
      </button>

      {open && (
        <LanguageMenu
          locales={locales}
          current={locale}
          title={t('common.language')}
          onSelect={(code) => {
            setLocale(code);
            setOpen(false);
          }}
          className={`absolute ${placement}`}
        />
      )}
    </div>
  );
};

export default LanguagePicker;
