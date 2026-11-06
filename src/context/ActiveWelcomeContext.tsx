import { createContext, useContext, useEffect, useMemo, type FC, type ReactNode } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useWelcomeOffer } from '@/hooks/useWelcomeOffer';
import { realtimeService } from '@/services/realtimeService';
import { formatOfferAmount } from '@/utils/money';
import type { UserBonus, WelcomeContributions } from '@/types';

const BET_REFUSED_EVENT = 'bonus.bet_refused';

interface ActiveWelcome {
  award: UserBonus | null;
  contributions: WelcomeContributions | null;
  currency: string;
  refresh: () => Promise<void>;
}

const ActiveWelcomeContext = createContext<ActiveWelcome>({
  award: null,
  contributions: null,
  currency: 'USD',
  refresh: async () => undefined,
});

export const ActiveWelcomeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { offer, refresh } = useWelcomeOffer();

  const award = token && offer?.award?.status === 'ACTIVE' ? offer.award : null;
  const contributions = award ? (offer?.contributions ?? null) : null;
  const currency = offer?.currency ?? 'USD';

  useEffect(() => {
    if (!token) return undefined;
    const onRefused = (data: { reason?: string; max_bet?: string } | null): void => {
      if (data?.reason !== 'WELCOME_MAX_BET' || !data.max_bet) return;
      toast.error(t('welcome.betRefused', { maxBet: formatOfferAmount(data.max_bet, currency) }), {
        toastId: 'welcome-bet-refused',
      });
    };
    realtimeService.on(BET_REFUSED_EVENT, onRefused);
    return () => realtimeService.off(BET_REFUSED_EVENT, onRefused);
  }, [token, t, currency]);

  const value = useMemo(
    () => ({ award, contributions, currency, refresh }),
    [award, contributions, currency, refresh]
  );

  return <ActiveWelcomeContext.Provider value={value}>{children}</ActiveWelcomeContext.Provider>;
};

export const useActiveWelcome = (): ActiveWelcome => useContext(ActiveWelcomeContext);
