import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { REWARDS_REFRESH_EVENT } from '@/constants/events';
import { requestBalanceRefresh } from '@/utils/balanceEvents';
import {
  DICE_AUTO_DELAY_MS,
  DICE_DEFAULT_BET,
  DICE_DEFAULT_WIN_CHANCE,
  DICE_HISTORY_SIZE,
  DICE_REWARDS_REFRESH_MS,
} from '@/constants/dice';
import {
  clamp,
  multiplierFor,
  profitFor,
  round2,
  sanitizeDecimal,
  targetFor,
  winChanceFor,
} from '@/utils/dice';
import type { ApiError, DiceCondition, DiceConfig, DiceRoll } from '@/types';

export type AutoRule = 'reset' | 'increase';

/** Autobet settings, held as the text the player typed. */
export interface DiceAutoSettings {
  /** "0" rolls until stopped. */
  count: string;
  onWin: AutoRule;
  onWinPercent: string;
  onLoss: AutoRule;
  onLossPercent: string;
  /** Blank or 0 means no limit. */
  stopProfit: string;
  stopLoss: string;
}

/** Running totals since the page opened, in cents so they never drift. */
export interface DiceSession {
  rolls: number;
  wageredCents: number;
  profitCents: number;
}

export interface UseDiceGame {
  /** The bet as typed. */
  amount: string;
  betValid: boolean;
  target: number;
  minTarget: number;
  maxTarget: number;
  condition: DiceCondition;
  winChance: number;
  multiplier: number;
  profitOnWin: number;
  /** A roll request is in flight. */
  rolling: boolean;
  autoRunning: boolean;
  /** Rolls left in the running autobet; null when unlimited or idle. */
  autoLeft: number | null;
  /** Newest first. */
  history: DiceRoll[];
  session: DiceSession;
  auto: DiceAutoSettings;
  setAmountText: (text: string) => void;
  commitAmount: () => void;
  halve: () => void;
  double: () => void;
  setTarget: (value: number) => void;
  setWinChance: (value: number) => void;
  setMultiplier: (value: number) => void;
  toggleCondition: () => void;
  updateAuto: (patch: Partial<DiceAutoSettings>) => void;
  roll: () => Promise<void>;
  startAuto: () => Promise<void>;
  stopAuto: () => void;
}

const EMPTY_SESSION: DiceSession = { rolls: 0, wageredCents: 0, profitCents: 0 };

const DEFAULT_AUTO: DiceAutoSettings = {
  count: '10',
  onWin: 'reset',
  onWinPercent: '0',
  onLoss: 'reset',
  onLossPercent: '0',
  stopProfit: '',
  stopLoss: '',
};

const toCents = (amount: string | number): number => Math.round(Number(amount) * 100);

