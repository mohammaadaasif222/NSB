import { useState, type FC } from 'react';
import Link, { type LinkProps } from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { HeartIcon } from '@/components/icons';
import ScrollShelf from '@/components/player/ScrollShelf';
import { BROWSE_ANCHOR } from '@/components/player/GameBrowser';
import type { LobbyProvider } from '@/types';

/**
 * One studio's plate: its logo, or its name when it has none or the image
 * fails to load — a broken-image icon on a lobby plate reads as a broken site.
 *
 * The heart is local-only for the same reason the game tile's is: there is no
 * favourites endpoint to persist it to yet.
 */
const ProviderCard: FC<{ provider: LobbyProvider; href: LinkProps['href'] }> = ({
  provider,
  href,
}) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [broken, setBroken] = useState(false);
  const showLogo = !!provider.logo_url && !broken;

  return (
    <div className="rl-glass rl-glass-hover group relative h-[76px] w-[148px] flex-shrink-0 rounded-xl sm:w-[160px]">
      <Link
        href={href}
        // The lobby's own browser does the filtering, so this is a query
        // change on the page already open — no server render, no scroll jump.
        shallow
        scroll={false}
        title={`${provider.name} · ${provider.game_count}`}
        className="flex h-full w-full items-center justify-center px-5 text-center"
      >
        {showLogo ? (
          <img
            src={provider.logo_url ?? undefined}
            alt={provider.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="max-h-[34px] max-w-full object-contain opacity-70 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <span className="line-clamp-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-white/60 transition-colors group-hover:text-white">
            {provider.name}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        title={`${t('nav.favourites')} — ${t('common.soon')}`}
        aria-label={`${provider.name} — ${t('nav.favourites')}`}
        className={`absolute right-1.5 top-1.5 inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] transition-colors ${
          liked ? 'text-[#ef4462]' : 'text-white/35 hover:text-white'
        }`}
      >
        <HeartIcon size={13} className={liked ? 'fill-current' : undefined} />
      </button>
    </div>
  );
};

interface Props {
  /** Curated in the admin console, already filtered and ordered by the API. */
  providers: LobbyProvider[];
  /** The lobby route — plates filter the browser on the page they are on. */
  basePath: string;
  /** The page's shelf query, kept so a filter does not reset shelf paging. */
  query: Record<string, string>;
}

/**
 * The lobby's Providers row, managed from the admin console's Providers
 * screen: which studios appear, in what order, and with which logo.
 *
 * It used to be derived from the `provider` text on whichever games the page
 * had loaded, so it could not be ordered or given artwork, and each plate
 * linked to /games/slots?provider=… — a page that ignores `provider`, so the
 * click opened every slot rather than that studio's games. A plate now opens
 * the lobby's own game browser with that provider selected, which searches
 * every category.
 */
const ProviderRow: FC<Props> = ({ providers, basePath, query }) => {
  const { t } = useTranslation();

  if (providers.length === 0) {
    return null;
  }

  return (
    <ScrollShelf title={t('dash.providers')}>
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          href={{
            pathname: basePath,
            query: { ...query, provider: provider.name },
            hash: BROWSE_ANCHOR,
          }}
        />
      ))}
    </ScrollShelf>
  );
};

export default ProviderRow;
