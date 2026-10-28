import { useEffect, useRef, useState, type FC } from 'react';
import { useI18n } from '@/context/I18nContext';
import CountryFlag from '@/components/flags/CountryFlag';
import globeIcon from '@/assets/lobby/footer/lang-globe.svg';
import chevronIcon from '@/assets/lobby/footer/lang-chevron.svg';
import barGlobe from '@/assets/lobby/rail/bar-language.svg';
import { TranslateIcon, FooterChevron } from '@/components/player/footer/footerIcons';
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
    // The modals' smoked glass and rim (diagonal on a phone, clear corners on
    // the web). The card class positions itself, so the placement's
    // `absolute` is forced, as is the menu's smaller radius.
    className={`rl-modal-card rl-modal-rim [--rim-clear:22px] [--rim-fade:40px] z-40 w-[142px] !rounded-[24px] px-[7px] pb-[9px] pt-[13px] ${className}`}
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
  /** Clear-glass styling for the auth modals' footer — sized to match the gold
   *  action button beside it (Button size="sm"). */
  glass?: boolean;
  /** Open the list above the trigger — it sits at the foot of the auth card. */
  dropUp?: boolean;
  /**
   * Round globe button with no flag or label, matching the other icon
   * controls in the top bar. The menu then hangs from the start edge, since
   * the trigger sits at the start of the header.
   */
  iconOnly?: boolean;
  /** With `iconOnly`: open the list from the trigger's end edge, for a
   *  trigger at the end of its row (the phone menu's). */
  menuAlign?: 'start' | 'end';
  /**
   * The lobby shell's frosted pill — globe, label and chevron. Distinct from
   * `glass`, which is the auth card's heavier frosting on a fixed backdrop.
   * Sized in `--u` like the footer discs beside it (the design's 143×48), so
   * the pill scales with them instead of outgrowing them on a smaller screen.
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
  menuAlign = 'start',
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
    ? 'glass-pill flex h-10 items-center gap-1.5 px-2.5 font-rubik text-[14px] text-white'
    : iconOnly
      ? 'rl-glass-btn inline-flex h-10 w-10 items-center justify-center rounded-full lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]'
      : shell
        ? 'rl-glass-btn flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*6)] rounded-full ps-[calc(var(--u)*12)] pe-[calc(var(--u)*15)] font-rubik text-[length:max(11px,calc(var(--u)*16))] font-medium leading-[calc(var(--u)*24)] text-white'
        : plain
          ? 'flex items-center gap-[calc(var(--u)*10)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-white'
          : 'flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors';

  // Where the list opens. The auth card's rises over its own trigger, as the
  // design draws it; the rest hang off their trigger on the side with room.
  const placement = glass
    ? `start-0 ${dropUp ? 'bottom-0' : 'top-0'}`
    : iconOnly
      ? `${menuAlign === 'end' ? 'end-0' : 'start-0'} top-12 lg:top-[calc(var(--u)*56)]`
      : dropUp
        ? `end-0 ${shell ? 'bottom-[calc(100%+var(--u)*8)]' : 'bottom-11'}`
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
              <img
                src={globeIcon.src}
                alt=""
                className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
              />
            ) : (
              <CountryFlag country={meta.country} size={glass ? 24 : plain ? 16 : 18} />
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
                className={`ms-[calc(var(--u)*8)] h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] transition-transform ${open ? 'rotate-180' : ''}`}
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
          className={`!absolute ${placement}`}
        />
      )}
    </div>
  );
};

export default LanguagePicker;
