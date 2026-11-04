const KEY = 'rl_post_signup';

/** A flag older than this is a signup that never reached a session; ignore it. */
const FRESH_MS = 2 * 60 * 1000;

/** The signup's time in memory too, so storage failing cannot lose it. */
let markedAt = 0;
/** The welcome popup has been claimed and is not done yet. */
let showing = false;

const listeners = new Set<() => void>();
const notify = (): void => listeners.forEach((fn) => fn());

/** For React (see usePostSignupPending): called whenever pending may have changed. */
export const subscribePostSignup = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const isFresh = (at: number): boolean => at > 0 && Date.now() - at < FRESH_MS;

const fresh = (): boolean => {
  if (isFresh(markedAt)) return true;
  try {
    return isFresh(Number(sessionStorage.getItem(KEY)));
  } catch {
    return false;
  }
};

const clear = (): void => {
  markedAt = 0;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
};

/**
 * An account was just created. Call it where the signup is tracked, before the
 * session starts: the welcome popup shows once the player is signed in.
 */
export const markPostSignup = (): void => {
  if (typeof window === 'undefined') return;
  markedAt = Date.now();
  try {
    sessionStorage.setItem(KEY, String(markedAt));
  } catch {
    // `markedAt` still carries it until the page reloads.
  }
  notify();
};

/** True from the signup until the welcome popup is done — other pop-ups wait. */
export const postSignupPending = (): boolean => showing || fresh();

/** Claim the popup: true once per signup. Stays pending until `donePostSignup`. */
export const takePostSignup = (): boolean => {
  const had = fresh();
  clear();
  if (had) showing = true;
  notify();
  return had;
};

export const donePostSignup = (): void => {
  showing = false;
  clear();
  notify();
};
