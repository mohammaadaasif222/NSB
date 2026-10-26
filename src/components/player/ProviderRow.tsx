import { useState, type CSSProperties, type FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { useFavourites } from '@/context/FavouritesContext';
import FavouriteHeart from '@/components/player/FavouriteHeart';
import ScrollShelf from '@/components/player/ScrollShelf';
import { PROVIDERS_PATH, providerHref } from '@/constants/games';
import type { TranslationKey } from '@/i18n/locales';
import type { LobbyProvider } from '@/types';
import { getImageProps, type StaticImageData } from 'next/image';
import pragmaticPlay from '@/assets/providers/pragmatic-play.svg';
import evolution from '@/assets/providers/evolution.svg';
import relaxGaming from '@/assets/providers/relax-gaming.svg';
import bgaming from '@/assets/providers/bgaming.svg';
import hacksawGaming from '@/assets/providers/hacksaw-gaming.svg';
import thunderkick from '@/assets/providers/thunderkick.svg';
import nolimitCity from '@/assets/providers/nolimit-city.svg';
import { ROLLUCK_LOGO as rolluck } from '@/constants/cdn';

/**
 * The design's own studio logos, keyed by provider slug — the fallback when
 * the admin console has not set a `logo_url` for a studio. A logo set there
 * always wins; a studio with neither shows its name.
 */
const BUNDLED_LOGOS: Record<string, StaticImageData> = {
  'pragmatic-play': pragmaticPlay,
  evolution,
  'relax-gaming': relaxGaming,
  bgaming,
  'hacksaw-gaming': hacksawGaming,
  thunderkick,
  'nolimit-city': nolimitCity,
  'rolluck-originals': rolluck,
};

/**
 * One studio's plate: its logo, or its name when it has none or the image
 * fails to load — a broken-image icon on a lobby plate reads as a broken site.
 * The design's glass plate, 103px tall, with the favourite heart inset in its
 * top-right corner.
 */
/**
 * A logo's box: every mark fitted into the same 130×78 frame, which is how
 * the design sizes them — the wide wordmarks (Evolution, Hacksaw, Nolimit)
 * all run 130px across, the stacked Pragmatic badge as well, and the tall
 * Thunderkick shield stands 78px high. One rule, so every studio reads the
 * same size, uploaded logos included.
 *
 * Sized in `--logo-w`, the frame's width as a share of the plate (`cqw`): the
 * design gives it 130 of 198px on desktop and 102 of 122px on a phone, so the
 * plate sets the variable per breakpoint and this returns fractions of it.
 */
const LOGO_W = 130; // the frame, in design px on the 198px plate
const LOGO_H = 78;

const logoBox = (ratio: number): CSSProperties => {
  let w = LOGO_W;
  let h = w / ratio;
  if (h > LOGO_H) {
    h = LOGO_H;
    w = h * ratio;
  }
  return {
    width: `calc(var(--logo-w) * ${+(w / LOGO_W).toFixed(4)})`,
    height: `calc(var(--logo-w) * ${+(h / LOGO_W).toFixed(4)})`,
  };
};

export const ProviderCard: FC<{ provider: LobbyProvider }> = ({ provider }) => {
  const { isFavouriteProvider, toggleProvider } = useFavourites();
  const [broken, setBroken] = useState(false);
  const bundled = BUNDLED_LOGOS[provider.slug];
  const bundledSrc = bundled
    ? getImageProps({
        src: bundled,
        alt: '',
        width: 320,
        height: Math.round((320 * bundled.height) / bundled.width),
      }).props.src
    : null;
  const logo = provider.logo_url || bundledSrc || null;
  const showLogo = !!logo && !broken;
  // Known up front for a bundled mark; read from the image once an uploaded
  // one loads.
  const [ratio, setRatio] = useState<number | null>(
    !provider.logo_url && bundled ? bundled.width / bundled.height : null
  );

  return (
    <div className="group @container relative h-[calc(var(--u)*103)] [--logo-w:83.6cqw] lg:[--logo-w:65.7cqw]">
      <Link
        href={providerHref(provider.slug)}
        title={`${provider.name} · ${provider.game_count}`}
        className="rl-liquid-glow flex h-full w-full items-center justify-center rounded-[calc(var(--u)*24)] px-[calc(var(--u)*10)] text-center transition-colors hover:bg-white/[0.11] focus:outline-none focus-visible:bg-white/[0.11] lg:justify-start lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*22)] lg:text-start"
      >
        {showLogo ? (
          <img
            src={logo ?? undefined}
            alt={provider.name}
            loading="lazy"
            onError={() => setBroken(true)}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
            style={ratio ? logoBox(ratio) : undefined}
            className={`object-contain ${ratio ? '' : 'max-h-[calc(var(--logo-w)*0.6)] max-w-[var(--logo-w)]'}`}
          />
        ) : (
          <span className="line-clamp-2 text-[length:max(min(11px,13px),calc(var(--u)*13))] font-semibold uppercase tracking-[0.06em] text-[#f0f1f5] lg:text-[length:max(min(11px,15px),calc(var(--u)*15))]">
            {provider.name}
          </span>
        )}
      </Link>

      <FavouriteHeart
        liked={isFavouriteProvider(provider.id)}
        onToggle={() => toggleProvider(provider)}
        label={provider.name}
        className="right-[calc(var(--u)*6)] top-[calc(var(--u)*6)] h-[calc(var(--u)*32)] w-[calc(var(--u)*32)] lg:right-[calc(var(--u)*10)] lg:top-[calc(var(--u)*10)]"
      />
    </div>
  );
};

interface Props {
  /** Curated in the admin console, already filtered and ordered by the API. */
  providers: LobbyProvider[];
  /** The heading. The lobby's own row says "Provider". */
  titleKey?: TranslationKey;
  /**
   * Offer "View all". Off where the row is already the whole of what it
   * lists: the player's favourites.
   */
  viewAll?: boolean;
}

/**
 * A row of studio plates. In the lobby it is the Providers row, managed from
 * the admin console's Providers screen: which studios appear, in what order,
 * and with which logo. The Favourites page draws the player's hearted
 * studios with the same row.
 *
 * It used to be derived from the `provider` text on whichever games the page
 * had loaded, so it could not be ordered or given artwork, and each plate
 * linked to /games/slots?provider=… — a page that ignores `provider`, so the
 * click opened every slot rather than that studio's games.
 */
const ProviderRow: FC<Props> = ({ providers, titleKey = 'dash.providers', viewAll = true }) => {
  const { t } = useTranslation();

  if (providers.length === 0) {
    return null;
  }

  return (
    <ScrollShelf title={t(titleKey)} href={viewAll ? PROVIDERS_PATH : undefined} paged>
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </ScrollShelf>
  );
};

export default ProviderRow;
