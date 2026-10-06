import type { FC } from 'react';
import type { StaticImageData } from 'next/image';
import type { FlagCountry } from '@/constants/flags';
import gb from '@/assets/flags/gb.svg';
import sa from '@/assets/flags/sa.svg';
import tr from '@/assets/flags/tr.svg';
import inFlag from '@/assets/flags/in.svg';
import fr from '@/assets/flags/fr.svg';
import ru from '@/assets/flags/ru.svg';
import pt from '@/assets/flags/pt.svg';
import es from '@/assets/flags/es.svg';
import it from '@/assets/flags/it.svg';

/**
 * Every flag, imported statically.
 *
 * Deliberately not `import()` per flag. A static import of an SVG puts only
 * its URL in the bundle — the file itself is still fetched by the <img>, and
 * only where a flag is shown — so lazy chunks saved nothing. They did add a
 * failure mode: one chunk request failing (a dev rebuild, a flaky network, a
 * tunnel) left that flag a blank disc until a full reload, and the language
 * menus showed nine empty circles.
 *
 * `satisfies` keeps this in step with FLAG_COUNTRIES: a code added there
 * without its file here is a type error.
 */
const FLAGS = {
  GB: gb,
  SA: sa,
  TR: tr,
  IN: inFlag,
  FR: fr,
  RU: ru,
  PT: pt,
  ES: es,
  IT: it,
} satisfies Record<FlagCountry, StaticImageData>;

interface CountryFlagProps {
  country: FlagCountry;
  /** Diameter in px. */
  size?: number;
  className?: string;
}

/** A round country flag. */
const CountryFlag: FC<CountryFlagProps> = ({ country, size = 22, className = '' }) => (
  <span
    aria-hidden="true"
    className={`inline-block shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 ${className}`}
    style={{ width: size, height: size }}
  >
    {/* A plain <img>: next/image has nothing to optimise in a tiny SVG. */}
    <img
      src={FLAGS[country].src}
      alt=""
      width={size}
      height={size}
      className="h-full w-full object-cover"
    />
  </span>
);

export default CountryFlag;
