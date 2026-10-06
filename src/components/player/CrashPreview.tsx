import { useId, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { categoryHref } from '@/constants/games';
import chevronSmall from '@/assets/lobby/chevron-small.svg';
import clearIcon from '@/assets/lobby/clear-x.svg';

/**
 * A static preview of the Crash game for the lobby.
 *
 * There is no live round or websocket feed behind this yet — the curve, the
 * multiplier and the "playing" count are illustrative, and the panel is a
 * mock-up of the real betting UI rather than a working one. Placing a bet
 * routes through to the Originals shelf, where the real game lives once it
 * ships. English-only copy on purpose: this widget will be replaced wholesale
 * once the real game is wired up, so it isn't worth translating yet.
 */

/** Stands in for a price feed so the ≈USD line tracks the bet the user types. */
const USD_PER_BTC = 96_420;
/** Flat, like the design shows — a real fee would come from the chain. */
const NETWORK_FEE = 0.0000012;

/** Recent results; the design dims the ones that busted early. */
const HISTORY: { value: string; low: boolean }[] = [
  { value: '1.46x', low: false },
  { value: '2.41x', low: true },
  { value: '5.62x', low: false },
  { value: '1.94x', low: true },
  { value: '11.30x', low: false },
];

const btc = (value: number): string => value.toFixed(8);

const usd = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/* --- Chart --------------------------------------------------------------- */

/**
 * The run so far: the design's straight climb with its green wash beneath,
 * over a 20px grid. The phone and desktop charts are different shapes, so
 * each draws its own line in its own coordinates rather than one SVG being
 * stretched into both.
 */
const Curve: FC<{ viewBox: string; line: [number, number, number, number]; className: string }> = ({
  viewBox,
  line: [x1, y1, x2, y2],
  className,
}) => {
  const bottom = Number(viewBox.split(' ')[3]);
  const wash = useId();
  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={wash} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ed573" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2ed573" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${x1} ${y1}L${x2} ${y2}V${bottom}H${x1}Z`} fill={`url(#${wash})`} />
      <path
        d={`M${x1} ${y1}L${x2} ${y2}`}
        stroke="#2ed573"
        strokeWidth="4.56"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/** The design's grid: #252937 hairlines every 20.4px, at 30%. */
const GRID =
  'pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(#252937_1px,transparent_1px),linear-gradient(90deg,#252937_1px,transparent_1px)] [background-size:calc(var(--u)*20.4)_calc(var(--u)*20.4)]';

const Payout: FC<{ className: string }> = ({ className }) => (
  <div className={`pointer-events-none absolute ${className}`}>
    <p className="text-[length:max(min(11px,36px),calc(var(--u)*36))] font-bold leading-[calc(var(--u)*44)] tracking-[-0.02em] tabular-nums text-[#f0f1f5]">
      1.34x
    </p>
    <p className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4]">
      CURRENT PAYOUT
    </p>
  </div>
);

/* --- Bet slip pieces ----------------------------------------------------- */

const FieldLabel: FC<{ label: string; hint: string; strongHint?: boolean }> = ({
  label,
  hint,
  strongHint,
}) => (
  <div className="mb-[calc(var(--u)*7)] flex items-baseline justify-between gap-[calc(var(--u)*8)] text-[length:max(min(11px,14px),calc(var(--u)*14))] font-medium leading-[calc(var(--u)*20)]">
    <span className="text-[#6a7287]">{label}</span>
    <span className={strongHint ? 'text-[#f0f1f5]' : 'text-[#6a7287]'}>{hint}</span>
  </div>
);

/** A field in the design's clear glass pill. */
const Field: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rl-liquid flex h-[calc(var(--u)*56)] items-center gap-[calc(var(--u)*10)] rounded-[calc(var(--u)*34)] pl-[calc(var(--u)*17)] pr-[calc(var(--u)*17)] focus-within:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
    {children}
  </div>
);

const Chip: FC<{ title: string; onClick: () => void; children: ReactNode }> = ({
  title,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className="flex h-[calc(var(--u)*30)] min-w-[calc(var(--u)*30)] flex-shrink-0 items-center justify-center rounded-[calc(var(--u)*7.5)] border border-white/[0.07] px-[calc(var(--u)*9)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#6a7287] transition-colors hover:border-white/20 hover:text-white"
  >
    {children}
  </button>
);

const Summary: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-[calc(var(--u)*8)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)]">
    <span className="text-[#6a7287]">{label}</span>
    <span className="font-medium tabular-nums text-[#f0f1f5]">{value}</span>
  </div>
);

