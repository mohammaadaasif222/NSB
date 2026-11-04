import { useEffect, useSyncExternalStore } from 'react';

import apiService from '@/services/api';
import {
  getPrecisionRulesVersion,
  setPrecisionRules,
  subscribePrecisionRules,
  type PrecisionRule,
} from '@/utils/decimalPrecision';

const REFRESH_AFTER_MS = 60_000;

let lastLoadedAt = 0;
let inflight: Promise<void> | null = null;

export const loadPrecisionRules = (force = false): Promise<void> => {
  if (inflight) return inflight;
  if (!force && Date.now() - lastLoadedAt < REFRESH_AFTER_MS) return Promise.resolve();
  inflight = apiService
    .get<Record<string, PrecisionRule>>('/platform/decimal-precision')
    .then((res) => {
      if (res?.success && res.data) {
        setPrecisionRules(res.data);
        lastLoadedAt = Date.now();
      }
    })
    .catch(() => undefined)
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

export const useDecimalPrecisionRules = (): number => {
  const version = useSyncExternalStore(
    subscribePrecisionRules,
    getPrecisionRulesVersion,
    getPrecisionRulesVersion
  );

  useEffect(() => {
    void loadPrecisionRules(true);
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void loadPrecisionRules();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return version;
};
