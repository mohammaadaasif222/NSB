import { useState, useEffect, useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { useMe } from '@/context/UserContext';
import { createD24Deposit, getDisplayCurrencies, getD24PaymentMethods } from '@/services/wallet';
import { useChangellyBuyCrypto } from '@/hooks/useChangellyBuyCrypto';
import api from '@/services/api';

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
// Payment method logo mapping (same as BuyCryptoTab)
const PAYMENT_METHOD_LOGOS: Record<string, { name: string; logo: string }> = {
  card: { name: 'Visa / Mastercard', logo: '/payment-logos/visa.png' },
  google_pay: { name: 'Google Pay', logo: '/payment-logos/gpay.png' },
  apple_pay: { name: 'Apple Pay', logo: '/payment-logos/apay.png' },
  pay_pal: { name: 'PayPal', logo: '/payment-logos/paypal.png' },
  ebay: { name: 'eBay', logo: '/payment-logos/ebay.png' },
  mastercard: { name: 'Mastercard', logo: '/payment-logos/mastercard.png' },
};

const FALLBACK_AMOUNT = 5000; // Default demo amount for initial offers

const LocalCurrencyTab: FC = () => {
  const { t } = useTranslation();
  const { me } = useMe();
  const { offers, loadingOffers, fetchOffers, createOrder, creatingOrder } = useChangellyBuyCrypto();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [displayCurrencies, setDisplayCurrencies] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [useChangellyFallback, setUseChangellyFallback] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [offersAmountCached, setOffersAmountCached] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Fetch wallet address for Changelly fallback
  useEffect(() => {
    const fetchAddress = async () => {
      if (!me) return;

      try {
        // Fetch currency details to get available networks
        const currencyResponse = await api.get<{
          code: string;
          name: string;
          networks: Array<{ code: string; name: string }>;
        }>('/wallet/currencies/ETH');

        const currencyDetails = currencyResponse?.data;
        const defaultNetwork = currencyDetails?.networks?.[0];

        if (!defaultNetwork) {
          setToAddress(`deposit_ETH_${me.id}`);
          return;
        }

        // Fetch deposit address
        const addressResponse = await api.post<{
          address: string;
          currency_code: string;
          network_code: string;
        }>('/wallet/deposit/address', {
          currency: 'ETH',
          network: defaultNetwork.code,
        });

        const address = addressResponse?.data?.address;
        const networkCode = addressResponse?.data?.network_code;
        setToAddress(address || null);
        setSelectedNetwork(networkCode || null);
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
        setToAddress(`deposit_ETH_${me.id}`);
      }
    };

    if (useChangellyFallback && me) {
      fetchAddress();
    }
  }, [useChangellyFallback, me]);

  // Fetch payment methods when currency changes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!currency) return;

      setLoadingMethods(true);
      setPaymentMethods([]);
      setSelectedMethod(null);
      setUseChangellyFallback(false);

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
          // No D24 methods available - fetch Changelly offers as fallback
          setUseChangellyFallback(true);

          // Get country and state for Changelly API (US needs state)
          const country = selectedCurrency?.country_code || 'US';
          const state = country === 'US' ? 'CA' : undefined;

          // Fetch Changelly offers for ETH with default amount
          await fetchOffers(
            FALLBACK_AMOUNT,
            currency,
            'ETH',
            country,
            state
          );
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        setPaymentMethods([]);
        // On error, also try Changelly fallback
        setUseChangellyFallback(true);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [currency, displayCurrencies, fetchOffers]);

  // Listen for iframe messages (D24 payment completion)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin (only for production, can be more permissive for dev)
      if (event.origin.includes('checkoutogate.com') || event.origin.includes('localhost')) {
        const data = event.data;

        if (data?.type === 'payment_success' || data?.status === 'success') {
          console.log('[D24] Payment successful:', data);
          toast.success('Deposit successful');
          // Close checkout and reset
          setCheckoutUrl(null);
          setShowAmountInput(false);
          setSelectedMethod(null);
          setAmount('');
        } else if (data?.type === 'payment_error' || data?.status === 'error') {
          console.error('[D24] Payment error:', data);
          toast.error(data?.message || 'Payment failed');
        } else if (data?.type === 'payment_cancelled' || data?.status === 'cancelled') {
          console.log('[D24] Payment cancelled');
          setCheckoutUrl(null);
        }
      }
    };

    if (checkoutUrl) {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [checkoutUrl, t]);

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

  // Handle Changelly fallback payment method selection - show amount input with default amount
  const handleChangellyFallback = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowAmountInput(true);
    const defaultAmount = FALLBACK_AMOUNT.toString();
    setAmount(defaultAmount);
    setOffersAmountCached(defaultAmount); // Cache the amount offers were fetched for
  };

  // Handle Changelly fallback amount change - fetch new offers with debounce
  const handleChangellyAmountChange = async (newAmount: string) => {
    setAmount(newAmount);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newAmount || Number(newAmount) <= 0 || !currency || !useChangellyFallback) {
      return;
    }

    // Set new debounce timer (500ms delay)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const selectedCurrency = displayCurrencies.find((c) => c.code === currency);
        const country = selectedCurrency?.country_code || 'US';
        const state = country === 'US' ? 'CA' : undefined;

        // Fetch new offers for the entered amount
        await fetchOffers(
          Number(newAmount),
          currency,
          'ETH',
          country,
          state
        );

        // Update cached amount after successful fetch
        setOffersAmountCached(newAmount);
      } catch (error) {
        console.error('[Changelly Fallback] Error fetching offers:', error);
      }
    }, 500);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle Changelly fallback deposit - create order with entered amount
  const handleChangellyDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    if (!selectedPaymentMethod || !currency || !toAddress || !selectedNetwork || offers.length === 0) {
      toast.error('Missing required information');
      return;
    }

    try {
      const selectedCurrency = displayCurrencies.find((c) => c.code === currency);
      const country = selectedCurrency?.country_code || 'US';
      const state = country === 'US' ? 'CA' : undefined;

      const order = await createOrder(
        Number(amount),
        currency,
        'ETH',
        offers[0].providerCode,
        country,
        toAddress,
        selectedNetwork,
        selectedPaymentMethod,
        state
      );

      if (order) {
        console.log('[Changelly Fallback] Order created:', order);
        setIframeUrl(order.iframeUrl);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('[Changelly Fallback] Error:', error);
      toast.error('Error creating order');
    }
  };

  // Go back to currency/method selection or from checkout
  const handleGoBack = () => {
    setShowAmountInput(false);
    setSelectedMethod(null);
    setAmount('');
    setCheckoutUrl(null);
    setIframeUrl(null);
    setSelectedPaymentMethod(null);
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
      console.log('[D24] Full response:', JSON.stringify(res, null, 2));
      console.log('[D24] Response data:', JSON.stringify(res?.data, null, 2));

      // D24 API response can have nested data structure
      const responseData = res?.data?.data || res?.data;
      console.log('[D24] Extracted responseData:', JSON.stringify(responseData, null, 2));

      const checkoutAddress = responseData?.address;
      console.log('[D24] Checkout address:', checkoutAddress);
      console.log('[D24] All response fields:', Object.keys(responseData || {}));

      if (checkoutAddress) {
        console.log('[D24] Showing embedded checkout in iframe');
        // Show checkout in iframe
        setCheckoutUrl(checkoutAddress);
        setShowAmountInput(false); // Hide form when showing checkout
      } else {
        console.error('[D24] No checkout URL in response. Full response:', res?.data);
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

  // Render checkout in portal (separate from wallet modal) - Responsive for mobile, tablet, desktop
  const checkoutPortal = checkoutUrl && createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4">
      {/* Modal container - Responsive width and height */}
      <div className="relative w-full h-full sm:h-[85vh] md:h-[80vh] md:w-[80vw] lg:w-[64vw] bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-full">
        {/* Close button - Responsive size */}
        <button
          onClick={handleGoBack}
          disabled={loading}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-slate-300 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-800/80 hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* iframe - no scrollbar */}
        <iframe
          ref={iframeRef}
          src={checkoutUrl}
          className="w-full h-full border-0 overflow-hidden"
          title="D24 Payment Checkout"
          allow="payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-presentation"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-slate-300 mt-2">{t('acct.buy.processing')}</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  // Render Changelly iframe portal
  const changellyPortal = iframeUrl && createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4">
      {/* Modal container - Responsive width and height */}
      <div className="relative w-full h-full sm:h-[85vh] md:h-[80vh] md:w-[80vw] lg:w-[64vw] bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-full">
        {/* Close button - Responsive size */}
        <button
          onClick={handleGoBack}
          disabled={creatingOrder}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-slate-300 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-800/80 hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* iframe - no scrollbar */}
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0 overflow-hidden"
          title="Payment Checkout"
          allow="payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-presentation"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        />

        {/* Loading overlay */}
        {creatingOrder && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-slate-300 mt-2">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  if (checkoutUrl) {
    return checkoutPortal;
  }

  if (iframeUrl) {
    return changellyPortal;
  }

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
                    className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedMethod === method.code
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {method.logo && (
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="w-24 h-24 object-contain"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No D24 Payment Methods - Show Changelly Fallback */}
          {!loadingMethods && paymentMethods.length === 0 && useChangellyFallback && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-3 block">
                Payment Method 
              </label>

              {loadingOffers && (
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
                    <p className="text-sm text-slate-400">Loading payment options...</p>
                  </div>
                </div>
              )}

              {!loadingOffers && offers.length > 0 && offers[0]?.paymentMethodOffer && (
                <div className="grid grid-cols-3 gap-2">
                  {offers[0].paymentMethodOffer.map((method) => {
                    const methodKey = method.method.toLowerCase();
                    const methodInfo = PAYMENT_METHOD_LOGOS[methodKey] || { name: method.methodName, logo: '/payment-logos/default.png' };

                    return (
                      <button
                        key={method.offerId}
                        onClick={() => handleChangellyFallback(method.method)}
                        disabled={creatingOrder}
                        className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedPaymentMethod === method.method
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={methodInfo.logo}
                          alt={methodInfo.name}
                          className="w-24 h-24 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {!loadingOffers && (offers.length === 0 || !offers[0]?.paymentMethodOffer) && (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-slate-400">No payment methods available</p>
                    <p className="text-xs text-slate-500 mt-1">for {currency || 'selected currency'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Payment Methods - Neither D24 nor Changelly */}
          {!loadingMethods && paymentMethods.length === 0 && !useChangellyFallback && (
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

      {/* Amount input section - shown only after payment method is selected (D24 or Changelly) */}
      {showAmountInput && (selectedMethod || (selectedPaymentMethod && useChangellyFallback)) && (
        <div className="space-y-3">
          {/* Selected Method Display */}
          {(() => {
            let methodInfo: any;
            let provider = '';

            if (useChangellyFallback && selectedPaymentMethod) {
              // Changelly fallback method
              const methodKey = selectedPaymentMethod.toLowerCase();
              methodInfo = PAYMENT_METHOD_LOGOS[methodKey];
              provider = offers[0]?.providerCode || 'Changelly';
            } else if (selectedMethod) {
              // D24 method
              methodInfo = getSelectedMethodInfo();
              provider = methodInfo?.provider || 'D24';
            }

            return methodInfo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">Selected Method</p>
                  <p className="text-sm text-slate-100">{methodInfo.name || methodInfo.methodName}</p>
                  <p className="text-xs text-slate-400 mt-1">Provider: {provider}</p>
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
                onChange={(e) => {
                  const newAmount = e.target.value.replace(/[^\d.]/g, '');
                  if (useChangellyFallback) {
                    handleChangellyAmountChange(newAmount);
                  } else {
                    setAmount(newAmount);
                  }
                }}
                placeholder={t('acct.wallet.enterAmountPlain')}
                className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Changelly Fallback: Show only errors, not offer details */}
          {useChangellyFallback && amount && Number(amount) > 0 && offers.length > 0 && (() => {
            const firstOffer = offers[0];

            // Check for error in offer
            if (firstOffer?.errorType) {
              return (
                <div className="space-y-2">
                  {/* Error message */}
                  {firstOffer.errorType === 'limits' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">
                      <p className="font-semibold mb-1">⚠️ Amount Limit</p>
                      <p>{firstOffer.errorMessage}</p>
                      {firstOffer.errorDetails && firstOffer.errorDetails.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {firstOffer.errorDetails.map((detail: any) => (
                            <p key={detail.cause}>
                              {detail.cause === 'min' && `Minimum: ${detail.value} ${currency}`}
                              {detail.cause === 'max' && `Maximum: ${detail.value} ${currency}`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {firstOffer.errorType === 'currency' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-300 text-xs">
                      <p className="font-semibold mb-1">⚠️ Exchange Not Available</p>
                      <p>{firstOffer.errorMessage || 'This currency pair is not available'}</p>
                    </div>
                  )}

                  {firstOffer.errorType && firstOffer.errorType !== 'limits' && firstOffer.errorType !== 'currency' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-300 text-xs">
                      <p className="font-semibold mb-1">⚠️ Error</p>
                      <p>{firstOffer.errorMessage}</p>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })()}

          {/* Deposit button */}
          {(() => {
            const hasError = useChangellyFallback && offers.length > 0 && !!offers[0]?.errorType;
            const isChangellyLoading = useChangellyFallback && loadingOffers;
            // For Changelly: disable if amount changed from cached amount (user is editing)
            const amountChanged = useChangellyFallback && amount !== offersAmountCached;
            const isDisabled = loading || creatingOrder || isChangellyLoading || !amount || Number(amount) <= 0 || hasError || amountChanged;
            const isProcessing = loading || creatingOrder || isChangellyLoading;

            return (
              <button
                type="button"
                onClick={useChangellyFallback ? handleChangellyDeposit : handleDeposit}
                disabled={isDisabled}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  isDisabled
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isProcessing ? (
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
                    {isChangellyLoading ? 'Calculating...' : 'Processing...'}
                  </span>
                ) : (
                  'Deposit'
                )}
              </button>
            );
          })()}

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
    </div>
  );
};

export default LocalCurrencyTab;
