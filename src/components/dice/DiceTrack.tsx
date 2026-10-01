import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import type { DiceCondition } from '@/types';

interface Props {
  target: number;
  condition: DiceCondition;
  /** The target range the current win-chance limits allow. */
  minTarget: number;
  maxTarget: number;
  /** The last roll, or null before the first. */
  roll: number | null;
  won: boolean;
  disabled: boolean;
  onTargetChange: (target: number) => void;
}

const WIN_COLOR = '#10b981';
const LOSE_COLOR = '#ef4444';

const TICKS = [0, 25, 50, 75, 100];

/**
 * The 0–100 track: the losing side red, the winning side green, a handle to
 * drag the target, and a marker that slides to each roll.
 *
 * The handle is a native range input made invisible over the track, so drag,
 * touch and arrow keys all work without custom pointer handling; what shows is
 * a drawn thumb at the exact target (the input itself moves in whole numbers,
 * and the fields below take hundredths).
 */
const DiceTrack: FC<Props> = ({
  target,
  condition,
  minTarget,
  maxTarget,
  roll,
  won,
  disabled,
  onTargetChange,
}) => {
  const { t } = useTranslation();

  const [left, right] = condition === 'OVER' ? [LOSE_COLOR, WIN_COLOR] : [WIN_COLOR, LOSE_COLOR];
  const split = `${target}%`;

  return (
    <div className="px-5 pb-3 pt-14 sm:px-8">
      <div className="relative">
        {roll !== null && (
          <div
            className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 transition-[left] duration-300 ease-out"
            style={{ left: `${roll}%` }}
          >
            <span
              className={`block rounded-lg px-2.5 py-1 text-sm font-extrabold tabular-nums shadow-lg ${
                won ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
              }`}
            >
              {roll.toFixed(2)}
            </span>
            <span
              className={`mx-auto block h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent ${
                won ? 'border-t-emerald-500' : 'border-t-red-500'
              }`}
              aria-hidden="true"
            />
          </div>
        )}

        <div className="relative h-9">
          <div
            className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(to right, ${left} 0%, ${left} ${split}, ${right} ${split}, ${right} 100%)`,
            }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={Math.ceil(minTarget)}
            max={Math.floor(maxTarget)}
            step={1}
            value={Math.round(target)}
            disabled={disabled}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            aria-label={t('dice.target')}
            aria-valuetext={target.toFixed(2)}
            className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span
            className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-white/80 bg-blue-500 shadow-lg peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 peer-disabled:opacity-60"
            style={{ left: split }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative mt-1 h-4 text-[11px] text-slate-500 tabular-nums" aria-hidden="true">
        {TICKS.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${tick}%` }}>
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DiceTrack;
