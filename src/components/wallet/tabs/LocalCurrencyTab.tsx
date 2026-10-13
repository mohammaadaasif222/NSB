import { useState, useEffect, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { createD24Deposit, getD24Currencies } from '@/services/wallet';

/** Currencies offered in the picker, with the English name as a fallback label. */
const LOCAL_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
];

/** Localised currency name, falling back to the English one when Intl cannot help. */
const currencyName = (code: string, fallback: string, locale: string): string => {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Fiat (Local Currency) deposit tab - D24 Hosted Checkout.
 *
 * Simple flow:
 *   1. Player enters deposit amount
 *   2. Selects fiat currency (USD, EUR, GBP, INR, BRL)
 *   3. Click "Start Deposit" → D24 hosted page opens
 *   4. D24 shows all payment methods for that currency
 *   5. Player completes payment on D24's page
 *   6. D24 webhook updates balance automatically
 *
 * No hardcoded currency list - D24 API returns supported currencies dynamically.
 */
const LocalCurrencyTab: FC = () => {
  const { t, locale } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getD24Currencies();
        const currencyList = response?.data && response.data.length > 0 ? response.data : [
          { code: 'BRL', name: 'Brazilian Real', min_deposit: '10', min_payout: '10', deposit_fee_percent: '0', payout_fee_percent: '1.5', precision: 2, methods: [] }
        ];
        // Set default to first available currency
        setCurrency(currencyList[0].code);
      } catch (error) {
        console.error('Failed to fetch D24 currencies:', error);
        // Use BRL as fallback
        setCurrency('BRL');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('acct.wallet.invalidAmount'));
      return;
    }

    setLoading(true);
    try {
      const res = await createD24Deposit({
        amount,
        currency,
      });

      console.log('[D24] Response received:', res);
      console.log('[D24] Full data:', JSON.stringify(res?.data));

      // D24 API response can have nested data structure: res.data.data.address or res.data.address
      const redirectUrl = res?.data?.data?.address || res?.data?.address;

      if (redirectUrl) {
        console.log('[D24] Redirecting to:', redirectUrl);
        // Redirect to D24 hosted checkout page
        window.location.href = redirectUrl;
      } else {
        console.error('[D24] No redirect URL in response. Data:', res?.data);
        toast.error(t('acct.wallet.depositNoUrl'));
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: string }).message)
          : t('acct.wallet.depositFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Amount input */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          {t('acct.buy.amount')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400 text-sm font-semibold">
            {currency === 'USD' && '$'}
            {currency === 'EUR' && '€'}
            {currency === 'GBP' && '£'}
            {currency === 'INR' && '₹'}
            {currency === 'BRL' && 'R$'}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={t('acct.wallet.enterAmountPlain')}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Currency selector */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          {t('pref.currency')}
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={loadingCurrencies}
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {LOCAL_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} - {currencyName(c.code, c.name, locale)}
            </option>
          ))}
        </select>
      </div>

      {/* Start Deposit button */}
      <button
        type="button"
        onClick={handleDeposit}
        disabled={loading || loadingCurrencies || !amount || Number(amount) <= 0 || !currency}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
          loading || loadingCurrencies || !amount || Number(amount) <= 0 || !currency
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/30'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('acct.buy.processing')}
          </span>
        ) : (
          t('acct.wallet.startDeposit')
        )}
      </button>

      {/* Info message */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="text-xs text-blue-200 flex gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            />
          </svg>
          <span>{t('acct.wallet.d24Note')}</span>
        </div>
      </div>
    </div>
  );
};

export default LocalCurrencyTab;
