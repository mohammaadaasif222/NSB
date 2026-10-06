import { useEffect, useRef, type FC } from 'react';

/**
 * Cloudflare Turnstile ("Verify you are human"), loaded straight from
 * Cloudflare's script, as they ship it — no npm wrapper needed.
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, and callers
 * should then skip the captcha check (see `TURNSTILE_ENABLED`). For local
 * development Cloudflare's test key `1x00000000000000000000AA` always passes.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export const TURNSTILE_ENABLED = Boolean(SITE_KEY);

interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark' | 'auto';
      size?: 'normal' | 'flexible' | 'compact';
      language?: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** One shared load, however many widgets mount. */
let scriptPromise: Promise<TurnstileApi> | null = null;

const loadTurnstile = (): Promise<TurnstileApi> => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing'));
    script.onerror = () => {
      scriptPromise = null; // let a later mount retry
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
};

interface TurnstileWidgetProps {
  /** Called with a fresh token, or null when it expires or errors. */
  onToken: (token: string | null) => void;
  language?: string;
  className?: string;
}

const TurnstileWidget: FC<TurnstileWidgetProps> = ({ onToken, language, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined;

    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile()
      .then((api) => {
        if (cancelled || !containerRef.current) return;
        widgetId = api.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'light',
          size: 'flexible',
          language,
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [language]);

  if (!SITE_KEY) return null;

  // Reserves the widget's height so the form doesn't jump when it loads.
  return (
    <div ref={containerRef} className={`min-h-[65px] overflow-hidden rounded-xl ${className}`} />
  );
};

export default TurnstileWidget;