/* --- The panel ----------------------------------------------------------- */

/**
 * The design's crash card: the chart on the left of a dark glass panel and
 * the bet slip in a clear glass column down its right edge; on a phone the
 * slip drops below the chart.
 */
const CrashPreview: FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [betAmount, setBetAmount] = useState('0.00100000');
  const [autoCashout, setAutoCashout] = useState('2.00');

  const bet = Number.parseFloat(betAmount) || 0;
  const multiplier = Number.parseFloat(autoCashout) || 0;

  const scale = (factor: number): void => setBetAmount(btc(Math.max(0, bet * factor)));
  const play = (): void => {
    void router.push(categoryHref('originals'));
  };

  return (
    <section className="rl-glass-deep overflow-hidden rounded-[calc(var(--u)*34)] lg:grid lg:min-h-[calc(var(--u)*586)] lg:grid-cols-[minmax(0,1fr)_calc(var(--u)*385)]">
      {/* --- Chart side ------------------------------------------------- */}
      <div className="relative flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-[calc(var(--u)*17)] gap-y-[calc(var(--u)*15)] px-[calc(var(--u)*16)] pt-[calc(var(--u)*20)] lg:flex-nowrap lg:justify-start lg:px-[calc(var(--u)*30)] lg:pt-[calc(var(--u)*27)]">
          <button
            type="button"
            onClick={play}
            className="flex h-[calc(var(--u)*50)] items-center gap-[calc(var(--u)*10)] rounded-[calc(var(--u)*12.5)] border border-white/[0.07] bg-[#1b1d28] px-[calc(var(--u)*15)] text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] text-[#f5f6f9] transition-colors hover:bg-[#232634]"
          >
            Crash
            <img
              src={chevronSmall.src}
              alt=""
              className="h-[calc(var(--u)*18)] w-[calc(var(--u)*18)]"
            />
          </button>

          <span className="inline-flex items-center gap-[calc(var(--u)*7.5)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#5c6178]">
            <span
              className="h-[calc(var(--u)*9)] w-[calc(var(--u)*9)] rounded-full bg-[#2ed573] shadow-[0_0_0_3.8px_rgba(46,213,115,0.18)]"
              aria-hidden="true"
            />
            1,284 playing
          </span>

          <div className="rl-shelf flex w-full gap-[calc(var(--u)*8.8)] lg:ms-auto lg:w-auto">
            {HISTORY.map((h) => (
              <span
                key={h.value}
                className={`flex h-[calc(var(--u)*50)] min-w-0 flex-1 items-center justify-center rounded-[calc(var(--u)*10)] bg-[#f0f1f5]/10 lg:flex-none lg:px-[calc(var(--u)*12.5)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] tabular-nums ${
                  h.low ? 'text-[#464e61]' : 'text-[#f0f1f5]'
                }`}
              >
                {h.value}
              </span>
            ))}
          </div>
        </div>

        {/* Phone chart: 219px, the design's own shallow climb. */}
        <div className="relative mt-[calc(var(--u)*28)] h-[calc(var(--u)*221)] overflow-hidden lg:hidden">
          <div className={GRID} />
          <Curve
            viewBox="0 0 388 221"
            line={[6, 202.9, 384, 125]}
            className="absolute inset-0 h-full w-full"
          />
          <Payout className="left-[calc(var(--u)*31)] top-[calc(var(--u)*78)]" />
        </div>

        {/* Desktop chart: everything below the header, to the card's foot. */}
        <div className="relative mt-[calc(var(--u)*28)] hidden flex-1 overflow-hidden lg:block">
          <div className={GRID} />
          <Curve
            viewBox="0 0 1164 481"
            line={[3, 427.7, 1103, 201]}
            className="absolute inset-0 h-full w-full"
          />
          <Payout className="left-[35.4%] top-[42.4%]" />
        </div>
      </div>

      {/* --- Bet slip ---------------------------------------------------- */}
      <div className="rl-liquid rounded-b-[calc(var(--u)*34)] px-[calc(var(--u)*28)] pb-[calc(var(--u)*32)] pt-[calc(var(--u)*25)] lg:rounded-b-none lg:rounded-r-[calc(var(--u)*34)] lg:px-[calc(var(--u)*29)]">
        <div className="rl-liquid relative grid h-[calc(var(--u)*56)] grid-cols-2 rounded-[calc(var(--u)*34)] p-[calc(var(--u)*3)]">
          {(['manual', 'auto'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`rounded-[calc(var(--u)*34)] text-[length:max(min(11px,18px),calc(var(--u)*18))] capitalize leading-[calc(var(--u)*28)] transition-colors ${
                mode === key
                  ? 'bg-white/25 font-medium text-[#f0f1f5]'
                  : 'text-[#9da2b4] hover:text-[#f0f1f5]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="mt-[calc(var(--u)*23)]">
          <FieldLabel label="Bet Amount" hint={`≈ ${usd(bet * USD_PER_BTC)} USD`} strongHint />
          <Field>
            <span className="flex-shrink-0 font-[Inter,sans-serif] text-[length:max(min(11px,20px),calc(var(--u)*20))] leading-[calc(var(--u)*24)] text-[#f5f6f9] opacity-60">
              ₿
            </span>
            <input
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              inputMode="decimal"
              aria-label="Bet amount"
              className="min-w-0 flex-1 bg-transparent text-[length:max(min(11px,18px),calc(var(--u)*18))] font-bold leading-[calc(var(--u)*24)] tabular-nums text-[#f5f6f9] outline-none"
            />
            <Chip title="Halve the bet" onClick={() => scale(0.5)}>
              ½
            </Chip>
            <Chip title="Double the bet" onClick={() => scale(2)}>
              2×
            </Chip>
          </Field>
        </div>

        <div className="mt-[calc(var(--u)*23)]">
          <FieldLabel label="Auto Cashout" hint="Optional multiplier limit" />
          <Field>
            <input
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              inputMode="decimal"
              aria-label="Auto cashout multiplier"
              className="min-w-0 flex-1 bg-transparent text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] tabular-nums text-[#f5f6f9] outline-none"
            />
            <Chip title="Clear auto cashout" onClick={() => setAutoCashout('')}>
              <img
                src={clearIcon.src}
                alt=""
                className="h-[calc(var(--u)*9)] w-[calc(var(--u)*9)]"
              />
            </Chip>
          </Field>
        </div>

        <button
          type="button"
          onClick={play}
          className="mt-[calc(var(--u)*29)] h-[calc(var(--u)*56)] w-full rounded-[calc(var(--u)*43)] bg-[#f9d028] text-[length:max(min(11px,18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] text-[#07080a] transition-[filter] hover:brightness-110"
        >
          Place bet
        </button>

        <div className="mt-[calc(var(--u)*33)] space-y-[calc(var(--u)*15)]">
          <Summary label="Win on cashout:" value={`${btc(bet * multiplier)} BTC`} />
          <Summary label="Network fee:" value={`${btc(NETWORK_FEE)} BTC`} />
        </div>
      </div>
    </section>
  );
};

export default CrashPreview;
