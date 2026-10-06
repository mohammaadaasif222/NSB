import { useEffect, type FC } from 'react';
import { warmSeonAgent } from '@/lib/seon';

/** Interactions that count as "the player is really here". */
const TRIGGERS: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

/**
 * Starts the SEON agent once the player interacts, and never before.
 *
 * Two reasons it is deferred rather than run on mount:
 *
 *   1. **It must not compete with first paint.** Loading a third-party script
 *      during initial render delays the page the player is actually waiting
 *      for, to collect a signal nothing needs until they submit something.
 *
 *   2. **Behavioural data needs a human.** `init()` begins collecting
 *      interaction signals; starting it before anyone has touched the page
 *      mostly records an empty room, and starting it on a bot's fetch records
 *      nothing at all.
 *
 * Renders nothing. Failure is silent by design — a blocked agent means less
 * risk signal, never a broken page.
 */
const SeonAgentWarmup: FC = () => {
  useEffect(() => {
    let done = false;

    const start = (): void => {
      if (done) return;
      done = true;
      TRIGGERS.forEach((event) => window.removeEventListener(event, start));
      void warmSeonAgent();
    };

    // `passive` so this can never delay a scroll or a tap.
    TRIGGERS.forEach((event) =>
      window.addEventListener(event, start, { passive: true, once: true })
    );

    return () => {
      done = true;
      TRIGGERS.forEach((event) => window.removeEventListener(event, start));
    };
  }, []);

  return null;
};

export default SeonAgentWarmup;
