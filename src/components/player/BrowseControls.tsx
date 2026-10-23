import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import type { StaticImageData } from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { gameMatches } from '@/services/catalogue';
import type { Game, GameShelfKey } from '@/types';
import type { TranslationKey } from '@/i18n/locales';
import searchIcon from '@/assets/lobby/player/tool-search.svg';
import sortIcon from '@/assets/lobby/player/tool-sort.svg';
import filterIcon from '@/assets/lobby/player/tool-filter.svg';
import providerIcon from '@/assets/lobby/player/tool-provider.svg';
import chevronIcon from '@/assets/lobby/player/tool-chevron.svg';
import chipLobby from '@/assets/lobby/player/chip-lobby.svg';
import chipOriginals from '@/assets/lobby/player/chip-originals.svg';
import chipSlots from '@/assets/lobby/player/chip-slots.svg';
import chipLive from '@/assets/lobby/player/chip-live.svg';
import chipRoulette from '@/assets/lobby/player/chip-roulette.svg';
import chipBaccarat from '@/assets/lobby/player/chip-baccarat.svg';
import chipGameShows from '@/assets/lobby/player/chip-gameshows.svg';
import chipNewArrivals from '@/assets/lobby/player/chip-newarrivals.svg';
import Glyph from '@/components/player/Glyph';


const GLASS = 'rl-glass-btn';

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
    className={`${GLASS} flex h-[47px] min-w-0 flex-shrink-0 items-center gap-2.5 rounded-full lg:flex-1 px-3 focus-within:bg-white/[0.08] lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*10)] lg:px-[calc(var(--u)*12)]`}
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
  phoneLabel?: string;
  children: (close: () => void) => ReactNode;
  active?: boolean;
  align?: 'start' | 'end';
  sheetOnPhone?: boolean;
}

/**
 * A toolbar dropdown: the design's pill — icon, label and, on desktop, a
 * chevron — with its menu anchored under it. Closes on click-away and Escape.
 */
export const Dropdown: FC<DropdownProps> = ({
  icon,
  label, 
  phoneLabel,
  children,
  active = false,
  align = 'end',
  sheetOnPhone = false,
}) => {
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
        className={`${GLASS} ${active ? CHIP_ON : ''} flex h-12 w-full items-center justify-center gap-1 rounded-full px-3 text-[14px] min-[420px]:px-4 leading-5 ${active ? '' : 'text-[#f0f1f5]'} lg:h-[calc(var(--u)*48)] lg:min-w-[calc(var(--u)*150)] lg:justify-start lg:gap-[calc(var(--u)*10)] lg:px-[calc(var(--u)*16)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]`}
      >
        <img
          src={icon.src}
          alt=""
          className="h-4 w-4 flex-shrink-0 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
        />
        {phoneLabel ? (
          <>
            <span className="truncate lg:hidden">{phoneLabel}</span>
            <span className="hidden truncate lg:inline">{label}</span>
          </>
        ) : (
          <span className="truncate">{label}</span>
        )}
        <img
          src={chevronIcon.src}
          alt=""
          className={`ms-auto hidden h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] flex-shrink-0 transition-transform lg:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          {sheetOnPhone && (
            <div
              aria-hidden
              className="fixed inset-0 z-[60] bg-black/55 lg:hidden"
              onClick={() => setOpen(false)}
            />
          )}
          <div
            role="menu"
            className={`rl-menu thin-scrollbar ${align === 'start' ? 'start-0' : 'end-0'} ${
              sheetOnPhone
                ? 'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:z-[61] max-lg:max-h-[70vh] max-lg:w-auto max-lg:rounded-b-none max-lg:rounded-t-2xl max-lg:pb-6 max-lg:pt-3'
                : ''
            } absolute top-[calc(100%+6px)] z-30 max-h-72 w-56 overflow-y-auto rounded-xl py-1`}
          >
            {sheetOnPhone && (
              <div
                aria-hidden
                className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/25 lg:hidden"
              />
            )}
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
};

export const Option: FC<{
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  count?: number;
  multi?: boolean;
}> = ({ selected, onSelect, children, count, multi = false }) => (
  <button
    type="button"
    role={multi ? 'menuitemcheckbox' : 'menuitemradio'}
    aria-checked={selected}
    onClick={onSelect}
    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors max-lg:py-3 max-lg:text-sm ${
      selected ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    {multi && (
      <span
        aria-hidden
        className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border text-[10px] ${
          selected ? 'border-[#ffe779] bg-[#ffe779] text-black' : 'border-white/30'
        }`}
      >
        {selected ? '✓' : ''}
      </span>
    )}
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {count !== undefined && <span className="tabular-nums text-white/35">{count}</span>}
  </button>
);

/* ==================================================================== */
/* Toolbar: search, sort, filter, provider                               */
/* ==================================================================== */

export type SortKey = 'az' | 'za' | 'rtp' | 'new';
export type FilterKey = 'all' | 'new';

