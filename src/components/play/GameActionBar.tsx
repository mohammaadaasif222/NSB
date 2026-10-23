import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import {
  ChartIcon,
  CloseIcon,
  HeartIcon,
  MaximizeIcon,
  MinimizeIcon,
  PopoutIcon,
} from '@/components/icons';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { useTranslation } from '@/context/I18nContext';
import type { GameMode } from '@/types';

interface Props {
  title: string;
  provider: string;
  /** Where the close button goes. */
  backHref: string;
  /** "Plays in EUR" — shown once a real-money launch says which currency. */
  currencyNote: string | null;
  mode: GameMode;
  /** Null when the game has no demo, so there is nothing to switch to. */
  onSwitchMode: ((mode: GameMode) => void) | null;
  favourite: boolean;
  onFavourite: () => void;
  statsOpen: boolean;
  onStats: () => void;
  fullscreen: boolean;
  /** Null until there is a running game to fill the screen with. */
  onFullscreen: (() => void) | null;
  /** Null where a pop-out is not possible (a phone) — the button is left out. */
  onPopout: (() => void) | null;
  popoutActive: boolean;
}

/**
 * One icon control in the bar: a round glass button that lights gold when its
 * feature is on. Icon-only, so the label is its accessible name and tooltip.
 */
const Action: FC<{
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  children: ReactNode;
}> = ({ label, onClick, pressed, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    className={`rl-glass-btn inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fcd535]/60 disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10 ${
      pressed ? 'text-[#fcd535]' : 'text-white/75 hover:text-white'
    }`}
  >
    {children}
  </button>
);

/**
 * The bar under a running game: what is playing, the player's controls for
 * it, and the Demo / Real switch.
 *
 * Every control degrades on its own — a game with no demo shows its mode
 * instead of a switch, a phone has no pop-out, a game still loading cannot go
 * full screen — so a missing feature never takes the rest of the bar with it.
 */
const GameActionBar: FC<Props> = ({
  title,
  provider,
  backHref,
  currencyNote,
  mode,
  onSwitchMode,
  favourite,
  onFavourite,
  statsOpen,
  onStats,
  fullscreen,
  onFullscreen,
  onPopout,
  popoutActive,
}) => {
  const { t } = useTranslation();
  const real = mode === 'REAL';

  return (
    <div className="rl-glass flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-2.5 py-2 sm:px-3">
      <div className="flex min-w-0 flex-1 basis-48 items-center gap-2.5">
        <Link
          href={backHref}
          aria-label={t('game.backToLobby')}
          title={t('game.backToLobby')}
          className="rl-glass-btn inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white/75 hover:text-white sm:h-10 sm:w-10"
        >
          <CloseIcon size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h1>
          <p className="truncate text-xs text-white/50">
            {provider}
            {currencyNote && <span className="text-white/35"> · {currencyNote}</span>}
          </p>
        </div>
      </div>

      <div
        className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2"
        role="toolbar"
        aria-label={t('game.actions')}
      >
        <Action
          label={t(favourite ? 'favourites.remove' : 'favourites.add')}
          onClick={onFavourite}
          pressed={favourite}
        >
          <HeartIcon
            size={17}
            className={favourite ? 'fill-[#E33827] text-[#E33827]' : undefined}
          />
        </Action>
        <Action label={t('game.stats.title')} onClick={onStats} pressed={statsOpen}>
          <ChartIcon size={17} />
        </Action>
        {onPopout && (
          <Action label={t('game.popout')} onClick={onPopout} pressed={popoutActive}>
            <PopoutIcon size={16} />
          </Action>
        )}
        <Action
          label={t(fullscreen ? 'game.exitFullscreen' : 'game.fullscreen')}
          onClick={() => onFullscreen?.()}
          disabled={!onFullscreen}
        >
          {fullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
        </Action>

        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />

        {onSwitchMode ? (
          <div className="flex items-center gap-2 ps-1 text-xs font-medium">
            <span className={real ? 'text-white/45' : 'text-white'} aria-hidden="true">
              {t('game.demo')}
            </span>
            <ToggleSwitch
              enabled={real}
              onToggle={() => onSwitchMode(real ? 'DEMO' : 'REAL')}
              label={t('game.realMoney')}
            />
            <span className={real ? 'text-white' : 'text-white/45'} aria-hidden="true">
              {t('game.real')}
            </span>
          </div>
        ) : (
          <span
            className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
            title={real ? t('game.noDemo') : undefined}
          >
            {real ? t('game.realMoney') : t('game.demo')}
          </span>
        )}
      </div>
    </div>
  );
};

export default GameActionBar;
