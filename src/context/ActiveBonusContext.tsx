import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { BONUS_REFRESH_EVENT, WALLET_REFRESH_EVENT } from '@/constants/events';
import { formatOfferAmount } from '@/utils/money';
import type { TranslationKey } from '@/i18n/locales';
import { welcomeContribution } from '@/utils/welcomeContribution';
import type { ActiveBonusTerms, Game } from '@/types';

const BET_REFUSED_EVENT = 'bonus.bet_refused';
const MIN_REFRESH_MS = 15_000;

type ActiveTermsBonus = ActiveBonusTerms['bonuses'][number];

interface ActiveBonus {
  bonuses: ActiveTermsBonus[];
  primary: ActiveTermsBonus | null;
  contribution: (game: Pick<Game, 'id' | 'category' | 'provider' | 'rtp'>) => number | null;
  refresh: () => Promise<void>;
}

const ActiveBonusContext = createContext<ActiveBonus>({
  bonuses: [],
  primary: null,
  contribution: () => null,
  refresh: async () => undefined,
});

const REFUSED_KEYS: Record<string, TranslationKey> = {
  PRODUCT_BLOCKED: 'bonus.betRefused.productBlocked',
  REAL_ROUND_OPEN: 'bonus.betRefused.realRoundOpen',
  GAME_NOT_ELIGIBLE: 'bonus.betRefused.gameNotEligible',
  PROVIDER_LIMIT: 'bonus.betRefused.providerLimit',
  MAX_BET: 'bonus.betRefused.maxBet',
};

export const ActiveBonusProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [bonuses, setBonuses] = useState<ActiveTermsBonus[]>([]);
  const fetchedAt = useRef(0);
  const ticket = useRef(0);

  const load = useCallback(
    async (force: boolean): Promise<void> => {
      if (!token) {
        setBonuses([]);
        return;
      }
      if (!force && Date.now() - fetchedAt.current < MIN_REFRESH_MS) return;
      fetchedAt.current = Date.now();
      const mine = (ticket.current += 1);
      try {
        const res = await apiService.get<ActiveBonusTerms>('/bonuses/active/terms');
        if (mine !== ticket.current) return;
        if (res?.success && res.data) setBonuses(res.data.bonuses ?? []);
      } catch {
        return;
      }
    },
    [token]
  );

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    fetchedAt.current = 0;
    void load(true);
    const onChanged = (): void => void load(false);
    window.addEventListener(WALLET_REFRESH_EVENT, onChanged);
    window.addEventListener(BONUS_REFRESH_EVENT, onChanged);
    return () => {
      ticket.current += 1;
      window.removeEventListener(WALLET_REFRESH_EVENT, onChanged);
      window.removeEventListener(BONUS_REFRESH_EVENT, onChanged);
    };
  }, [load]);

  useEffect(() => {
    if (!token) return undefined;
    const onRefused = (
      data: { reason?: string; bonus?: string; product?: string; stake?: string } | null
    ): void => {
      const key = data?.reason ? REFUSED_KEYS[data.reason] : undefined;
      if (!key) return;
      const primary = bonuses[0];
      toast.error(
        t(key, {
          bonus: data?.bonus ?? primary?.name ?? '',
          product: data?.product
            ? t(`bonus.product.${data.product as 'CASINO' | 'ORIGINALS' | 'SPORTSBOOK'}`)
            : '',
          maxBet: primary?.max_bet ? formatOfferAmount(primary.max_bet, 'USD') : '',
        }),
        { toastId: `bonus-bet-refused-${data?.reason}` }
      );
    };
    realtimeService.on(BET_REFUSED_EVENT, onRefused);
    return () => realtimeService.off(BET_REFUSED_EVENT, onRefused);
  }, [token, t, bonuses]);

  const value = useMemo<ActiveBonus>(() => {
    const primary = bonuses[0] ?? null;
    return {
      bonuses,
      primary,
      contribution: (game) => {
        if (!primary || !primary.exact_rules) return null;
        return welcomeContribution({ rules: primary.rules, max_rtp: primary.max_rtp }, game);
      },
      refresh,
    };
  }, [bonuses, refresh]);

  return <ActiveBonusContext.Provider value={value}>{children}</ActiveBonusContext.Provider>;
};

export const useActiveBonus = (): ActiveBonus => useContext(ActiveBonusContext);