/** A non-negative number from typed text; blank or junk is 0. */
const typed = (text: string): number => {
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

/**
 * State and actions for the Dice board.
 *
 * Every roll goes to the server, which picks the number and settles the bet
 * against the player's balance; nothing here decides an outcome. The board only mirrors the maths so
 * the multiplier and profit shown are what the server will use.
 */
export const useDiceGame = (config: DiceConfig): UseDiceGame => {
  const { t } = useTranslation();

  // `t` is a new function on every render; read it through a ref so callbacks
  // built on it stay stable.
  const tRef = useRef(t);
  tRef.current = t;

  const {
    rtp,
    min_bet: minBet,
    max_bet: maxBet,
    min_win_chance: minChance,
    max_win_chance: maxChance,
  } = config;

  const clampBet = useCallback(
    (value: number): number => round2(clamp(value, minBet, maxBet)),
    [minBet, maxBet]
  );

  const [amount, setAmount] = useState(() => clampBet(DICE_DEFAULT_BET).toFixed(2));
  const [condition, setCondition] = useState<DiceCondition>('OVER');
  const [target, setTargetValue] = useState(() =>
    targetFor(round2(clamp(DICE_DEFAULT_WIN_CHANCE, minChance, maxChance)), 'OVER')
  );
  const [rolling, setRolling] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoLeft, setAutoLeft] = useState<number | null>(null);
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [session, setSession] = useState<DiceSession>(EMPTY_SESSION);
  const [auto, setAuto] = useState<DiceAutoSettings>(DEFAULT_AUTO);

  /** Set synchronously, so a double-click cannot start two rolls before state catches up. */
  const busyRef = useRef(false);
  const stopRef = useRef(false);
  const mountedRef = useRef(true);
  const lastRefreshRef = useRef(0);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Leaving the page ends an autobet rather than rolling on unseen.
      stopRef.current = true;
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const winChance = winChanceFor(target, condition);
  const multiplier = multiplierFor(rtp, winChance);
  const bet = Number(amount);
  const betValid = amount.trim() !== '' && Number.isFinite(bet) && bet >= minBet && bet <= maxBet;
  const profitOnWin = betValid ? profitFor(bet, multiplier) : 0;
  const minTarget = condition === 'OVER' ? round2(100 - maxChance) : minChance;
  const maxTarget = condition === 'OVER' ? round2(100 - minChance) : maxChance;

  /**
   * Tell the wallet chip and the rewards tray to refetch — at once, or at the
   * end of the current window, so an autobet does not refetch on every roll.
   */
  const refreshAccount = useCallback((): void => {
    const fire = (): void => {
      refreshTimerRef.current = null;
      lastRefreshRef.current = Date.now();
      requestBalanceRefresh();
      window.dispatchEvent(new Event(REWARDS_REFRESH_EVENT));
    };

    const wait = DICE_REWARDS_REFRESH_MS - (Date.now() - lastRefreshRef.current);
    if (wait <= 0) {
      fire();
    } else if (refreshTimerRef.current === null) {
      refreshTimerRef.current = window.setTimeout(fire, wait);
    }
  }, []);

  const rollOnce = useCallback(
    async (stake: number, rollTarget: number, rollCondition: DiceCondition) => {
      setRolling(true);
      try {
        const res = await apiService.post<DiceRoll>('/dice/roll', {
          amount: stake,
          target: rollTarget,
          condition: rollCondition,
        });
        if (res?.success && res.data) {
          const result = res.data;
          if (mountedRef.current) {
            setHistory((current) => [result, ...current].slice(0, DICE_HISTORY_SIZE));
            setSession((current) => ({
              rolls: current.rolls + 1,
              wageredCents: current.wageredCents + toCents(result.amount),
              profitCents: current.profitCents + toCents(result.profit),
            }));
          }
          refreshAccount();
          return result;
        }
        toast.error(res?.message || tRef.current('dice.rollFailed'));
      } catch (err) {
        toast.error((err as ApiError)?.message || tRef.current('dice.rollFailed'));
      } finally {
        if (mountedRef.current) {
          setRolling(false);
        }
      }
      return null;
    },
    [refreshAccount]
  );

  const roll = useCallback(async (): Promise<void> => {
    if (busyRef.current || !betValid) {
      return;
    }
    busyRef.current = true;
    try {
      await rollOnce(bet, target, condition);
    } finally {
      busyRef.current = false;
    }
  }, [betValid, bet, target, condition, rollOnce]);

  const startAuto = useCallback(async (): Promise<void> => {
    if (busyRef.current || !betValid) {
      return;
    }
    busyRef.current = true;
    stopRef.current = false;
    setAutoRunning(true);

    // Fixed for the run: the controls are locked while it plays.
    const base = bet;
    const planned = Math.floor(typed(auto.count));
    const stopProfitCents = toCents(typed(auto.stopProfit));
    const stopLossCents = toCents(typed(auto.stopLoss));
    const onWinFactor = auto.onWin === 'increase' ? 1 + typed(auto.onWinPercent) / 100 : null;
    const onLossFactor = auto.onLoss === 'increase' ? 1 + typed(auto.onLossPercent) / 100 : null;

    let stake = base;
    let played = 0;
    let netCents = 0;

    try {
      while (!stopRef.current && (planned === 0 || played < planned)) {
        setAutoLeft(planned === 0 ? null : planned - played);

        const result = await rollOnce(stake, target, condition);
        if (!result) {
          break;
        }
        played += 1;
        netCents += toCents(result.profit);

        if (stopProfitCents > 0 && netCents >= stopProfitCents) break;
        if (stopLossCents > 0 && -netCents >= stopLossCents) break;
        if (planned !== 0 && played >= planned) break;

        const factor = result.won ? onWinFactor : onLossFactor;
        stake = factor === null ? base : clampBet(stake * factor);
        setAmount(stake.toFixed(2));

        await sleep(DICE_AUTO_DELAY_MS);
      }
    } finally {
      busyRef.current = false;
      stopRef.current = false;
      if (mountedRef.current) {
        setAutoRunning(false);
        setAutoLeft(null);
        setAmount(base.toFixed(2));
      }
    }
  }, [betValid, bet, auto, target, condition, rollOnce, clampBet]);

  const stopAuto = useCallback((): void => {
    stopRef.current = true;
  }, []);

  const setAmountText = useCallback((text: string): void => {
    setAmount(sanitizeDecimal(text, 2));
  }, []);

  const commitAmount = useCallback((): void => {
    setAmount((current) => {
      const value = Number(current);
      return clampBet(current.trim() !== '' && Number.isFinite(value) ? value : minBet).toFixed(2);
    });
  }, [clampBet, minBet]);

  const scaleBet = useCallback(
    (factor: number): void => {
      setAmount((current) => {
        const value = Number(current);
        const from = Number.isFinite(value) && value > 0 ? value : minBet;
        return clampBet(from * factor).toFixed(2);
      });
    },
    [clampBet, minBet]
  );

  const halve = useCallback((): void => scaleBet(0.5), [scaleBet]);
  const double = useCallback((): void => scaleBet(2), [scaleBet]);

  const setTarget = useCallback(
    (value: number): void => {
      setTargetValue(round2(clamp(value, minTarget, maxTarget)));
    },
    [minTarget, maxTarget]
  );

  const setWinChance = useCallback(
    (value: number): void => {
      setTargetValue(targetFor(round2(clamp(value, minChance, maxChance)), condition));
    },
    [minChance, maxChance, condition]
  );

  const setMultiplier = useCallback(
    (value: number): void => {
      if (value > 0) {
        setTargetValue(targetFor(round2(clamp(rtp / value, minChance, maxChance)), condition));
      }
    },
    [rtp, minChance, maxChance, condition]
  );

  /** Flip over ↔ under and mirror the target, so the win chance stays the same. */
  const toggleCondition = useCallback((): void => {
    setCondition((current) => (current === 'OVER' ? 'UNDER' : 'OVER'));
    setTargetValue((current) => round2(100 - current));
  }, []);

  const updateAuto = useCallback((patch: Partial<DiceAutoSettings>): void => {
    setAuto((current) => ({ ...current, ...patch }));
  }, []);

  return {
    amount,
    betValid,
    target,
    minTarget,
    maxTarget,
    condition,
    winChance,
    multiplier,
    profitOnWin,
    rolling,
    autoRunning,
    autoLeft,
    history,
    session,
    auto,
    setAmountText,
    commitAmount,
    halve,
    double,
    setTarget,
    setWinChance,
    setMultiplier,
    toggleCondition,
    updateAuto,
    roll,
    startAuto,
    stopAuto,
  };
};
