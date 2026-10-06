import { useEffect, useState, type FC } from 'react';
import type { FlagCountry } from '@/constants/flags';

/**
 * A round country flag.
 *
 * The SVG is imported on demand by its code: webpack turns the template
 * below into one small chunk per file in assets/flags, so a page only
 * fetches the flags it actually shows. Each resolved URL is cached, so a
 * flag seen once renders immediately everywhere after.
 */

const cache = new Map<FlagCountry, string>();
const pending = new Map<FlagCountry, Promise<string>>();

const loadFlag = (country: FlagCountry): Promise<string> => {
  const cached = cache.get(country);
  if (cached) return Promise.resolve(cached);

  let request = pending.get(country);
  if (!request) {
    request = import(`../../assets/flags/${country.toLowerCase()}.svg`).then(
      (mod: { default: { src: string } | string }) => {
        const src = typeof mod.default === 'string' ? mod.default : mod.default.src;
        cache.set(country, src);
        pending.delete(country);
        return src;
      }
    );
    pending.set(country, request);
  }
  return request;
};

interface CountryFlagProps {
  country: FlagCountry;
  /** Diameter in px. */
  size?: number;
  className?: string;
}

const CountryFlag: FC<CountryFlagProps> = ({ country, size = 22, className = '' }) => {
  const [src, setSrc] = useState<string | undefined>(() => cache.get(country));

  useEffect(() => {
    let active = true;
    setSrc(cache.get(country));
    loadFlag(country)
      .then((url) => active && setSrc(url))
      .catch(() => undefined); // leaves the neutral disc
    return () => {
      active = false;
    };
  }, [country]);

  return (
    // The disc holds its size while the SVG loads, so nothing shifts.
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 ${className}`}
      style={{ width: size, height: size }}
    >
      {src && (
        // A plain <img>: next/image has nothing to optimise in a tiny SVG.
        <img src={src} alt="" width={size} height={size} className="h-full w-full object-cover" />
      )}
    </span>
  );
};

export default CountryFlag;