export const SORTS: { key: SortKey; labelKey: TranslationKey }[] = [
  { key: 'az', labelKey: 'browse.sortAZ' },
  { key: 'za', labelKey: 'browse.sortZA' },
  { key: 'rtp', labelKey: 'browse.sortRtp' },
  { key: 'new', labelKey: 'browse.sortNewest' },
];

export const FILTERS: { key: FilterKey; labelKey: TranslationKey }[] = [
  { key: 'all', labelKey: 'browse.filterAll' },
  { key: 'new', labelKey: 'browse.filterNew' },
];

/** What the toolbar is set to. */
export interface BrowseState {
  search: string;
  sort: SortKey;
  filter: FilterKey;
  provider: string;
}

export const BROWSE_DEFAULTS: BrowseState = { search: '', sort: 'az', filter: 'all', provider: '' };

const sortGames = (games: Game[], key: SortKey): Game[] => {
  const out = [...games];
  switch (key) {
    case 'az':
      return out.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return out.sort((a, b) => b.title.localeCompare(a.title));
    case 'rtp':
      // Games without a published RTP sort last.
      return out.sort((a, b) => (b.rtp ?? -1) - (a.rtp ?? -1));
    case 'new':
      return out.sort((a, b) => Number(b.is_new) - Number(a.is_new));
  }
};

/**
 * A list narrowed and ordered as the toolbar asks. `keepOrder` leaves the
 * list's own order while the sort is untouched — a player's recents and
 * favourites are newest first, which "A–Z" would throw away.
 */
export const browseGames = (
  games: Game[],
  { search, sort, filter, provider }: BrowseState,
  keepOrder = false
): Game[] => {
  const term = search.trim().toLowerCase();
  const out = games.filter(
    (g) =>
      (!term || gameMatches(g, term)) &&
      (filter !== 'new' || g.is_new) &&
      (!provider || g.provider === provider)
  );
  return keepOrder && sort === BROWSE_DEFAULTS.sort ? out : sortGames(out, sort);
};

/**
 * The design's toolbar: the search field with the three dropdowns beside it
 * on desktop, and under it, three across, on a phone.
 */
