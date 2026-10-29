import { useEffect, useId, useRef, useState, type FC, type ReactNode, type Ref } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game, GameMode, GameVolatility } from '@/types';
import type { TranslationKey } from '@/i18n/locales';
import { gameHref, playHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { useGameImpression } from '@/hooks/useGameImpression';
import { trackGameOpen } from '@/utils/events';
import FavouriteHeart from '@/components/player/FavouriteHeart';
import { useFavourites } from '@/context/FavouritesContext';
import { useJackpots } from '@/hooks/useJackpots';
import personIcon from '@/assets/lobby/person.svg';
import { featureKeys, maxWinLabel } from '@/utils/gameFacts';

interface Props {
  game: Game;
  /**
   * Fixed-width tile for a horizontally scrolling shelf. When false the tile
   * fills its parent (grid cell).
   */
  shelf?: boolean;
  /**
   * Which shelf or page this tile was rendered in, recorded alongside the
   * impression and the open.
   *
   * Without it "this game was shown 4,000 times" cannot be read: a game on
   * every shelf and a game on one busy shelf produce the same number. Optional
   * so a tile rendered outside a known surface still tracks, just unattributed.
   */
  surface?: string;
  /**
   * Picker mode (Select Game): the tile chooses rather than opens, and the
   * chosen one wears the design's gold glow with Play and Play DEMO over its
   * blurred art.
   */
  onSelect?: () => void;
  selected?: boolean;
  /**
   * When set, Play and Play DEMO on the chosen tile call this with the game
   * and mode instead of navigating to /play/[slug]. Lets the lobby's
   * featured card swap in a game iframe in place rather than leave the home
   * page.
   */
  onPlayInline?: (game: Game, mode: GameMode) => void;
}

/**
 * The "N playing" figure on a tile.
 *
 * There is no concurrency feed, so this is derived from the game's own id
 * rather than fetched — illustrative chrome, like the winners strip and the
 * hero's totals. It is a pure function of the id on purpose: a random number
 * would differ between the server render and hydration and trip React's
 * mismatch warning, and would jitter on every navigation.
 */
const playersOn = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 120 + (hash % 3200);
};

/*
 * Every measurement below is the design's 198px-wide card expressed in `cqw`
 * (1cqw = 1.98px at that width), so the whole tile — badge, pills, heart —
 * scales as one piece from the phone shelf to the desktop's 198px. Text sizes
 * keep a floor so they stay legible on the smallest tiles.
 *
 * `cqw` resolves against the nearest ancestor with a `container-type`, which
 * is the `group` div below.
 */

/** A frosted pill along the tile's foot: 19px tall, 10px text at 198px. */
const FootPill: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex h-[9.6cqw] items-center gap-[1.52cqw] rounded-full border border-white/30 bg-white/20 px-[4.55cqw] text-[max(7px,5.05cqw)] leading-none tabular-nums text-[#f0f1f5] shadow-[0_0_15px_rgba(0,0,0,0.36)]">
    {children}
  </span>
);

/**
 * The chosen tile's face in the picker, as the design draws it: the art
 * blurred under a slate veil, the name and studio, the gold play button (real
 * money) and the Play DEMO pill. In the card's own shape and `cqw` units.
 */
