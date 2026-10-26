import { useId, useMemo, useState, type FC, type PointerEvent } from 'react';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  /** Running profit after each round, oldest first, as exact decimal strings. */
  points: string[];
  /** Rounds played before the first point — the chart shows the most recent only. */
  skipped: number;
  /** Formats a running-profit value for the hover readout. */
  format: (value: string) => string;
}

/* Gain and loss on the panel's dark glass — validated as a pair for colour-
   vision deficiency and contrast against it. Never the only cue: a value's
   side of the zero line, and the signed readout, say the same thing. */
const GAIN = '#0d9668';
const LOSS = '#ef4444';

const WIDTH = 240;
const HEIGHT = 76;
const PAD_Y = 6;

/**
 * Running profit over the player's recent rounds: one 2px line from zero,
 * green above the zero line and red below it, with a crosshair readout under
 * the pointer. Drawn in a stretched viewBox, so the stroke is kept from
 * scaling and the markers are HTML laid over it.
 */
const ProfitChart: FC<Props> = ({ points, skipped, format }) => {
  const { t } = useTranslation();
  const id = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);

  // A whole session's line starts at zero, before its first round. A trimmed
  // one starts at its first point: zero would draw a jump that never happened.
  const whole = skipped === 0;
  const values = useMemo(
    () => (whole ? [0, ...points.map(Number)] : points.map(Number)),
    [points, whole]
  );
  /** The round a value belongs to, counted from the start of the session. */
  const roundOf = (index: number): number => (whole ? index : skipped + index + 1);

  const geometry = useMemo(() => {
    const max = Math.max(0, ...values);
    const min = Math.min(0, ...values);
    const span = max - min || 1;
    const y = (v: number): number => PAD_Y + ((max - v) / span) * (HEIGHT - PAD_Y * 2);
    const x = (i: number): number => (values.length < 2 ? 0 : (i / (values.length - 1)) * WIDTH);
    const coords = values.map((v, i) => [x(i), y(v)] as const);
    const line = coords.map(([cx, cy], i) => `${i ? 'L' : 'M'}${cx},${cy}`).join(' ');
    const zero = y(0);
    const area = `${line} L${WIDTH},${zero} L0,${zero} Z`;
    return { coords, line, area, zero };
  }, [values]);

  const onMove = (event: PointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (values.length - 1)));
  };

  const zeroStop = `${(geometry.zero / HEIGHT) * 100}%`;
  const active = hover === null ? null : geometry.coords[hover];

  return (
    <figure className="m-0">
      <div
        className="relative h-[76px] w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={t('game.stats.chart', { count: String(points.length) })}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* A hard switch at the zero line: the colour says which side. */}
            <linearGradient
              id={`pl-${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2={HEIGHT}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={zeroStop} stopColor={GAIN} />
              <stop offset={zeroStop} stopColor={LOSS} />
            </linearGradient>
          </defs>
          <path d={geometry.area} fill={`url(#pl-${id})`} opacity={0.14} />
          <line
            x1={0}
            x2={WIDTH}
            y1={geometry.zero}
            y2={geometry.zero}
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={geometry.line}
            fill="none"
            stroke={`url(#pl-${id})`}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {active && hover !== null && (
          <>
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-white/25"
              style={{ left: `${(active[0] / WIDTH) * 100}%` }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#111317]"
              style={{
                left: `${(active[0] / WIDTH) * 100}%`,
                top: `${(active[1] / HEIGHT) * 100}%`,
                background: values[hover] < 0 ? LOSS : GAIN,
              }}
              aria-hidden="true"
            />
            <span
              className={`pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded-md bg-[#0b0c0f] px-2 py-1 text-[11px] font-medium text-white shadow-lg ring-1 ring-white/10 tabular-nums ${
                active[0] / WIDTH > 0.5 ? '-translate-x-full' : ''
              }`}
              style={{ left: `${(active[0] / WIDTH) * 100}%` }}
            >
              <span className="text-white/60">
                {roundOf(hover) === 0
                  ? t('game.stats.start')
                  : t('game.stats.round', { n: String(roundOf(hover)) })}
              </span>{' '}
              {format(String(values[hover]))}
            </span>
          </>
        )}
      </div>
    </figure>
  );
};

export default ProfitChart;
