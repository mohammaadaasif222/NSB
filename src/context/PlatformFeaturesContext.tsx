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

export interface PlatformFeatures {
  bonuses: boolean;
  rewards: boolean;
  vip_tiers: boolean;
  promotions: boolean;
  promotion_filters: { live: boolean; expired: boolean; casino: boolean; sports: boolean };
}


const ALL_ON: PlatformFeatures = {
  bonuses: true,
  rewards: true,
  vip_tiers: true,
  promotions: true,
  promotion_filters: { live: true, expired: true, casino: true, sports: true },
};

const PlatformFeaturesContext = createContext<PlatformFeatures>(ALL_ON);

export const PlatformFeaturesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<PlatformFeatures>(ALL_ON);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await apiService.get<PlatformFeatures>('/platform/features');
        if (!cancelled && res?.success && res.data) {
          setFeatures({
            ...ALL_ON,
            ...res.data,
            promotion_filters: { ...ALL_ON.promotion_filters, ...res.data.promotion_filters },
          });
        }
      } catch {
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
