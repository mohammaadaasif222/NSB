import apiService from '@/services/api';

const CACHE_MS = 60_000;

let cached: { at: number; value: Promise<number | null> } | null = null;

export const fetchRegisteredToday = (): Promise<number | null> => {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }
  const value = apiService
    .get<{ registered_today: number }>('/statistics/public')
    .then((res) =>
      res?.success && typeof res.data?.registered_today === 'number'
        ? res.data.registered_today
        : null
    )
    .catch(() => null);
  cached = { at: Date.now(), value };
  return value;
};

export const compactCount = (count: number): string => {
  if (count < 1000) {
    return String(count);
  }
  const [size, unit] = count < 999_950 ? [1000, 'K'] : [1_000_000, 'M'];
  return `${(count / size).toFixed(1).replace(/\.0$/, '')}${unit}`;
};
