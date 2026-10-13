import { useState, useEffect, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { createD24Deposit, getDisplayCurrencies, getD24PaymentMethods } from '@/services/wallet';

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
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [displayCurrencies, setDisplayCurrencies] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAmountInput, setShowAmountInput] = useState(false);

  // Fetch enabled display currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getDisplayCurrencies();
        const enabledCurrencies = response?.data || [];
        setDisplayCurrencies(enabledCurrencies);

        if (enabledCurrencies.length > 0) {
          setCurrency(enabledCurrencies[0].code);
        } else {
          setCurrency('USD');
        }
      } catch (error) {
        console.error('Failed to fetch display currencies:', error);
        setCurrency('USD');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch payment methods when currency changes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!currency) return;

      setLoadingMethods(true);
      setPaymentMethods([]);
      setSelectedMethod(null);

      try {
        // Get country code from display currency data
        const selectedCurrency = displayCurrencies.find((c) => c.code === currency);
        const countryCode = selectedCurrency?.country_code || 'BR';

        const response = await getD24PaymentMethods(countryCode);

        // API returns { success, data: { success, data: [...] }, message, timestamp }
        const methods = (response as any)?.data?.data || (response as any)?.data || [];

        if (Array.isArray(methods) && methods.length > 0) {
          setPaymentMethods(methods);
          // Don't auto-select - user must manually choose a payment method
        } else {
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        setPaymentMethods([]);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [currency, displayCurrencies]);

  // Show amount input only for D24 payment methods
  const handleMethodSelect = (methodCode: string) => {
    const selectedMethodInfo = paymentMethods.find((m) => m.code === methodCode);
    const isD24Method = selectedMethodInfo?.provider === 'D24' ;

    if (!isD24Method) {
      // Handle non-D24 providers (Korapay, Gigadat, etc.)
      handleNonD24MethodSelect(selectedMethodInfo);
      return;
    }

    setSelectedMethod(methodCode);
    setShowAmountInput(true); // Show amount input for D24 methods
    setAmount(''); // Reset amount when method changes
  };

  // Handle non-D24 payment methods (Korapay, Gigadat, etc.)
  const handleNonD24MethodSelect = async (methodInfo: any) => {
    if (!methodInfo || !currency) {
      toast.error('Please select a currency');
      return;
    }

    // TODO: Handle non-D24 provider checkout
    // For now, show a message that this provider is not yet supported
    toast.info(`${methodInfo.name} provider will be implemented soon`);
  };

  // Go back to currency/method selection
  const handleGoBack = () => {
    setShowAmountInput(false);
    setSelectedMethod(null);
    setAmount('');
  };

  // Deposit API call (triggered by deposit button, not automatic)
  const handleDeposit = async () => {
    // Validate all required fields
    if (!amount || Number(amount) <= 0) {
      toast.error(t('acct.wallet.invalidAmount'));
      return;
    }

    if (!currency) {
      toast.error(t('acct.wallet.selectCurrency') || 'Please select a currency');
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const res = await createD24Deposit({
        amount,
        currency,
        payment_method: selectedMethod,
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

  // Get the selected payment method object for displaying its info
  const getSelectedMethodInfo = () => {
    return paymentMethods.find((m) => m.code === selectedMethod);
  };

  return (
    <div className="space-y-4">
      {/* Currency selector + Payment Methods - Hidden when amount input is shown */}
      {!showAmountInput && (
        <>
          {/* Currency selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              {t('pref.currency')}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={loadingCurrencies || displayCurrencies.length === 0}
              className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {displayCurrencies.length > 0 ? (
                displayCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))
              ) : (
                <option value="USD">USD - US Dollar</option>
              )}
            </select>
          </div>

          {/* Payment Methods Loading */}
          {loadingMethods && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-3 block">
                Payment Method
              </label>
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <svg className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-sm text-slate-400">{t('acct.buy.processing')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods selector */}
          {!loadingMethods && paymentMethods.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-3 block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.code}
                    type="button"
                    onClick={() => handleMethodSelect(method.code)}
                    disabled={loadingMethods || loading}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedMethod === method.code
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {method.logo && (
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-xs text-slate-400 text-center line-clamp-1">
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Payment Methods Found */}
          {!loadingMethods && paymentMethods.length === 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-3 block">
                Payment Method
              </label>
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-slate-400">No payment methods available</p>
                  <p className="text-xs text-slate-500 mt-1">for {currency || 'selected currency'}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Amount input section - shown only after payment method is selected */}
      {showAmountInput && selectedMethod && (
        <div className="space-y-3">
          {/* Selected Method Display */}
          {(() => {
            const selectedMethodInfo = getSelectedMethodInfo();
            return selectedMethodInfo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                {selectedMethodInfo.logo && (
                  <img
                    src={selectedMethodInfo.logo}
                    alt={selectedMethodInfo.name}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">Selected Method</p>
                  <p className="text-sm text-slate-100">{selectedMethodInfo.name}</p>
                </div>
              </div>
            ) : null;
          })()}

          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              {t('acct.buy.amount')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 text-sm font-semibold">
                {displayCurrencies.find((c) => c.code === currency)?.symbol || '$'}
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

          {/* Deposit button */}
          <button
            type="button"
            onClick={handleDeposit}
            disabled={loading || !amount || Number(amount) <= 0}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              loading || !amount || Number(amount) <= 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
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
                Processing...
              </span>
            ) : (
              'Deposit'
            )}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={handleGoBack}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Back
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <div className="text-center">
            <svg className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-slate-400">{t('acct.buy.processing')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalCurrencyTab;
