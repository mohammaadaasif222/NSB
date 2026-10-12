import { useMemo, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import type { DisplayFiat } from '@/types';

const SettingsTab: FC = () => {
  const { summary, changePreferences, displayCurrencies } = useWallet();
  const { t, locale } = useTranslation();

  const preferences = summary?.preferences;
  const balance = summary?.balance;
  const displayCurrency = (preferences?.active_currency ?? 'USD') as DisplayFiat;

  // Build fiat symbol map
  const fiatSymbolMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of displayCurrencies) {
      map[row.code] = row.symbol;
    }
    return map;
  }, [displayCurrencies]);

  const switchDisplayCurrency = (next: DisplayFiat): void => {
    void changePreferences({ active_currency: next });
  };

  const formatFiat = (amount: string, code: DisplayFiat): string => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
      NGN: '₦',
      KRW: '₩',
      ...fiatSymbolMap,
    };
    const symbol = symbolMap[code] ?? '';
    const n = Number(amount);
    return `${symbol}${n.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      {/* Display Currency Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          {t('acct.wallet.displayCurrency')}
        </label>
        <select
          value={displayCurrency}
          onChange={(e) => switchDisplayCurrency(e.target.value as DisplayFiat)}
          className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        >
          {displayCurrencies.length === 0
            ? [
                <option key="fallback" value={displayCurrency}>
                  {displayCurrency}
                </option>,
              ]
            : displayCurrencies.map((row) => (
                <option key={row.code} value={row.code}>
                  {row.code}
                </option>
              ))}
        </select>
      </div>

      {/* Info message */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-xs text-amber-100">💡 {t('acct.wallet.displayCurrencyNote')}</p>
      </div>

      {/* Balance Display */}
      {balance ? (
        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-3">
            {t('acct.wallet.yourBalance')}
          </h3>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: currencyDotColour(balance.currency) }}
              />
              <span className="text-sm font-semibold text-slate-100">{balance.currency}</span>
            </div>
            <span className="text-sm font-semibold text-slate-100">
              {formatFiat(balance.display_amount, displayCurrency)}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400 text-center">{t('acct.wallet.noBalance')}</p>
        </div>
      )}
    </div>
  );
};

const currencyDotColour = (code: string): string => {
  const palette = [
    '#f7931a',
    '#627eea',
    '#26a17b',
    '#2775ca',
    '#9945ff',
    '#345d9d',
    '#23292f',
    '#f0b90b',
  ];
  let acc = 0;
  for (let i = 0; i < code.length; i++) acc = (acc + code.charCodeAt(i)) % palette.length;
  return palette[acc];
};

export default SettingsTab;
