import { useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
import { ChartIcon, CloseIcon, RefreshCwIcon } from '@/components/icons';
import ProfitChart from '@/components/play/ProfitChart';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { useFloatingPanel } from '@/hooks/useFloatingPanel';
import type { LiveStatsScope, LiveStatsState } from '@/hooks/useLiveStats';

interface Props {
  state: LiveStatsState;
  scope: LiveStatsScope;
  onScope: (scope: LiveStatsScope) => void;
  onReset: () => void;
  onRetry: () => void;
  onClose: () => void;
  /**
   * Why there is nothing to show yet: DEMO play is never recorded, and a
   * signed-out visitor has no rounds. Null when the stats apply.
   */
  unavailable: 'demo' | null;
  /** Offered in DEMO, to move to real money; null when the game cannot. */
  onPlayReal: (() => void) | null;
}

/** The game frame the panel first opens beside. Set on the play page's frame. */
export const GAME_FRAME_SELECTOR = '[data-game-frame]';

const ICON_BTN =
  'inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fcd535]/60';

/**
 * Live Stats: the player's profit, wagered, wins and losses since they last
 * reset, with the running profit drawn underneath. Amounts arrive in USD and
 * show in the player's display currency, as the balance chip does.
 *
 * A window of its own over the page rather than part of the game frame: it
 * opens inset in the game's top-right corner, as Rainbet's does, and can be
 * dragged anywhere in the content column, clear of the header and the foot.
 * It is not shown while the game itself is full screen.
 */
const LiveStatsPanel: FC<Props> = ({
  state,
  scope,
  onScope,
  onReset,
  onRetry,
  onClose,
  unavailable,
  onPlayReal,
}) => {
  const { t } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const panelRef = useRef<HTMLElement>(null);
  const floating = useFloatingPanel(panelRef, 'rolluck:live-stats:position', GAME_FRAME_SELECTOR);

  /** A signed amount — the sign is the cue, never the colour alone. */
  const signed = (usd: string): string => {
    const value = Number(usd);
    const body = formatCurrencyDisplay(String(Math.abs(value)));
    return value > 0 ? `+${body}` : value < 0 ? `−${body}` : body;
  };

  const ready = state.status === 'ready' ? state.stats : null;

  if (!floating.host) {
    return null;
  }

  return createPortal(
    <section
      ref={panelRef}
      aria-label={t('game.stats.title')}
      // Over the page, under the header (z-30), its menus and every dialog.
      className="rl-menu z-20 flex w-[min(264px,calc(100vw-2rem))] flex-col gap-3 rounded-2xl p-3 text-white"
      style={floating.style}
    >
      <div
        className="flex cursor-grab touch-none select-none items-center gap-2"
        {...floating.handle}
      >
        <ChartIcon size={15} className="text-[#fcd535]" />
        <h2 className="flex-1 text-sm font-semibold">{t('game.stats.title')}</h2>
        {!unavailable && (
          <button
            type="button"
            onClick={onReset}
            className={ICON_BTN}
            aria-label={t('game.stats.reset')}
            title={t('game.stats.reset')}
          >
            <RefreshCwIcon size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className={ICON_BTN}
          aria-label={t('game.stats.close')}
          title={t('game.stats.close')}
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {unavailable ? (
        <div className="space-y-3 py-1 text-center">
          <p className="text-xs leading-relaxed text-white/60">{t('game.stats.realOnly')}</p>
          {onPlayReal && (
            <button
              type="button"
              onClick={onPlayReal}
              className="rl-chip-active inline-flex h-8 items-center px-4 text-xs font-semibold text-white"
            >
              {t('game.playReal')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label={t('game.stats.scope')}
            className="grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1"
          >
            {(['game', 'all'] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={scope === key}
                onClick={() => onScope(key)}
                className={`h-7 rounded-full text-xs font-medium transition-colors ${
                  scope === key ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white'
                }`}
              >
                {t(key === 'game' ? 'game.stats.thisGame' : 'game.stats.allGames')}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-black/30 px-2 py-2">
            {state.status === 'failed' ? (
              <div className="flex h-[76px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs text-white/60">{t('game.stats.failed')}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-xs font-semibold text-[#fcd535] hover:underline"
                >
                  {t('game.retry')}
                </button>
              </div>
            ) : !ready ? (
              <div className="h-[76px] animate-pulse rounded-lg bg-white/5" aria-busy="true" />
            ) : ready.points.length === 0 ? (
              <p className="flex h-[76px] items-center justify-center px-3 text-center text-xs text-white/50">
                {t('game.stats.empty')}
              </p>
            ) : (
              <ProfitChart
                points={ready.points}
                skipped={ready.rounds - ready.points.length}
                format={signed}
              />
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {[
              { label: t('game.stats.profit'), value: ready ? signed(ready.profit) : '—' },
              {
                label: t('game.stats.wagered'),
                value: ready ? formatCurrencyDisplay(ready.wagered) : '—',
              },
              { label: t('game.stats.wins'), value: ready ? String(ready.wins) : '—' },
              { label: t('game.stats.losses'), value: ready ? String(ready.losses) : '—' },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="text-[11px] text-white/50">{item.label}</dt>
                <dd className="truncate text-sm font-semibold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>,
    floating.host
  );
};

export default LiveStatsPanel;
