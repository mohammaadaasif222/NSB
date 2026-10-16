import type { FC } from 'react';
import { COIN_MARKS, CURRENCY_FLAGS } from '@/constants/currencyArt';

interface Props {
  /** ISO or coin code — USD, BTC. */
  code: string;
  /** Drawn when there is no artwork for the code: "$", "₿". */
  symbol?: string;
  /** `flag` for a display currency, `coin` for a wallet asset. */
  kind: 'flag' | 'coin';
  /** Size and any extra classes; the mark fills it. */
  className?: string;
}

/**
 * A currency's round mark, as the designs draw them: a fiat's flag in a
 * hairline ring (the currency picker), or a coin's badge (My Assets). Codes
 * the design has no artwork for get the picker's other style — the symbol on
 * a dark disc — rather than a broken image.
 */
const CurrencyMark: FC<Props> = ({ code, symbol, kind, className = '' }) => {
  const art = (kind === 'flag' ? CURRENCY_FLAGS : COIN_MARKS)[code.toUpperCase()];

  if (art) {
    return (
      <img
        src={art.src}
        alt=""
        draggable={false}
        // The design's 1px inside stroke on a flag, drawn over the picture.
        className={`shrink-0 rounded-full object-cover ${
          kind === 'flag' ? 'outline outline-1 -outline-offset-1 outline-white/20' : ''
        } ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#252937] text-[11px] font-medium leading-none text-[#f0f1f5] ${className}`}
    >
      {symbol ?? code.slice(0, 1)}
    </span>
  );
};

export default CurrencyMark;
