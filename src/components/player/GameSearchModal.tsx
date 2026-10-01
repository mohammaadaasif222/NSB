import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import { fetchCatalogue, gameMatches } from '@/services/catalogue';
import { gameHref } from '@/constants/games';
import { CloseIcon, SearchIcon } from '@/components/icons';
import type { Game } from '@/types';

/**
 * Catalogue search, reached from the magnifier in the top bar.
 *
 * The catalogue is pulled once when the modal opens and filtered in the browser
 * — see fetchCatalogue for why the matching cannot happen server-side.
 */

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
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    let active = true;

    fetchCatalogue()
      .then((all) => {
        if (active) {
          setGames(all);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const trimmed = query.trim().toLowerCase();
  const results = useMemo(
    () => (trimmed ? games.filter((game) => gameMatches(game, trimmed)) : games),
    [games, trimmed]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16 sm:py-24"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('search.title')}
        onClick={(e) => e.stopPropagation()}
        className="rl-menu flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.08] p-3">
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
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
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

        <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar p-2">
          {loading && (
            <p className="px-2 py-8 text-center text-xs text-white/40">{t('search.loading')}</p>
          )}

          {!loading && failed && (
            <p className="px-2 py-8 text-center text-xs text-white/40">{t('search.failed')}</p>
          )}

          {!loading && !failed && results.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-white/40">
              {trimmed ? t('search.empty', { query }) : t('games.empty')}
            </p>
          )}

          {!loading && !failed && results.length > 0 && (
            <ul>
              {results.map((game) => (
                <GameRow key={game.id} game={game} onPick={onClose} newLabel={t('game.new')} />
              ))}
            </ul>
          )}
        </div>

        {!loading && !failed && results.length > 0 && (
          <p className="border-t border-white/[0.08] px-4 py-2 text-[11px] text-white/40">
            {t('dash.gamesCount', { count: results.length })}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameSearchModal;
