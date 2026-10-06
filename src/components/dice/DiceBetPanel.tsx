import { useState, type FC, type ReactNode } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useWallet } from '@/context/WalletContext';
import { sanitizeDecimal } from '@/utils/dice';
import { formatAmount, withCurrency } from '@/utils/money';
import type { AutoRule, UseDiceGame } from '@/hooks/useDiceGame';
import type { DiceConfig } from '@/types';

interface Props {
  dice: UseDiceGame;
  config: DiceConfig;
  /** False until the session is restored, so a signed-in player never sees "Log in" flash. */
  authReady: boolean;
  signedIn: boolean;
}

type Mode = 'manual' | 'auto';

const LABEL = 'text-[11px] font-semibold uppercase tracking-wide text-slate-400';

const INPUT_BOX =
  'flex items-center rounded-lg border border-slate-700 bg-slate-950 focus-within:border-blue-500';

const INPUT =
  'min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-semibold text-slate-100 tabular-nums outline-none disabled:cursor-not-allowed disabled:text-slate-500';

const PRIMARY_BUTTON =
  'inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const TextField: FC<{
  id: string;
  label: string;
  value: string;
  suffix?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}> = ({ id, label, value, suffix, disabled, onChange }) => (
  <div className="min-w-0">
    <label htmlFor={id} className={`mb-1 block ${LABEL}`}>
      {label}
    </label>
    <div className={INPUT_BOX}>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(sanitizeDecimal(e.target.value, 2))}
        className={INPUT}
      />
      {suffix && <span className="pr-3 text-xs font-semibold text-slate-500">{suffix}</span>}
    </div>
  </div>
);

