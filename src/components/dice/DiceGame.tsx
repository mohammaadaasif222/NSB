import type { FC } from 'react';
import Link from 'next/link';

import DiceBetPanel from '@/components/dice/DiceBetPanel';
import DiceField from '@/components/dice/DiceField';
import DiceTrack from '@/components/dice/DiceTrack';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useDiceGame } from '@/hooks/useDiceGame';
import { useRewards } from '@/hooks/useRewards';
import { formatAmount, formatRewardAmount, withCurrency } from '@/utils/money';
import type { DiceConfig, DiceRoll, Game } from '@/types';

interface Props {
  game: Game;
  config: DiceConfig;
}

/** "$1.25" or "−$0.40", from cents. */
const signedMoney = (cents: number, currency: string): string =>
  `${cents < 0 ? '−' : ''}${withCurrency(formatAmount((Math.abs(cents) / 100).toFixed(2)), currency)}`;

const Stat: FC<{ label: string; value: string; tone?: 'win' | 'loss' }> = ({
  label,
  value,
  tone,
}) => (
  <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
    <dt className="truncate text-[11px] uppercase tracking-wide text-slate-500" title={label}>
      {label}
    </dt>
    <dd
      className={`mt-0.5 truncate text-sm font-bold tabular-nums ${
        tone === 'win' ? 'text-emerald-300' : tone === 'loss' ? 'text-red-300' : 'text-slate-100'
      }`}
      title={value}
    >
      {value}
    </dd>
  </div>
);

const SwapIcon: FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 4 3 8l4 4" />
    <path d="M3 8h14" />
    <path d="m17 20 4-4-4-4" />
    <path d="M21 16H7" />
  </svg>
);

/** The latest rolls, oldest on the left; the strip clips the oldest as it fills. */
const RecentRolls: FC<{ history: DiceRoll[] }> = ({ history }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-12 items-center border-b border-slate-800 px-3">
      {history.length === 0 ? (
        <p className="text-xs text-slate-500">{t('dice.noRolls')}</p>
      ) : (
        <ol
          aria-label={t('dice.recentRolls')}
          className="flex w-full items-center justify-end gap-1.5 overflow-hidden"
        >
          {[...history].reverse().map((entry) => (
            <li
              key={entry.id}
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold tabular-nums ${
                entry.won ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {entry.roll}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const DiceGame: FC<Props> = ({ game, config }) => {
  const { t } = useTranslation();
  const { token, hydrated } = useAuth();
  const dice = useDiceGame(config);

  const { currency } = config;
  const { session } = dice;
  const { rewards: rewardsOn } = usePlatformFeatures();
  const { summary: rewards } = useRewards();
  const rakeback = rewards?.rewards.find((entry) => entry.type === 'RAKEBACK' && entry.enabled);
  const cashback = rewards?.rewards.find((entry) => entry.type === 'CASHBACK' && entry.enabled);
  const last = dice.history[0] ?? null;
  const conditionLabel = dice.condition === 'OVER' ? t('dice.rollOver') : t('dice.rollUnder');

  return (
    <section className="space-y-4" aria-labelledby="dice-title">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="dice-title" className="text-2xl font-extrabold text-white sm:text-3xl">
            {game.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t('game.provider')}:{' '}
            <span className="font-medium text-slate-200">{game.provider}</span>
          </p>
        </div>
        <p className="text-xs text-slate-400 tabular-nums">
          {t('dice.odds', { rtp: config.rtp.toFixed(2), edge: config.house_edge.toFixed(2) })}
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <DiceBetPanel dice={dice} config={config} authReady={hydrated} signedIn={!!token} />

        <div className="order-1 flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900 lg:order-2">
          <RecentRolls history={dice.history} />

          <DiceTrack
            target={dice.target}
            condition={dice.condition}
            minTarget={dice.minTarget}
            maxTarget={dice.maxTarget}
            roll={last ? Number(last.roll) : null}
            won={last?.won ?? false}
            disabled={dice.autoRunning}
            onTargetChange={dice.setTarget}
          />

          <p
            className={`min-h-5 px-4 text-center text-sm font-semibold tabular-nums ${
              last?.won ? 'text-emerald-300' : 'text-slate-400'
            }`}
            aria-live="polite"
          >
            {last &&
              (last.won
                ? t('dice.resultWin', {
                    roll: last.roll,
                    amount: withCurrency(formatAmount(last.profit), currency),
                  })
                : t('dice.resultLoss', {
                    roll: last.roll,
                    amount: withCurrency(formatAmount(last.amount), currency),
                  }))}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-800 p-4 sm:grid-cols-3">
            <DiceField
              id="dice-multiplier"
              label={<label htmlFor="dice-multiplier">{t('dice.multiplier')}</label>}
              value={dice.multiplier}
              decimals={4}
              suffix="×"
              disabled={dice.autoRunning}
              onCommit={dice.setMultiplier}
            />
            <DiceField
              id="dice-target"
              ariaLabel={conditionLabel}
              label={
                <button
                  type="button"
                  onClick={dice.toggleCondition}
                  disabled={dice.autoRunning}
                  title={t('dice.switchCondition')}
                  className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-slate-200 disabled:cursor-not-allowed"
                >
                  {conditionLabel}
                  <SwapIcon />
                </button>
              }
              value={dice.target}
              decimals={2}
              disabled={dice.autoRunning}
              onCommit={dice.setTarget}
            />
            <DiceField
              id="dice-win-chance"
              label={<label htmlFor="dice-win-chance">{t('dice.winChance')}</label>}
              value={dice.winChance}
              decimals={2}
              suffix="%"
              disabled={dice.autoRunning}
              onCommit={dice.setWinChance}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section
          className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          aria-labelledby="dice-session"
        >
          <h2 id="dice-session" className="text-sm font-bold text-white">
            {t('dice.session')}
          </h2>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            <Stat label={t('dice.rolls')} value={String(session.rolls)} />
            <Stat label={t('dice.wagered')} value={signedMoney(session.wageredCents, currency)} />
            <Stat
              label={t('dice.profit')}
              value={signedMoney(session.profitCents, currency)}
              tone={session.profitCents > 0 ? 'win' : session.profitCents < 0 ? 'loss' : undefined}
            />
          </dl>
        </section>

        {/* The whole block goes while rewards are switched off: it is a tier
            and two accrual figures that would all read zero, over a link to a
            page that no longer renders. */}
        {rewardsOn && (
          <section
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            aria-labelledby="dice-rewards"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="dice-rewards" className="text-sm font-bold text-white">
                {t('dice.rewards')}
              </h2>
              <Link
                href="/rewards"
                className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                {t('dice.viewRewards')}
              </Link>
            </div>
            {rewards ? (
              <dl className="mt-3 grid grid-cols-3 gap-2">
                <Stat label={t('dice.tier')} value={rewards.tier?.name ?? t('dice.noTier')} />
                <Stat
                  label={t('dice.rakeback')}
                  value={rakeback ? formatRewardAmount(rakeback.pending_amount, currency) : '—'}
                />
                <Stat
                  label={t('dice.cashback')}
                  value={cashback ? formatRewardAmount(cashback.pending_amount, currency) : '—'}
                />
              </dl>
            ) : (
              <p className="mt-3 text-xs text-slate-500">{t('dice.rewardsHint')}</p>
            )}
          </section>
        )}
      </div>
    </section>
  );
};

export default DiceGame;
