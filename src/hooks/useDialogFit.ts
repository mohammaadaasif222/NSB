import { useEffect, useState } from 'react';
import { useStageScale } from '@/hooks/useStageScale';

/** How much vertical room a dialog has, in the design's own pixels. */
export type DialogTier = 'full' | 'mid' | 'short';

interface DialogFit {
  /** The page's design scale — zoom the card by this (see useStageScale). */
  scale: number;
  /**
   * `full` above 820 design px of window height, `mid` from 701 to 820,
   * `short` at 700 and under — the breakpoints the responsible-gambling
   * dialogs tighten their rhythm at.
   */
  tier: DialogTier;
  /** A cap on the card's height, in px *before* the zoom: `frac` of the window. */
  maxHeight: (frac: number) => number;
}

/**
 * Sizing for a dialog drawn at the design's own pixel sizes and zoomed to the
 * page's scale.
 *
 * Height breakpoints written as media queries are wrong once the card is
 * zoomed: a 1366 × 657 laptop window is "short" to a media query, yet at the
 * page's 0.71 the card has the room of a 925-tall window and needs no
 * tightening at all. So the tier is worked out from the window height divided
 * by the zoom — the room the card actually has.
 *
 * The same goes for a `vh` cap: the card's own lengths are zoomed, so its cap
 * is given in px, divided by the zoom, and lands on the intended fraction of
 * the real window.
 */
export const useDialogFit = (active: boolean): DialogFit => {
  const scale = useStageScale(active);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const read = (): void => setHeight(window.innerHeight);
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [active]);

  // Before the first read (and on the server), assume the design's own frame.
  const room = height > 0 ? height / scale : 1080;
  const tier: DialogTier = room > 820 ? 'full' : room > 700 ? 'mid' : 'short';

  return {
    scale,
    tier,
    maxHeight: (frac) => (height > 0 ? (height * frac) / scale : 1080 * frac),
  };
};
