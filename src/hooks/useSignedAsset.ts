import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { forgetSignedUrl, signedUrl } from '@/lib/signedAssets';

export interface SignedAsset {
  src: string | null;
  failed: boolean;
  retry: () => void;
}

export const useSignedAsset = (key: string): SignedAsset => {
  const { token, hydrated } = useAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retried = useRef(false);

  useEffect(() => {
    retried.current = false;
    setSrc(null);
    setFailed(false);
    setAttempt(0);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return undefined;

    if (!token) {
      setSrc(null);
      return undefined;
    }

    let live = true;

    signedUrl(key)
      .then((url) => {
        if (live) setSrc(url);
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[PrivateImage] could not sign "${key}"`, error);
        }
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
  }, [key, token, hydrated, attempt]);

  const retry = useCallback((): void => {
    if (retried.current) {
      setFailed(true);
      return;
    }

    retried.current = true;
    forgetSignedUrl(key);
    setSrc(null);
    setAttempt((n) => n + 1);
  }, [key]);

  return { src, failed, retry };
};

export default useSignedAsset;
