import { useEffect, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import { MIN_SEARCH_LENGTH, searchCatalogue, type CataloguePage } from '@/services/catalogue';
import { gameHref, type ShelfListQuery } from '@/constants/games';
import { CloseIcon, SearchIcon } from '@/components/icons';
import type { TranslationKey } from '@/i18n/locales';
import type { Game } from '@/types';

/**
 * Catalogue search, reached from the magnifier in the top bar.
 *
 * Searches on the server, so every game is reachable however large the
 * catalogue grows. Each tab narrows the search to a shelf's filter; with
 * nothing typed a tab lists its most-played games.
 */

/**
 * The tabs along the top, as the Casino Manager chose them. Instant Wins has
 * no page of its own; it lives here, with a filter by kind.
 */
type SearchOption = { key: string; labelKey: TranslationKey; list: ShelfListQuery };

const SEARCH_TABS: SearchOption[] = [
  { key: 'all', labelKey: 'search.tabAll', list: {} },
  { key: 'slots', labelKey: 'dash.slots', list: { category: 'SLOTS' } },
  { key: 'live', labelKey: 'dash.liveCasino', list: { type: 'LIVE' } },
  { key: 'originals', labelKey: 'dash.originals', list: { category: 'ORIGINALS' } },
  {
    key: 'instant-wins',
    labelKey: 'lobby.chips.instantWins',
    list: { collection: 'instant-wins' },
  },
];

/** The Instant Wins tab's filter, in the Casino Manager's order. */
const INSTANT_KINDS: SearchOption[] = [
  { key: 'all', labelKey: 'search.tabAll', list: { collection: 'instant-wins' } },
  { key: 'crash', labelKey: 'search.kind.crash', list: { collection: 'crash', type: 'STANDARD' } },
  { key: 'mines', labelKey: 'lobby.rail.mines', list: { collection: 'mines' } },
  {
    key: 'blackjack',
    labelKey: 'lobby.chips.blackjack',
    list: { collection: 'blackjack', type: 'STANDARD' },
  },
  { key: 'plinko', labelKey: 'lobby.rail.plinko', list: { collection: 'plinko' } },
  {
    key: 'roulette',
    labelKey: 'lobby.chips.roulette',
    list: { collection: 'roulette', type: 'STANDARD' },
  },
  { key: 'dice', labelKey: 'lobby.rail.dice', list: { collection: 'dice' } },
  { key: 'wheel', labelKey: 'search.kind.wheel', list: { collection: 'wheel' } },
  {
    key: 'scratch-cards',
    labelKey: 'search.kind.scratchCards',
    list: { collection: 'scratch-cards' },
  },
  { key: 'keno', labelKey: 'lobby.rail.keno', list: { collection: 'keno' } },
  { key: 'hilo', labelKey: 'search.kind.hilo', list: { collection: 'hilo' } },
  { key: 'bingo', labelKey: 'search.kind.bingo', list: { collection: 'bingo' } },
];

const PILL = 'flex-shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-colors';
const PILL_ON = 'bg-[#ffe779]/15 text-[#ffe779]';
const PILL_OFF = 'text-white/55 hover:bg-white/5 hover:text-white';

/** Waits this long after the last keystroke before asking the server. */
const TYPING_PAUSE_MS = 250;

const GameRow: FC<{ game: Game; onPick: () => void; newLabel: string }> = ({
  game,
  onPick,
  newLabel,
}) => (
  <li>
    <Link
      href={gameHref(game.slug)}
      onClick={onPick}
      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
    >
      <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
        {game.image_url && (
          <Image src={game.image_url} alt="" fill sizes="48px" className="object-cover" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-white">{game.title}</span>
        <span className="block truncate text-[11px] text-white/40">{game.provider}</span>
      </span>
      {game.is_new && (
        <span className="flex-shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#14161b]">
          {newLabel}
        </span>
      )}
    </Link>
  </li>
);

const GameSearchModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(SEARCH_TABS[0].key);
  const [kind, setKind] = useState(INSTANT_KINDS[0].key);
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<Omit<CataloguePage, 'games'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // The query the shown results belong to; a page loaded for an older one is dropped.
  const shownFor = useRef('');

  const term = query.trim();
  const tooShort = term.length > 0 && term.length < MIN_SEARCH_LENGTH;
  const onInstant = tab === 'instant-wins';
  const list =
    (onInstant
      ? INSTANT_KINDS.find((x) => x.key === kind)?.list
      : SEARCH_TABS.find((x) => x.key === tab)?.list) ?? {};

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // A newer query aborts the request still on its way for the last one.
  useEffect(() => {
    if (tooShort) {
      return undefined;
    }
    const controller = new AbortController();
    const key = `${tab}:${kind}:${term}`;
    setLoading(true);
    setFailed(false);
    const timer = window.setTimeout(
      () => {
        searchCatalogue(term, controller.signal, { list })
          .then(({ games: found, ...paging }) => {
            if (controller.signal.aborted) return;
            shownFor.current = key;
            setGames(found);
            setPagination(paging);
          })
          .catch(() => !controller.signal.aborted && setFailed(true))
          .finally(() => !controller.signal.aborted && setLoading(false));
      },
      // A tab switch or the first open needs no pause.
      term ? TYPING_PAUSE_MS : 0
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // `list` follows `tab`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, tab, kind, tooShort]);

  const loadMore = (): void => {
    if (!pagination || loadingMore || loading) return;
    const key = shownFor.current;
    setLoadingMore(true);
    searchCatalogue(term, undefined, { list, page: pagination.page + 1 })
      .then(({ games: found, ...paging }) => {
        if (shownFor.current !== key) return;
        setGames((held) => {
          const ids = new Set(held.map((g) => g.id));
          return [...held, ...found.filter((g) => !ids.has(g.id))];
        });
        setPagination(paging);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  };

  // While the next answer is on its way the previous results stay, dimmed,
  // rather than blinking out on every keystroke.
  const firstLoad = loading && games.length === 0;
  const ready = !firstLoad && !failed && !tooShort;
  const more = ready && pagination !== null && pagination.page < pagination.totalPages;

  return (
    <div
      // On a phone, a sheet from the screen's foot like the auth modals':
      // full width, 24 clear of the top, its top corners at 34.
      className="rl-modal-overlay fixed inset-0 z-50 flex items-end justify-center pt-6 sm:items-start sm:px-4 sm:py-24"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('search.title')}
        onClick={(e) => e.stopPropagation()}
        // The modals' smoked glass and rim.
        className="rl-modal-card rl-modal-rim flex max-h-full w-full flex-col overflow-hidden max-sm:!rounded-t-[34px] max-sm:!rounded-b-none sm:max-w-lg"
      >
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-white/[0.08] p-3">
          <span className="flex-shrink-0 ps-1 text-white/40" aria-hidden="true">
            <SearchIcon size={17} />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35 [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div
          role="tablist"
          aria-label={t('search.title')}
          className="rl-shelf flex flex-shrink-0 gap-1.5 border-b border-white/[0.08] px-3 py-2"
        >
          {SEARCH_TABS.map((x) => {
            const on = x.key === tab;
            return (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setTab(x.key);
                  setKind(INSTANT_KINDS[0].key);
                }}
                className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}
              >
                {t(x.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Instant Wins narrows further by kind. */}
        {onInstant && (
          <div
            role="radiogroup"
            aria-label={t('lobby.chips.instantWins')}
            className="rl-shelf flex flex-shrink-0 gap-1.5 border-b border-white/[0.08] px-3 py-2"
          >
            {INSTANT_KINDS.map((x) => {
              const on = x.key === kind;
              return (
                <button
                  key={x.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setKind(x.key)}
                  className={`${PILL} border ${
                    on ? 'border-[#ffe779]/40 text-[#ffe779]' : 'border-white/10 ' + PILL_OFF
                  }`}
                >
                  {t(x.labelKey)}
                </button>
              );
            })}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar p-2">
          {tooShort && (
            <p className="px-2 py-8 text-center text-xs text-white/40">
              {t('search.minChars', { count: MIN_SEARCH_LENGTH })}
            </p>
          )}

          {!tooShort && firstLoad && (
            <p className="px-2 py-8 text-center text-xs text-white/40">{t('search.loading')}</p>
          )}

          {!tooShort && !firstLoad && failed && (
            <p className="px-2 py-8 text-center text-xs text-white/40">{t('search.failed')}</p>
          )}

          {ready && games.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-white/40">
              {term ? t('search.empty', { query: term }) : t('games.empty')}
            </p>
          )}

          {ready && games.length > 0 && (
            <>
              {!term && (
                <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-white/35">
                  {t('search.popular')}
                </p>
              )}
              <ul className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {games.map((game) => (
                  <GameRow key={game.id} game={game} onPick={onClose} newLabel={t('game.new')} />
                ))}
              </ul>
              {more && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mx-auto mt-1 block rounded-full px-4 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  {loadingMore ? t('search.loading') : t('search.loadMore')}
                </button>
              )}
            </>
          )}
        </div>

        {ready && pagination !== null && pagination.total > 0 && (
          <p className="border-t border-white/[0.08] px-4 py-2 text-[11px] text-white/40">
            {t('dash.gamesCount', { count: pagination.total })}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameSearchModal;