const PickedVeil: FC<{
  game: Game;
  surface?: string;
  onPlayInline?: (game: Game, mode: GameMode) => void;
}> = ({ game, surface, onPlayInline }) => {
  const { t } = useTranslation();
  const open = (): void => trackGameOpen(game.slug, surface);

  // When the lobby's featured card wants to host the game itself, Play and
  // Play DEMO become buttons that bubble the choice up — no navigation.
  const inline = (mode: GameMode) => (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    open();
    onPlayInline?.(game, mode);
  };

  const playCommonClass =
    'absolute left-1/2 top-[61.6cqw] flex h-[31.3cqw] w-[31.3cqw] -translate-x-1/2 items-center justify-center rounded-full bg-[#f9d028] transition-[filter] hover:brightness-110';
  const demoCommonClass =
    'absolute left-1/2 top-[103cqw] flex h-[15.15cqw] w-[46.5cqw] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full bg-[#f0f1f5] text-[max(8px,6.06cqw)] font-medium text-[#07080a] transition-colors hover:bg-white';

  return (
    <div className="rl-card-shape absolute inset-0 bg-[rgba(50,48,48,0.61)] text-center backdrop-blur-md">
      <p className="absolute inset-x-[5.05cqw] top-[24.75cqw] truncate text-[max(12px,10.1cqw)] font-bold uppercase leading-[14.14cqw] text-[#f4fffb]">
        {game.title}
      </p>
      <p className="absolute inset-x-[5.05cqw] top-[40.9cqw] truncate text-[max(8px,5.05cqw)] leading-[6.57cqw] text-[#f0f1f5]">
        {game.provider}
      </p>
      {onPlayInline ? (
        <button
          type="button"
          onClick={inline('REAL')}
          aria-label={`${t('lobby.selectGame.play')} — ${game.title}`}
          className={playCommonClass}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="ml-[1.5cqw] h-[45%] w-[45%] fill-[#07080a]"
          >
            <path d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5Z" />
          </svg>
        </button>
      ) : (
        <Link
          href={playHref(game.slug)}
          onClick={open}
          aria-label={`${t('lobby.selectGame.play')} — ${game.title}`}
          className={playCommonClass}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="ml-[1.5cqw] h-[45%] w-[45%] fill-[#07080a]"
          >
            <path d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5Z" />
          </svg>
        </Link>
      )}
      {onPlayInline ? (
        <button type="button" onClick={inline('DEMO')} className={demoCommonClass}>
          {t('lobby.selectGame.demo')}
        </button>
      ) : (
        <Link href={playHref(game.slug, 'DEMO')} onClick={open} className={demoCommonClass}>
          {t('lobby.selectGame.demo')}
        </Link>
      )}
    </div>
  );
};

const VOLATILITY_KEY: Record<GameVolatility, TranslationKey> = {
  LOW: 'game.vol.LOW',
  LOW_MED: 'game.vol.LOW_MED',
  MED: 'game.vol.MED',
  MED_HIGH: 'game.vol.MED_HIGH',
  HIGH: 'game.vol.HIGH',
};

/** The bet limits as one figure — "0.1 – 100 USD" — or null when the game publishes neither. */
const betLimits = (game: Game): string | null => {
  if (game.min_bet === null && game.max_bet === null) return null;
  const limit = (value: number | null): string => (value === null ? '—' : String(value));
  const currency = game.bet_currency ? ` ${game.bet_currency}` : '';
  return `${limit(game.min_bet)} – ${limit(game.max_bet)}${currency}`;
};

/**
 * The tile's info face: what a player wants before opening a game — studio,
 * RTP, volatility, genre, bet limits — over the art, in the card's own shape,
 * so it can be read without leaving the lobby. Synced games do not always
 * carry every figure; a row the game has no value for is left out rather
 * than shown as a dash. "Full details" goes on to the game's page.
 *
 * The title keeps clear of the notch, where the heart still sits on top.
 */
const InfoFace: FC<{ game: Game; id: string; surface?: string }> = ({ game, id, surface }) => {
  const { t } = useTranslation();

  const rows: { label: string; value: string }[] = [
    { label: t('game.provider'), value: game.provider },
  ];
  if (game.rtp !== null) rows.push({ label: t('game.rtp'), value: `${game.rtp}%` });
  if (game.volatility) {
    rows.push({ label: t('game.volatility'), value: t(VOLATILITY_KEY[game.volatility]) });
  }
  const maxWin = maxWinLabel(game);
  if (maxWin) rows.push({ label: t('game.maxWin'), value: maxWin });
  const limits = betLimits(game);
  if (limits) rows.push({ label: t('game.betLimits'), value: limits });
  // The genre only while there is room; the features below say more.
  const features = featureKeys(game);
  if (game.genre && rows.length < 5 && features.length === 0) {
    rows.push({ label: t('game.genre'), value: game.genre });
  }

  return (
    <div
      id={id}
      role="group"
      aria-label={t('game.info')}
      className="rl-card-shape absolute inset-0 flex flex-col bg-[rgba(10,11,13,0.84)] px-[6.06cqw] pb-[5.05cqw] pt-[7.07cqw] text-start backdrop-blur-md"
    >
      <p className="truncate pe-[17cqw] text-[max(10px,7.07cqw)] font-semibold leading-[1.25] text-[#f0f1f5]">
        {game.title}
      </p>
      <dl className="mt-[4.04cqw] flex flex-col gap-[2.53cqw]">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-[3.03cqw]">
            <dt className="shrink-0 text-[max(8px,5.05cqw)] leading-[1.3] text-[#9da2b4]">
              {label}
            </dt>
            <dd className="min-w-0 truncate text-end text-[max(8px,5.56cqw)] font-medium leading-[1.3] text-[#f0f1f5]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {features.length > 0 && (
        <ul aria-label={t('game.features')} className="mt-[3.54cqw] flex flex-wrap gap-[2.02cqw]">
          {features.map((key) => (
            <li
              key={key}
              className="rounded-full border border-[#f9d028]/40 px-[3.03cqw] py-[0.76cqw] text-[max(8px,4.8cqw)] font-medium leading-[1.3] text-[#f9d028]"
            >
              {t(key)}
            </li>
          ))}
        </ul>
      )}
      {/* Leaves the bottom-end corner to the close control. */}
      <Link
        href={gameHref(game.slug)}
        onClick={() => trackGameOpen(game.slug, surface)}
        className="me-[calc(max(20px,12.12cqw)+3.03cqw)] mt-auto flex h-[max(20px,12.12cqw)] items-center justify-center rounded-full bg-[#f9d028] text-[max(8px,6.06cqw)] font-medium text-[#07080a] transition-[filter] hover:brightness-110"
      >
        {t('game.details')}
      </Link>
    </div>
  );
};

