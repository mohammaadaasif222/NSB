import { useEffect, useState } from 'react';
import { translate } from '@/i18n/translate';

/** Milliseconds from now until `target`, never negative; null without a target. */
const remainingUntil = (target: string | null, offsetMs: number): number | null =>
  target ? Math.max(0, new Date(target).getTime() - (Date.now() + offsetMs)) : null;

/**
 * Time left until `target`, ticking once a second.
 *
 * `offsetMs` is the server clock minus the device clock. A countdown to a
 * server-set moment read against a phone that is two minutes fast would hit
 * zero two minutes early, so the difference is corrected for here.
 */
export const useCountdown = (target: string | null, offsetMs = 0): number | null => {
  const [remaining, setRemaining] = useState<number | null>(() => remainingUntil(target, offsetMs));

  useEffect(() => {
    setRemaining(remainingUntil(target, offsetMs));
    if (!target) {
      return;
    }
    const id = window.setInterval(() => setRemaining(remainingUntil(target, offsetMs)), 1000);
    return () => window.clearInterval(id);
  }, [target, offsetMs]);

  return remaining;
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** "2d 04:05:06", "04:05:06" or "05:06". The days unit follows the active language. */
export const formatCountdown = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days > 0) {
    return `${translate('misc.countdown.days', { days })} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};
