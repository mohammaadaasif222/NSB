import { useEffect, useState } from 'react';

/**
 * Whether a media query matches, kept current as the viewport changes.
 *
 * False on the server and on the first client render, so both agree; the
 * real answer arrives straight after mount.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = (): void => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
};

/** The layout's desktop breakpoint — Tailwind's `lg`. */
export const DESKTOP_QUERY = '(min-width: 1024px)';
