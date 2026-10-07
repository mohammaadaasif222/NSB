import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import type { Fixture, Outcome } from '@/services/sportsbook.sample';

export interface Pick {
  fixture: Fixture;
  outcome: Outcome;
}

interface BetslipValue {
  picks: Pick[];
  /** The outcome picked on a fixture, if any. */
  pickOf: (fixtureId: string) => Outcome | undefined;
  /** Picks an outcome, replaces another outcome of the same match, or un-picks it. */
  toggle: (fixture: Fixture, outcome: Outcome) => void;
  remove: (fixtureId: string) => void;
  /** The stake as typed, in dollars. */
  stake: string;
  setStake: (stake: string) => void;
  /** The picks' odds multiplied — an accumulator. 0 with no picks. */
  totalOdds: number;
  potentialReturn: number;
}

const BetslipContext = createContext<BetslipValue | null>(null);

/** The design's stake. */
const DEFAULT_STAKE = '50';

/**
 * The sportsbook's betslip: the odds picked across its pages, one per match,
 * combined as an accumulator. Lives above the pages so picks survive moving
 * between the lobby and a sport. Held in memory only — nothing places a bet
 * until a sportsbook backend exists.
 */
export const BetslipProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [stake, setStake] = useState(DEFAULT_STAKE);

  const pickOf = useCallback(
    (fixtureId: string) => picks.find((p) => p.fixture.id === fixtureId)?.outcome,
    [picks]
  );

  const toggle = useCallback((fixture: Fixture, outcome: Outcome) => {
    setPicks((current) => {
      const existing = current.find((p) => p.fixture.id === fixture.id);
      const rest = current.filter((p) => p.fixture.id !== fixture.id);
      return existing?.outcome === outcome ? rest : [...rest, { fixture, outcome }];
    });
  }, []);

  const remove = useCallback((fixtureId: string) => {
    setPicks((current) => current.filter((p) => p.fixture.id !== fixtureId));
  }, []);

  const value = useMemo(() => {
    const totalOdds = picks.length
      ? picks.reduce((product, p) => product * p.fixture.odds[p.outcome], 1)
      : 0;
    const amount = Number.parseFloat(stake);
    return {
      picks,
      pickOf,
      toggle,
      remove,
      stake,
      setStake,
      totalOdds,
      potentialReturn: Number.isFinite(amount) ? amount * totalOdds : 0,
    };
  }, [picks, pickOf, toggle, remove, stake]);

  return <BetslipContext.Provider value={value}>{children}</BetslipContext.Provider>;
};

export const useBetslip = (): BetslipValue => {
  const context = useContext(BetslipContext);
  if (!context) {
    throw new Error('useBetslip must be used inside BetslipProvider');
  }
  return context;
};
