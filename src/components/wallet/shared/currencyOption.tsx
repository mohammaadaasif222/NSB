import CurrencyMark from './CurrencyMark';
import { countryNameFor } from './countryName';
import type { WalletOption } from './WalletSelect';

interface FiatLike {
  code: string;
  symbol?: string;
  country_code?: string | null;
}

/**
 * One row of a local-currency dropdown: the country's flag, the code, and the
 * country's name at the end. The flags are the wallet's own (CURRENCY_FLAGS);
 * a currency with none gets the symbol on a disc.
 */
export const currencyOption = (c: FiatLike, locale: string): WalletOption<string> => ({
  value: c.code,
  label: c.code,
  detail: countryNameFor(c.code, c.country_code, locale),
  icon: <CurrencyMark kind="flag" code={c.code} symbol={c.symbol} className="h-6 w-6" />,
});
