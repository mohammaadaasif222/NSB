import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import apiService from '@/services/api';

/** GET /platform/features. */
export interface PlatformFeatures {
  bonuses: boolean;
  /** All five reward types — rakeback, cashback, daily, weekly, monthly. */
  rewards: boolean;
  vip_tiers: boolean;
}


const ALL_ON: PlatformFeatures = { bonuses: true, rewards: true, vip_tiers: true };

const PlatformFeaturesContext = createContext<PlatformFeatures>(ALL_ON);

export const PlatformFeaturesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<PlatformFeatures>(ALL_ON);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await apiService.get<PlatformFeatures>('/platform/features');
        if (!cancelled && res?.success && res.data) {
          setFeatures(res.data);
        }
      } catch {
        // Stay as we are. See ALL_ON: a failed fetch must not empty the site.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<PlatformFeatures>(() => features, [features]);

  return (
    <PlatformFeaturesContext.Provider value={value}>{children}</PlatformFeaturesContext.Provider>
  );
};

export const usePlatformFeatures = (): PlatformFeatures => useContext(PlatformFeaturesContext);
