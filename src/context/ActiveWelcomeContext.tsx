import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useWelcomeOffer } from '@/hooks/useWelcomeOffer';
import type { UserBonus, WelcomeContributions } from '@/types';

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
  const { token } = useAuth();
  const { offer, refresh } = useWelcomeOffer();

  const award = token && offer?.award?.status === 'ACTIVE' ? offer.award : null;
  const contributions = award ? (offer?.contributions ?? null) : null;
  const currency = offer?.currency ?? 'USD';

  const value = useMemo(
    () => ({ award, contributions, currency, refresh }),
    [award, contributions, currency, refresh]
  );

  return <ActiveWelcomeContext.Provider value={value}>{children}</ActiveWelcomeContext.Provider>;
};

export const useActiveWelcome = (): ActiveWelcome => useContext(ActiveWelcomeContext);
