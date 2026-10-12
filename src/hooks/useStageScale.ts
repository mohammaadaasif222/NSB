import { useEffect, useState } from 'react';

/**
 * The player page's design scale — PlayerLayout's `--u` as a number (1 on a
 * phone and at 1920 wide, 0.71 at 1366) — so a dialog portalled outside the
 * stage can draw at the page's proportions instead of at full size over a
 * shrunken page.
 *
 * Never below `min`: a dialog's text has no floor of its own, and under about
 * 70% the design's 14px labels stop being readable.
 */
export const useStageScale = (active: boolean, min = 0.7): number => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!active) return undefined;

    const read = (): void => {
      const stage = document.querySelector('[data-player-stage]');
      const u = stage ? Number.parseFloat(getComputedStyle(stage).getPropertyValue('--u')) : 1;
      setScale(Number.isFinite(u) && u > 0 ? Math.min(1, Math.max(min, u)) : 1);
    };

    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [active, min]);

  return scale;
};