/**
 * The small round "i" that opens the info face — in the tile's bottom-end
 * corner, just above the foot pills, where it reads as part of the card's
 * chrome rather than the artwork's. Once open it drops to the bottom row and
 * turns into the close control, beside "Full details".
 */
const InfoButton: FC<{
  open: boolean;
  controls: string;
  onToggle: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}> = ({ open, controls, onToggle, buttonRef }) => {
  const { t } = useTranslation();
  const label = t(open ? 'game.closeInfo' : 'game.info');

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={open ? controls : undefined}
      aria-label={label}
      title={label}
      className={`absolute end-[5.05cqw] flex h-[max(20px,12.12cqw)] w-[max(20px,12.12cqw)] items-center justify-center rounded-full border border-white/25 bg-black/45 text-[#f0f1f5] backdrop-blur-sm transition-[background-color,bottom] duration-150 hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        open ? 'bottom-[5.05cqw]' : 'bottom-[17.68cqw]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[60%] w-[60%]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={2.4}
      >
        {open ? (
          <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />
        ) : (
          <>
            <path d="M12 11v6.5" />
            <circle cx="12" cy="7" r="1.4" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </button>
  );
};

/**
 * The card's silhouette — the same path as the `rl-card-shape` mask in
 * index.css (198 × 261, 23px corners, the notch for the heart). Kept in step
 * with it by hand: change one, change both.
 */
const CARD_PATH =
  'M141.357 0C151.851 0 160.357 8.59637 160.357 19.0898C160.357 29.4845 168.784 38 179.179 38C189.573 38 198 46.4266 198 56.8213L198 238C198 250.703 187.703 261 175 261L23 261C10.2975 261 0 250.703 0 238L0 23C0 10.2975 10.2975 0 23 0L141.357 0Z';

/**
 * The chosen tile's rim: the design draws a light hairline round the whole
 * notched shape, inside the gold bloom. A border or inset shadow would follow
 * a rectangle and miss the notch, so it is the silhouette stroked. A crisp 1px
 * line at half white, as measured — any wider or brighter and it picks up the
 * veil's colour and reads as a tinted band rather than a highlight.
 */
const PickedRim: FC = () => (
  <svg
    viewBox="0 0 198 261"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
  >
    <path
      d={CARD_PATH}
      fill="none"
      stroke="rgba(255, 255, 255, 0.5)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/**
 * One game: the artwork in the design's notched card (`rl-card-shape` — 23px
 * corners and the step bitten out of the top-right), a "New" badge, the
 * players and RTP pills along its foot, and a favourite heart sitting in the
 * notch. Without the notch the heart lands on the artwork and is lost in it,
 * which is why the shape is not a plain rounded rectangle.
 *
 * The tile fills whatever width its parent gives it — a shelf track or a grid
 * cell — and keeps the design's 198:261 shape.
 *
 * The catalogue's artwork already carries the game's name and studio, so
 * neither is drawn again; the title rides on the image's `alt` and the link's
 * tooltip.
 */
const GameTile: FC<Props> = ({
  game,
  shelf = false,
  surface,
  onSelect,
  selected = false,
  onPlayInline,
}) => {
  const { t } = useTranslation();
  const { isFavourite, toggle } = useFavourites();
  // In a winnable provider jackpot, linked through our own game ids.
  const jackpot = useJackpots().gameIds.has(game.id);

  const impressionRef = useGameImpression(game.slug, surface);

  // The info face: closed by its own button, by Escape (focus back on the
  // button), or by a press anywhere outside this tile.
  const [infoOpen, setInfoOpen] = useState(false);
  const infoId = useId();
  const tileRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!infoOpen) return undefined;
    const onPointerDown = (e: PointerEvent): void => {
      if (!tileRef.current?.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      setInfoOpen(false);
      infoButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [infoOpen]);

  const art = (
    <div className="relative aspect-[198/261] overflow-hidden bg-[#333333]">
      <Image
        src={game.image_url || '/images/placeholder.png'}
        alt={game.title}
        fill
        sizes={
          shelf
            ? '(max-width: 640px) 112px, 130px'
            : '(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 200px'
        }
        className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
      />

      {/* The design's foot shade: clear to 66% black over the last 92px. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35.25%] bg-gradient-to-b from-transparent to-black/[0.66]"
      />

      {game.is_new && (
        <span className="absolute left-[5.05cqw] top-[5.05cqw] flex h-[12.12cqw] items-center rounded-full bg-[#f9d028] px-[5.05cqw] text-[max(8px,6.06cqw)] font-medium leading-none text-[#07080a]">
          {t('game.new')}
        </span>
      )}

      {jackpot && (
        <span
          className={`absolute left-[5.05cqw] flex h-[12.12cqw] items-center rounded-full border border-[#f9d028]/70 bg-black/60 px-[5.05cqw] text-[max(8px,6.06cqw)] font-medium leading-none text-[#f9d028] backdrop-blur-sm ${
            game.is_new ? 'top-[19.7cqw]' : 'top-[5.05cqw]'
          }`}
        >
          {t('lobby.jackpots.badge')}
        </span>
      )}

      <span className="absolute inset-x-[5.05cqw] bottom-[5.05cqw] flex items-center justify-between gap-1">
        <FootPill>
          <img src={personIcon.src} alt="" className="h-[6.06cqw] w-[6.06cqw]" />
          {playersOn(game.id)}
        </FootPill>
        <FootPill>
          {t('game.rtp')}: {game.rtp}
        </FootPill>
      </span>
    </div>
  );

  return (
    <div ref={impressionRef} className={shelf ? 'w-[112px] flex-shrink-0 sm:w-[130px]' : 'w-full'}>
      <div
        ref={tileRef}
        className={`group relative [container-type:inline-size] ${
          selected
            ? // The design's bloom: about half gold at the card's edge, fading
              // out ~25px away — one soft shadow, not a wide haze.
              'drop-shadow-[0_0_14px_rgba(249,208,40,0.95)]'
            : ''
        }`}
      >
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            title={`${game.title} — ${game.provider}`}
            className="rl-card-shape block w-full text-left focus:outline-none focus-visible:brightness-110"
          >
            {art}
          </button>
        ) : (
          <Link
            href={gameHref(game.slug)}
            // Recorded on click rather than on the game page's own mount: this is
            // the only point that knows WHICH shelf the player came from, and
            // that is half of what makes the impression figure readable.
            onClick={() => trackGameOpen(game.slug, surface)}
            title={`${game.title} — ${game.provider} · ${t('game.rtp')} ${game.rtp}`}
            className="rl-card-shape block text-left focus:outline-none focus-visible:brightness-110"
          >
            {art}
          </Link>
        )}

        {onSelect && selected && (
          <PickedVeil game={game} surface={surface} onPlayInline={onPlayInline} />
        )}
        {onSelect && selected && <PickedRim />}

        {/* Not in the picker: there the chosen tile carries Play instead. */}
        {!onSelect && infoOpen && <InfoFace game={game} id={infoId} surface={surface} />}

        {/* Outside the Link so it is its own control rather than a button
            nested in an anchor. The design's 32px heart box, in the notch, hung
            a pixel past the card's right edge. */}
        <FavouriteHeart
          liked={isFavourite(game.id)}
          onToggle={() => toggle(game)}
          label={game.title}
          className="-right-[0.5cqw] top-0 h-[16.16cqw] w-[16.16cqw]"
        />

        {!onSelect && (
          <InfoButton
            open={infoOpen}
            controls={infoId}
            onToggle={() => setInfoOpen((v) => !v)}
            buttonRef={infoButtonRef}
          />
        )}
      </div>
    </div>
  );
};

export default GameTile;
