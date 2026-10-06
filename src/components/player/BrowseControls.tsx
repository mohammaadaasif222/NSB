import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import type { StaticImageData } from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import type { GameShelfKey } from '@/types';
import type { TranslationKey } from '@/i18n/locales';
import searchIcon from '@/assets/lobby/player/tool-search.svg';
import chevronIcon from '@/assets/lobby/player/tool-chevron.svg';
import chipLobby from '@/assets/lobby/player/chip-lobby.svg';
import chipOriginals from '@/assets/lobby/player/chip-originals.svg';
import chipSlots from '@/assets/lobby/player/chip-slots.svg';
import chipLive from '@/assets/lobby/player/chip-live.svg';
import chipRoulette from '@/assets/lobby/player/chip-roulette.svg';
import chipBaccarat from '@/assets/lobby/player/chip-baccarat.svg';
import chipGameShows from '@/assets/lobby/player/chip-gameshows.svg';
import chipNewArrivals from '@/assets/lobby/player/chip-newarrivals.svg';
import chipBonusBuys from '@/assets/lobby/player/chip-bonusbuys.svg';

/*
 * The catalogue browser's controls — search, the three dropdowns and the
 * category chips — drawn as the signed-in lobby design does. Sized in `--u`
 * (see PlayerLayout): the design's px on desktop, scaled with the page.
 */

/** The design's small dark glass, which every control here sits on. */
const GLASS =
  'border border-white/10 bg-black/40 backdrop-blur-md transition-colors hover:bg-white/[0.08]';

/* ==================================================================== */
/* Search                                                                */
/* ==================================================================== */

export const SearchField: FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}> = ({ value, onChange, placeholder, label }) => (
  <label
    className={`${GLASS} flex h-[47px] min-w-0 flex-shrink-0 items-center gap-2.5 rounded-full lg:flex-1 px-3 focus-within:border-white/25 lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*10)] lg:px-[calc(var(--u)*12)]`}
  >
    <img
      src={searchIcon.src}
      alt=""
      className="h-6 w-6 flex-shrink-0 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-[#f0f1f5] outline-none placeholder:text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))]"
    />
  </label>
);

/* ==================================================================== */
/* Dropdown                                                              */
/* ==================================================================== */

interface DropdownProps {
  icon: StaticImageData;
  label: string;
  children: (close: () => void) => ReactNode;
}

/**
 * A toolbar dropdown: the design's pill — icon, label and, on desktop, a
 * chevron — with its menu anchored under it. Closes on click-away and Escape.
 */
export const Dropdown: FC<DropdownProps> = ({ icon, label, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const away = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${GLASS} flex h-12 w-full items-center justify-center gap-1 rounded-full px-4 text-[14px] leading-5 text-[#f0f1f5] lg:h-[calc(var(--u)*48)] lg:min-w-[calc(var(--u)*150)] lg:justify-start lg:gap-[calc(var(--u)*10)] lg:px-[calc(var(--u)*16)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]`}
      >
        <img
          src={icon.src}
          alt=""
          className="h-4 w-4 flex-shrink-0 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
        />
        <span className="truncate">{label}</span>
        <img
          src={chevronIcon.src}
          alt=""
          className={`ms-auto hidden h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] flex-shrink-0 transition-transform lg:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="rl-menu thin-scrollbar absolute end-0 top-[calc(100%+6px)] z-30 max-h-72 w-56 overflow-y-auto rounded-xl py-1"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

export const Option: FC<{ selected: boolean; onSelect: () => void; children: ReactNode }> = ({
  selected,
  onSelect,
  children,
}) => (
  <button
    type="button"
    role="menuitemradio"
    aria-checked={selected}
    onClick={onSelect}
    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
      selected ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className="truncate">{children}</span>
  </button>
);

/* ==================================================================== */
/* Category chips                                                        */
/* ==================================================================== */

export type ChipKey = GameShelfKey | 'lobby';

/**
 * The chip row, in the design's order. A chip with a `key` filters the
 * browser to that shelf; the rest are in the design with no games behind them
 * yet, so they render dimmed and tagged "Soon" rather than filtering to an
 * empty grid.
 */
interface Chip {
  /** The shelf it filters to; absent for a chip with nothing behind it yet. */
  key?: ChipKey;
  /** Translated label, or `label` for the design's own copy. */
  labelKey?: TranslationKey;
  label?: string;
  icon: StaticImageData;
}

const CHIPS: Chip[] = [
  { key: 'lobby', labelKey: 'browse.lobby', icon: chipLobby },
  { key: 'originals', labelKey: 'nav.originals', icon: chipOriginals },
  { key: 'slots', labelKey: 'dash.slots', icon: chipSlots },
  { key: 'live', labelKey: 'dash.liveCasino', icon: chipLive },
  { label: 'Blackjack', icon: chipLive },
  { label: 'Roulette', icon: chipRoulette },
  { label: 'Baccarat', icon: chipBaccarat },
  { label: 'Game Shows', icon: chipGameShows },
  { label: 'Table Games', icon: chipOriginals },
  { label: 'Boosted RTP', icon: chipOriginals },
  { key: 'new', label: 'New Arrivals', icon: chipNewArrivals },
  { label: 'Bonus Buys', icon: chipBonusBuys },
];

const CHIP =
  'inline-flex h-[calc(var(--u)*48)] flex-shrink-0 items-center gap-[calc(var(--u)*10)] rounded-full px-[calc(var(--u)*24)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)]';

export const CategoryChips: FC<{
  active: ChipKey;
  onChange: (key: ChipKey) => void;
}> = ({ active, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="rl-shelf flex gap-[calc(var(--u)*15)]">
      {CHIPS.map((chip) => {
        const text = chip.labelKey ? t(chip.labelKey) : (chip.label ?? '');
        const icon = (
          <img
            src={chip.icon.src}
            alt=""
            className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)] flex-shrink-0"
          />
        );

        if (!chip.key) {
          return (
            <span
              key={text}
              title={`${text} — ${t('common.soon')}`}
              aria-disabled="true"
              className={`${CHIP} cursor-default border border-white/10 bg-black/40 text-[#9da2b4]/50 backdrop-blur-md [&>img]:opacity-50`}
            >
              {icon}
              {text}
            </span>
          );
        }

        const key = chip.key;
        const on = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={on}
            className={`${CHIP} ${GLASS} ${on ? 'font-medium text-[#ffe779]' : 'text-[#9da2b4] hover:text-[#f0f1f5]'}`}
          >
            {icon}
            {text}
          </button>
        );
      })}
    </div>
  );
};