/** "On win" / "On loss": go back to the base bet, or grow the bet by a percentage. */
const AutoRuleField: FC<{
  id: string;
  label: string;
  rule: AutoRule;
  percent: string;
  disabled: boolean;
  onRule: (rule: AutoRule) => void;
  onPercent: (percent: string) => void;
}> = ({ id, label, rule, percent, disabled, onRule, onPercent }) => {
  const { t } = useTranslation();

  const option = (value: AutoRule, text: string): ReactNode => (
    <button
      type="button"
      aria-pressed={rule === value}
      disabled={disabled}
      onClick={() => onRule(value)}
      className={`shrink-0 px-2.5 py-2 text-[11px] font-bold transition-colors disabled:cursor-not-allowed ${
        rule === value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <label htmlFor={id} className={`mb-1 block ${LABEL}`}>
        {label}
      </label>
      <div className={`${INPUT_BOX} overflow-hidden`}>
        {option('reset', t('dice.reset'))}
        {option('increase', t('dice.increaseBy'))}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={percent}
          disabled={disabled || rule === 'reset'}
          onChange={(e) => onPercent(sanitizeDecimal(e.target.value, 2))}
          className={`${INPUT} border-l border-slate-700 text-right`}
        />
        <span className="pr-3 text-xs font-semibold text-slate-500">%</span>
      </div>
    </div>
  );
};

/** Bet size, profit on win, and the Roll / autobet controls. */
const DiceBetPanel: FC<Props> = ({ dice, config, authReady, signedIn }) => {
  const { t } = useTranslation();
  const { openLogin } = useAuthModal();
  const { summary } = useWallet();
  const [mode, setMode] = useState<Mode>('manual');

  const locked = dice.autoRunning;
  const busy = dice.rolling || dice.autoRunning;

  // USD-native model: active_currency IS the display currency
  const displayCurrency = summary?.preferences.active_currency ?? 'USD';

  const action = (): ReactNode => {
    if (authReady && !signedIn) {
      return (
        <button
          type="button"
          onClick={() => openLogin()}
          className={`${PRIMARY_BUTTON} bg-blue-600 text-white hover:bg-blue-500`}
        >
          {t('game.loginToPlay')}
        </button>
      );
    }

    if (mode === 'manual') {
      return (
        <button
          type="button"
          onClick={() => void dice.roll()}
          disabled={!authReady || busy || !dice.betValid}
          className={`${PRIMARY_BUTTON} bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
        >
          {dice.rolling ? <ButtonLoader /> : t('dice.roll')}
        </button>
      );
    }

    if (dice.autoRunning) {
      return (
        <button
          type="button"
          onClick={dice.stopAuto}
          className={`${PRIMARY_BUTTON} bg-red-600 text-white hover:bg-red-500`}
        >
          {t('dice.stopAuto')}
          {dice.autoLeft !== null && (
            <span className="ml-2 text-xs font-semibold opacity-80 tabular-nums">
              {t('dice.remaining', { count: dice.autoLeft })}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => void dice.startAuto()}
        disabled={!authReady || busy || !dice.betValid}
        className={`${PRIMARY_BUTTON} bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
      >
        {t('dice.startAuto')}
      </button>
    );
  };

  return (
    <aside className="order-2 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:order-1">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1" role="tablist">
        {(['manual', 'auto'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            disabled={locked}
            onClick={() => setMode(key)}
            className={`rounded-lg py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed ${
              mode === key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t(key === 'manual' ? 'dice.manual' : 'dice.auto')}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="dice-amount" className={LABEL}>
            {t('dice.betAmount')} ({displayCurrency})
          </label>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {t('dice.betRange', {
              min: formatAmount(String(config.min_bet)),
              max: formatAmount(String(config.max_bet)),
              currency: displayCurrency,
            })}
          </span>
        </div>
        <div className={`${INPUT_BOX} overflow-hidden`}>
          <input
            id="dice-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={dice.amount}
            disabled={locked}
            onChange={(e) => dice.setAmountText(e.target.value)}
            onBlur={dice.commitAmount}
            className={INPUT}
          />
          <button
            type="button"
            onClick={dice.halve}
            disabled={locked}
            aria-label={t('dice.halve')}
            className="border-l border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed"
          >
            ½
          </button>
          <button
            type="button"
            onClick={dice.double}
            disabled={locked}
            aria-label={t('dice.double')}
            className="border-l border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed"
          >
            2×
          </button>
        </div>
      </div>

      <div>
        <p className={`mb-1 ${LABEL}`}>{t('dice.profitOnWin')}</p>
        <p className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-emerald-300 tabular-nums">
          {withCurrency(formatAmount(dice.profitOnWin.toFixed(2)), displayCurrency)}
        </p>
      </div>

      {mode === 'auto' && (
        <div className="space-y-3">
          <div>
            <TextField
              id="dice-auto-count"
              label={t('dice.numberOfBets')}
              value={dice.auto.count}
              disabled={locked}
              onChange={(count) => dice.updateAuto({ count: count.replace(/\..*/, '') })}
            />
            <p className="mt-1 text-[10px] text-slate-500">{t('dice.infiniteHint')}</p>
          </div>
          <AutoRuleField
            id="dice-auto-win"
            label={t('dice.onWin')}
            rule={dice.auto.onWin}
            percent={dice.auto.onWinPercent}
            disabled={locked}
            onRule={(onWin) => dice.updateAuto({ onWin })}
            onPercent={(onWinPercent) => dice.updateAuto({ onWinPercent })}
          />
          <AutoRuleField
            id="dice-auto-loss"
            label={t('dice.onLoss')}
            rule={dice.auto.onLoss}
            percent={dice.auto.onLossPercent}
            disabled={locked}
            onRule={(onLoss) => dice.updateAuto({ onLoss })}
            onPercent={(onLossPercent) => dice.updateAuto({ onLossPercent })}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              id="dice-auto-stop-profit"
              label={t('dice.stopOnProfit')}
              value={dice.auto.stopProfit}
              suffix={displayCurrency}
              disabled={locked}
              onChange={(stopProfit) => dice.updateAuto({ stopProfit })}
            />
            <TextField
              id="dice-auto-stop-loss"
              label={t('dice.stopOnLoss')}
              value={dice.auto.stopLoss}
              suffix={displayCurrency}
              disabled={locked}
              onChange={(stopLoss) => dice.updateAuto({ stopLoss })}
            />
          </div>
        </div>
      )}

      {action()}
    </aside>
  );
};

export default DiceBetPanel;
