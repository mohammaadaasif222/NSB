import { useCallback, useEffect, useRef } from 'react';

import { trackGameImpressions } from '@/utils/events';

/**
 * Counts which game tiles a player actually saw.
 *
 * One shared IntersectionObserver for the whole page, not one per tile: a
 * lobby renders sixty-odd tiles, and sixty observers is sixty sets of
 * callbacks competing on the same scroll.
 *
 * Impressions are collected and sent in batches. A tile counts once it has
 * been at least half visible for a full second — long enough to rule out
 * everything that merely flew past under a fast scroll, which is the
 * difference between "was on screen" and "was seen".
 *
 * Nothing here can throw into the lobby. An unsupported browser (no
 * IntersectionObserver) simply records no impressions; the tiles render and
 * behave exactly as before.
 */

/** Fraction of a tile that must be on screen for it to be counted at all. */
const VISIBLE_RATIO = 0.5;

/** How long it must stay that visible. Filters out fast scrolling. */
const DWELL_MS = 1_000;

/** Quiet period before a batch is sent, so one scroll makes one event. */
const BATCH_MS = 2_000;

interface Entry {
  slug: string;
  shelf: string | undefined;
  /** Pending dwell timer, set while the tile is on screen. */
  timer: ReturnType<typeof setTimeout> | null;
}

/* -------------------------------------------------------------------------- */
/* Module-level state — one observer and one batch for the whole page.        */
/* -------------------------------------------------------------------------- */

let observer: IntersectionObserver | null = null;

const entries = new WeakMap<Element, Entry>();

/**
 * Already counted this page, as `shelf|slug`.
 *
 * Scoped to the page rather than the session: seeing the same game again
 * after navigating back to the lobby is a second impression, and collapsing
 * the two would make a game that is on every page look no more visible than
 * one buried on a single shelf. Cleared by `resetGameImpressions`.
 */
let counted = new Set<string>();

/** Slugs waiting to be sent, grouped by the shelf they were seen in. */
const pending = new Map<string, Set<string>>();

let batchTimer: ReturnType<typeof setTimeout> | null = null;

const flushBatch = (): void => {
  batchTimer = null;

  for (const [shelf, slugs] of pending) {
    trackGameImpressions([...slugs], shelf === '' ? undefined : shelf);
  }

  pending.clear();
};

const queue = (slug: string, shelf: string | undefined): void => {
  const key = `${shelf ?? ''}|${slug}`;
  if (counted.has(key)) return;
  counted.add(key);

  const bucket = pending.get(shelf ?? '');
  if (bucket === undefined) {
    pending.set(shelf ?? '', new Set([slug]));
  } else {
    bucket.add(slug);
  }

  // Restart the quiet period — a player still scrolling has not finished
  // producing impressions, and one event per scroll beats one per tile.
  if (batchTimer !== null) clearTimeout(batchTimer);
  batchTimer = setTimeout(flushBatch, BATCH_MS);
};

const handle = (observed: IntersectionObserverEntry[]): void => {
  for (const observation of observed) {
    const entry = entries.get(observation.target);
    if (entry === undefined) continue;

    const visible = observation.isIntersecting && observation.intersectionRatio >= VISIBLE_RATIO;

    if (!visible) {
      // Scrolled away before the dwell elapsed — it does not count.
      if (entry.timer !== null) {
        clearTimeout(entry.timer);
        entry.timer = null;
      }
      continue;
    }

    if (entry.timer !== null) continue;

    entry.timer = setTimeout(() => {
      entry.timer = null;

      // A background tab keeps firing intersections in some browsers while
      // the player is not looking at any of it.
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      queue(entry.slug, entry.shelf);

      // Counted once; there is nothing more to learn from this element.
      observer?.unobserve(observation.target);
      entries.delete(observation.target);
    }, DWELL_MS);
  }
};

const ensureObserver = (): IntersectionObserver | null => {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return null;
  }

  observer ??= new IntersectionObserver(handle, {
    threshold: [0, VISIBLE_RATIO, 1],
  });

  return observer;
};

/**
 * Forgets what has been counted, so the next page's impressions are recorded
 * fresh. Also sends anything still waiting — the batch belongs to the page it
 * was collected on, not the one being navigated to.
 *
 * Called from `useTracking` on route change.
 */
export const resetGameImpressions = (): void => {
  try {
    if (batchTimer !== null) {
      clearTimeout(batchTimer);
      flushBatch();
    }
    counted = new Set();
  } catch {
    /* Tracking must never break navigation. */
  }
};

/* -------------------------------------------------------------------------- */
/* The hook                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns a ref to put on a game tile. Attaching it is the whole integration:
 *
 *   const ref = useGameImpression(game.slug, 'popular');
 *   return <div ref={ref}>…</div>;
 */
export const useGameImpression = (
  slug: string,
  shelf?: string
): ((node: HTMLElement | null) => void) => {
  const attached = useRef<HTMLElement | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null): void => {
      try {
        const active = ensureObserver();
        if (active === null) return;

        if (attached.current !== null) {
          active.unobserve(attached.current);
          entries.delete(attached.current);
        }

        attached.current = node;

        if (node !== null) {
          entries.set(node, { slug, shelf, timer: null });
          active.observe(node);
        }
      } catch {
        /* An unobservable tile is a tile that renders normally. */
      }
    },
    [slug, shelf]
  );

  useEffect(
    () => () => {
      const node = attached.current;
      if (node === null) return;

      const entry = entries.get(node);
      if (entry?.timer != null) clearTimeout(entry.timer);

      observer?.unobserve(node);
      entries.delete(node);
      attached.current = null;
    },
    []
  );

  return ref;
};
