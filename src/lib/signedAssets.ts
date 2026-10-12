import { signAssets } from '@/services/assets';

const MAX_KEYS_PER_REQUEST = 50;

const RENEW_MARGIN_MS = 60_000;

interface Entry {
  url: string;
  expiresAt: number;
}

interface Resolver {
  resolve: (url: string) => void;
  reject: (reason: unknown) => void;
}

const cache = new Map<string, Entry>();
const waiting = new Map<string, Resolver[]>();
let flushScheduled = false;

const isFresh = (entry: Entry | undefined): entry is Entry =>
  entry !== undefined && entry.expiresAt - RENEW_MARGIN_MS > Date.now();

const scheduleFlush = (): void => {
  if (flushScheduled) return;
  flushScheduled = true;

  setTimeout(() => void flush(), 0);
};

const flush = async (): Promise<void> => {
  flushScheduled = false;

  const keys = [...waiting.keys()].slice(0, MAX_KEYS_PER_REQUEST);
  if (keys.length === 0) return;

  const claimed = new Map<string, Resolver[]>();
  for (const key of keys) {
    claimed.set(key, waiting.get(key) ?? []);
    waiting.delete(key);
  }
  if (waiting.size > 0) scheduleFlush();

  try {
    const res = await signAssets(keys);
    const data = res?.data;

    if (!res?.success || !data?.assets) {
      throw new Error(res?.message || 'The server did not return signed URLs');
    }

    const expiresAt = Date.parse(data.expiresAt) || Date.now() + data.expiresIn * 1000;
    for (const asset of data.assets) {
      cache.set(asset.key, { url: asset.url, expiresAt });
    }

    for (const [key, resolvers] of claimed) {
      const entry = cache.get(key);
      for (const resolver of resolvers) {
        if (entry) resolver.resolve(entry.url);
        else resolver.reject(new Error(`No URL was returned for ${key}`));
      }
    }
  } catch (error) {
    for (const resolvers of claimed.values()) {
      for (const resolver of resolvers) resolver.reject(error);
    }
  }
};

export const signedUrl = (key: string): Promise<string> => {
  const cached = cache.get(key);
  if (isFresh(cached)) return Promise.resolve(cached.url);

  cache.delete(key);

  return new Promise<string>((resolve, reject) => {
    const resolvers = waiting.get(key);

    if (resolvers) {
      resolvers.push({ resolve, reject });
      return;
    }

    waiting.set(key, [{ resolve, reject }]);
    scheduleFlush();
  });
};

export const forgetSignedUrl = (key: string): void => {
  cache.delete(key);
};

export const forgetAllSignedUrls = (): void => {
  cache.clear();
};