export const BrowseToolbar: FC<{
  state: BrowseState;
  onChange: (patch: Partial<BrowseState>) => void;
  providers: string[];
}> = ({ state, onChange, providers }) => {
  const { t } = useTranslation();
  const sortLabel = t(SORTS.find((s) => s.key === state.sort)?.labelKey ?? 'browse.sort');
  const filterLabel = t(FILTERS.find((f) => f.key === state.filter)?.labelKey ?? 'browse.filter');

  return (
    <div className="flex flex-col gap-[14px] lg:flex-row lg:gap-[calc(var(--u)*20)]">
      <SearchField
        value={state.search}
        onChange={(search) => onChange({ search })}
        placeholder={t('search.placeholder')}
        label={t('search.title')}
      />

      {/* The design's 106 / 106 / 162 at 420; narrower, Sort and Filter
          keep to their words and Choose provider takes the rest. */}
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-[7px] min-[420px]:grid-cols-[1fr_1fr_1.53fr] lg:flex lg:gap-[calc(var(--u)*10)]">
        <Dropdown icon={sortIcon} label={sortLabel} phoneLabel={t('browse.sort')}>
          {(close) =>
            SORTS.map((s) => (
              <Option
                key={s.key}
                selected={state.sort === s.key}
                onSelect={() => {
                  onChange({ sort: s.key });
                  close();
                }}
              >
                {t(s.labelKey)}
              </Option>
            ))
          }
        </Dropdown>

        <Dropdown icon={filterIcon} label={filterLabel} phoneLabel={t('browse.filter')}>
          {(close) =>
            FILTERS.map((f) => (
              <Option
                key={f.key}
                selected={state.filter === f.key}
                onSelect={() => {
                  onChange({ filter: f.key });
                  close();
                }}
              >
                {t(f.labelKey)}
              </Option>
            ))
          }
        </Dropdown>

        <Dropdown icon={providerIcon} label={state.provider || t('browse.provider')}>
          {(close) => (
            <>
              <Option
                selected={state.provider === ''}
                onSelect={() => {
                  onChange({ provider: '' });
                  close();
                }}
              >
                {t('browse.allProviders')}
              </Option>
              {providers.map((name) => (
                <Option
                  key={name}
                  selected={state.provider === name}
                  onSelect={() => {
                    onChange({ provider: name });
                    close();
                  }}
                >
                  {name}
                </Option>
              ))}
            </>
          )}
        </Dropdown>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* Category chips                                                        */
/* ==================================================================== */

export type ChipKey = GameShelfKey | 'lobby' | 'favourites';

/**
 * The chip row, in the design's order. A chip with a `key` filters the
 * browser to that shelf (an empty shelf filters to an honest empty grid); the
 * rest are in the design with nothing behind them yet, so they render dimmed
 * and tagged "Soon".
 */
interface Chip {
  key?: ChipKey;
  labelKey: TranslationKey;
  icon: StaticImageData;
  signedIn?: boolean;
}

/**
 * The casino page's menu, from the Casino Manager sheet's "Final" column.
 * Live Casino opens its lobby (GameBrowser.chooseCategory); the rest filter
 * the browser in place, across the whole catalogue.
 */
const CHIPS: Chip[] = [
  { key: 'lobby', labelKey: 'browse.lobby', icon: chipLobby },
  { key: 'originals', labelKey: 'nav.originals', icon: chipOriginals },
  { key: 'slots', labelKey: 'dash.slots', icon: chipSlots },
  { key: 'live', labelKey: 'dash.liveCasino', icon: chipLive },
  { key: 'blackjack', labelKey: 'lobby.chips.blackjack', icon: chipLive },
  { key: 'roulette', labelKey: 'lobby.chips.roulette', icon: chipRoulette },
  { key: 'baccarat', labelKey: 'lobby.chips.baccarat', icon: chipBaccarat },
  { key: 'game-shows', labelKey: 'lobby.chips.gameShows', icon: chipGameShows },
  { key: 'table', labelKey: 'dash.tableGames', icon: chipOriginals },
];

/**
 * The Live Casino lobby's menu, from the Casino Manager sheet. Each table
 * chip jumps to its row on the page; Slots and Instant Wins open their pages.
 */
const LIVE_CHIPS: Chip[] = [
  { key: 'lobby', labelKey: 'lobby.chips.home', icon: chipLobby },
  { key: 'live-blackjack', labelKey: 'lobby.chips.blackjack', icon: chipLive },
  { key: 'live-roulette', labelKey: 'lobby.chips.roulette', icon: chipRoulette },
  { key: 'live-baccarat', labelKey: 'lobby.chips.baccarat', icon: chipBaccarat },
  { key: 'live-game-shows', labelKey: 'lobby.chips.gameShows', icon: chipGameShows },
  { key: 'slots', labelKey: 'dash.slots', icon: chipSlots },
  { key: 'instant-wins', labelKey: 'lobby.chips.instantWins', icon: chipNewArrivals },
];

export type ChipSet = 'casino' | 'live';

const CHIP =
  'inline-flex h-[34px] flex-shrink-0 items-center gap-[5px] rounded-full px-3 text-[12px] leading-5 lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*10)] lg:px-[calc(var(--u)*24)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

const CHIP_ON =
  'font-rubik font-medium text-[#ffe779] shadow-[0_0_12px_rgba(255,231,121,0.5)] lg:shadow-[0_0_calc(var(--u)*17.6)_rgba(255,231,121,0.2)]';

const CHIP_ICON = 'h-[18px] w-[18px] lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]';

/**
 * One selectable chip — the casino's category chips and the sportsbook's
 * sport chips alike: glass at rest, gold and glowing when on.
 */
export const ChipButton: FC<{
  active: boolean;
  onClick: () => void;
  /** An icon, tinted with the label. */
  icon?: StaticImageData;
  children: ReactNode;
}> = ({ active, onClick, icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`${CHIP} ${GLASS} ${active ? CHIP_ON : 'text-[#9da2b4] hover:text-[#f0f1f5]'}`}
  >
    {icon && <Glyph src={icon.src} className={CHIP_ICON} />}
    {children}
  </button>
);

/** The chip row's scroller, bleeding to the screen edge on a phone. */
export const CHIP_ROW =
  'rl-shelf -mx-4 flex gap-[7px] px-4 py-3 -my-3 lg:mx-0 lg:gap-[calc(var(--u)*15)] lg:px-0';

export const CategoryChips: FC<{
  active: ChipKey;
  onChange: (key: ChipKey) => void;
  set?: ChipSet;
}> = ({ active, onChange, set = 'casino' }) => {
  const { t } = useTranslation();
  const { token } = useAuth();

  return (
    <div className={CHIP_ROW}>
      {(set === 'live' ? LIVE_CHIPS : CHIPS)
        .filter((chip) => !chip.signedIn || token)
        .map((chip) => {
          const text = t(chip.labelKey);
          const icon = <Glyph src={chip.icon.src} className={CHIP_ICON} />;

          if (!chip.key) {
            return (
              <span
                key={text}
                title={`${text} — ${t('common.soon')}`}
                aria-disabled="true"
                className={`${CHIP} rl-glass-btn cursor-default text-[#9da2b4]/50 hover:filter-none`}
              >
                {icon}
                {text}
              </span>
            );
          }

          const key = chip.key;
          return (
            <ChipButton
              key={key}
              active={active === key}
              onClick={() => onChange(key)}
              icon={chip.icon}
            >
              {text}
            </ChipButton>
          );
        })}
    </div>
  );
};
