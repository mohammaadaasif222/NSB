import { useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { categoryHref } from '@/constants/games';
import { ChevronDownIcon } from '@/components/icons';

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

const HISTORY = ['1.46x', '2.41x', '5.62x', '1.94x', '11.30x'];

const btc = (value: number): string => value.toFixed(8);

const usd = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/* --- Right-hand panel pieces ------------------------------------------ */

const FieldLabel: FC<{ label: string; hint: string }> = ({ label, hint }) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-2">
    <span className="text-[11.5px] text-white/55">{label}</span>
    <span className="text-[10.5px] text-white/35">{hint}</span>
  </div>
);

const Adjust: FC<{ label: string; title: string; onClick: () => void }> = ({
  label,
  title,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="rl-btn-ghost flex h-6 min-w-[26px] items-center justify-center rounded-md px-1.5 text-[10.5px] font-semibold"
  >
    {label}
  </button>
);

const Summary: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-[11px] text-white/40">{label}</span>
    <span className="text-[11px] tabular-nums text-white/80">{value}</span>
  </div>
);

const Field: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rl-field flex h-[44px] items-center gap-2 rounded-xl px-3">{children}</div>
);

/* --- The panel --------------------------------------------------------- */

const CrashPreview: FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [betAmount, setBetAmount] = useState('0.00100000');
  const [autoCashout, setAutoCashout] = useState('2.00');

  const bet = Number.parseFloat(betAmount) || 0;
  const multiplier = Number.parseFloat(autoCashout) || 0;

  const scale = (factor: number): void => setBetAmount(btc(Math.max(0, bet * factor)));

  return (
    <section className="rl-glass overflow-hidden rounded-2xl">
      {/* --- Header ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.07] px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => router.push(categoryHref('originals'))}
          className="rl-glass rl-glass-hover flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-white"
        >
          Crash
          <ChevronDownIcon size={12} className="text-white/45" />
        </button>

        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35d07f]" aria-hidden="true" />
          1,284 playing
        </span>

        <div className="scrollbar-none ms-auto flex items-center gap-1.5 overflow-x-auto">
          {HISTORY.map((h, i) => (
            <span
              key={h}
              className={`rl-glass flex h-8 flex-shrink-0 items-center rounded-lg px-2.5 text-[11.5px] font-medium tabular-nums ${
                i % 2 === 0 ? 'text-white/85' : 'text-white/30'
              }`}
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_248px]">
        {/* --- Curve ---------------------------------------------------- */}
        <div className="relative h-[240px] px-4 py-4 sm:h-[300px] sm:px-6">
          <svg
            viewBox="0 0 600 260"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="crash-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#35d07f" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#35d07f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 250 C 210 232, 400 150, 600 18 L600 260 L0 260 Z" fill="url(#crash-fill)" />
            <path
              d="M0 250 C 210 232, 400 150, 600 18"
              fill="none"
              stroke="#35d07f"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="pointer-events-none absolute left-[38%] top-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[30px] font-semibold leading-none tabular-nums text-white sm:text-[38px]">
              1.34x
            </p>
            <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.18em] text-white/35">
              Current payout
            </p>
          </div>
        </div>

        {/* --- Bet slip -------------------------------------------------- */}
        <div className="space-y-3.5 border-t border-white/[0.07] p-3.5 lg:border-l lg:border-t-0">
          <div className="rl-glass grid grid-cols-2 gap-1 rounded-xl p-1">
            {(['manual', 'auto'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                aria-pressed={mode === key}
                className={`rounded-lg py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                  mode === key ? 'rl-glass-active text-white' : 'text-white/45 hover:text-white/75'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div>
            <FieldLabel label="Bet Amount" hint={`≈ ${usd(bet * USD_PER_BTC)}`} />
            <Field>
              <span className="flex-shrink-0 text-[13px] font-semibold text-[#fcd535]">₿</span>
              <input
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                inputMode="decimal"
                aria-label="Bet amount"
                className="min-w-0 flex-1 bg-transparent text-[13px] tabular-nums text-white outline-none"
              />
              <Adjust label="½" title="Halve the bet" onClick={() => scale(0.5)} />
              <Adjust label="2×" title="Double the bet" onClick={() => scale(2)} />
            </Field>
          </div>

          <div>
            <FieldLabel label="Auto Cashout" hint="Optional multiplier limit" />
            <Field>
              <input
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                inputMode="decimal"
                aria-label="Auto cashout multiplier"
                className="min-w-0 flex-1 bg-transparent text-[13px] tabular-nums text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setAutoCashout('')}
                aria-label="Clear auto cashout"
                title="Clear auto cashout"
                className="flex-shrink-0 px-1 text-[13px] text-white/35 transition-colors hover:text-white"
              >
                ×
              </button>
            </Field>
          </div>

          <button
            type="button"
            onClick={() => router.push(categoryHref('originals'))}
            className="rl-btn-gold h-[44px] w-full rounded-xl text-[13.5px] font-semibold"
          >
            Place bet
          </button>

          <div className="space-y-1.5 pt-0.5">
            <Summary label="Win on cashout:" value={`${btc(bet * multiplier)} BTC`} />
            <Summary label="Network fee:" value={`${btc(NETWORK_FEE)} BTC`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrashPreview;
