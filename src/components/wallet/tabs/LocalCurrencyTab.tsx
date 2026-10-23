import { useState, useEffect, useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { useMe } from '@/context/UserContext';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { createD24Deposit, getDisplayCurrencies, getD24PaymentMethods } from '@/services/wallet';
import { useChangellyBuyCrypto } from '@/hooks/useChangellyBuyCrypto';
import api from '@/services/api';
import D24EmbeddedDeposit from './D24EmbeddedDeposit';
import D24CheckoutModal from './D24CheckoutModal';
import Button from '@/components/ui/Button';
import WalletField, {
  WALLET_GHOST_BUTTON,
  WALLET_INPUT,
  WALLET_NOTE,
  WALLET_PILL,
  WALLET_VALUE,
} from '../shared/WalletField';
import WalletSelect from '../shared/WalletSelect';
import PaymentMethodGrid from '../shared/PaymentMethodGrid';

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
// D24 payment method codes that support embedded checkout (without redirect URL)
// Includes both standard names and D24's actual code variations (e.g., "IX" for PIX)
const EMBEDDED_METHODS = ['PIX', 'IX', 'ACH', 'SEPA', 'NEFT', 'WIRE', 'FASTER_PAYMENTS', 'UPI'];

const LocalCurrencyTab: FC = () => {
  const { t } = useTranslation();
  // On a 428 it asks for the one-time code and resubmits.
  const { run } = useSeonGuard();
  const { me } = useMe();
  const { offers, loadingOffers, fetchOffers, createOrder, creatingOrder } =
    useChangellyBuyCrypto();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [displayCurrencies, setDisplayCurrencies] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [depositMode, setDepositMode] = useState<
    'selection' | 'payer-form' | 'embedded' | 'iframe' | null
  >(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [d24CheckoutUrl, setD24CheckoutUrl] = useState<string | null>(null);
  const [useChangellyFallback, setUseChangellyFallback] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [offersAmountCached, setOffersAmountCached] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Payer information state (for embedded D24 deposits)
  const [payer, setPayer] = useState({
    document: '',
    document_type: '',
    first_name: me?.first_name || '',
    last_name: me?.last_name || '',
    email: me?.email || '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  // Country-specific document types
  const [countryDocumentTypes, setCountryDocumentTypes] = useState<any[]>([]);
  const [loadingDocTypes, setLoadingDocTypes] = useState(false);

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

  // Fetch country-specific document types when payer form opens
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      if (depositMode !== 'payer-form' || !displayCurrencies.length) return;

      setLoadingDocTypes(true);
      try {
        // Get country code from display currency
        const selectedCurrency = displayCurrencies.find((c) => c.code === currency);
        const countryCode = selectedCurrency?.country_code;

        if (!countryCode) {
          console.warn('[D24] No country code found for currency:', currency);
          return;
        }

        const response = (await api.get(
          `/wallet/deposit/d24/document-types?country=${countryCode}`
        )) as any;
        const docConfig = response?.data?.data;

        if (docConfig) {
          setCountryDocumentTypes(docConfig.document_types || []);
          console.log('[D24] Document types loaded for country:', countryCode, docConfig);
        }
      } catch (error) {
        console.error('[D24] Error fetching document types:', error);
        setCountryDocumentTypes([]);
      } finally {
        setLoadingDocTypes(false);
      }
    };

    fetchDocumentTypes();
  }, [depositMode, currency, displayCurrencies]);

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
          await fetchOffers(FALLBACK_AMOUNT, currency, 'ETH', country, state);
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
    const isD24Method = selectedMethodInfo?.provider === 'D24';

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
        await fetchOffers(Number(newAmount), currency, 'ETH', country, state);

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

    if (
      !selectedPaymentMethod ||
      !currency ||
      !toAddress ||
      !selectedNetwork ||
      offers.length === 0
    ) {
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
        setIframeUrl(order.iframeUrl ?? null);
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
    setDepositMode(null);
    // Reset payer form
    setPayer({
      document: '',
      document_type: '',
      first_name: me?.first_name || '',
      last_name: me?.last_name || '',
      email: me?.email || '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
    });
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

    // Determine if we should use embedded deposit or iframe fallback
    const method = (selectedMethod || '').toUpperCase();

    // Check if method contains any of the embedded method keywords
    const useEmbedded = EMBEDDED_METHODS.some((embeddedMethod) => method.includes(embeddedMethod));

    console.log(
      '[D24] handleDeposit - selectedMethod:',
      selectedMethod,
      'normalized:',
      method,
      'useEmbedded:',
      useEmbedded,
      'EMBEDDED_METHODS:',
      EMBEDDED_METHODS
    );

    if (useEmbedded) {
      // For embedded deposits, show payer form first
      console.log('[D24] Using embedded deposit for method:', method);
      setDepositMode('payer-form');
      setShowAmountInput(false);
      return;
    }

    // Fallback to iframe for CARD or other hosted checkout methods
    console.log('[D24-CARD] Using iframe checkout for method:', method);
    console.log('[D24-CARD] Amount:', amount, 'Currency:', currency, 'Method:', selectedMethod);

    setDepositMode('iframe');
    setLoading(true);

    try {
      console.log('[D24-CARD] Requesting hosted checkout from D24...');

      const res = await run((headers) =>
        createD24Deposit({ amount, currency, payment_method: selectedMethod }, headers)
      );

      console.log('[D24-CARD] Response received:', res);

      // D24 API response can have nested data structure
      const responseData = (res?.data?.data || res?.data) as any;

      if (!responseData) {
        console.error('[D24-CARD] No response data received');
        throw new Error('Empty response from server');
      }

      const checkoutAddress = responseData?.address || responseData?.checkout_url;

      console.log('[D24-CARD] Checkout URL:', checkoutAddress ? '✓ Received' : '✗ Missing');
      console.log('[D24-CARD] Deposit ID:', responseData?.deposit_id);
      console.log('[D24-CARD] Checkout Type:', responseData?.checkout_type);

      if (checkoutAddress) {
        console.log('[D24-CARD] ✓ Showing D24 hosted checkout in iframe');
        toast.info('Opening payment page...');

        // Store deposit info for reference
        sessionStorage.setItem(
          'd24_current_deposit',
          JSON.stringify({
            method: selectedMethod,
            amount,
            currency,
            depositId: responseData?.deposit_id,
            timestamp: new Date().toISOString(),
          })
        );

        setCheckoutUrl(checkoutAddress);
        setShowAmountInput(false);
      } else {
        console.error('[D24-CARD] ✗ No checkout URL in response', responseData);
        toast.error('Failed to load payment page. Please try again.');
        setDepositMode(null);
      }
    } catch (err: any) {
      if (isStepUpCancelled(err)) {
        setDepositMode(null);
        return;
      }
      console.error('[D24-CARD] ✗ Error:', err);

      let errorMessage = 'Payment request failed. Please try again.';

      if (err?.response?.status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid payment information';
      } else if (err?.response?.status === 503) {
        errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
      } else if (err?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      console.error('[D24-CARD] Final error message:', errorMessage);
      toast.error(errorMessage);
      setDepositMode(null);
    } finally {
      setLoading(false);
    }
  };

  // Get the selected payment method object for displaying its info
  const getSelectedMethodInfo = () => {
    return paymentMethods.find((m) => m.code === selectedMethod);
  };

  // Handle payer form submission - validate and proceed to embedded deposit
  const handlePayerFormSubmit = () => {
    if (!payer.first_name) {
      toast.error('First name is required');
      return;
    }
    if (!payer.last_name) {
      toast.error('Last name is required');
      return;
    }
    if (!payer.email) {
      toast.error('Email is required');
      return;
    }
    // Document type + id are required for every D24 country we accept
    // deposits from — the gateway rejects the embedded flow without them,
    // and showing the error here is friendlier than surfacing a provider
    // error after the user has already loaded the checkout iframe.
    if (!payer.document_type?.trim()) {
      toast.error('Document type is required');
      return;
    }
    if (!payer.document?.trim()) {
      toast.error('Document ID is required');
      return;
    }

    console.log('[D24] Payer form validated, moving to embedded deposit with payer:', payer);
    // Move to embedded deposit mode - D24EmbeddedDeposit will fetch payment details with payer info
    setDepositMode('embedded');
  };

  // Render checkout in portal (separate from wallet modal) - Responsive for mobile, tablet, desktop
  const checkoutPortal =
    checkoutUrl &&
    createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Modal container - Responsive width and height */}
        <div className="relative w-full h-full sm:h-[85vh] md:h-[80vh] md:w-[80vw] lg:w-[64vw] bg-[#0e1218] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-full">
          {/* Close button - Responsive size */}
          <button
            onClick={handleGoBack}
            disabled={loading}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-[#c8ccd8] hover:text-[#f0f1f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-[#1b1f29]/80 hover:bg-[#252937] p-1.5 sm:p-2 rounded-full"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
                <svg
                  className="w-8 h-8 animate-spin text-[#f9d028] mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                <p className="text-sm text-[#c8ccd8] mt-2">{t('acct.buy.processing')}</p>
              </div>
            </div>
          )}
        </div>
      </div>,
      document.body
    );

  // Render Changelly iframe portal
  const changellyPortal =
    iframeUrl &&
    createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Modal container - Responsive width and height */}
        <div className="relative w-full h-full sm:h-[85vh] md:h-[80vh] md:w-[80vw] lg:w-[64vw] bg-[#0e1218] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-full">
          {/* Close button - Responsive size */}
          <button
            onClick={handleGoBack}
            disabled={creatingOrder}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-[#c8ccd8] hover:text-[#f0f1f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-[#1b1f29]/80 hover:bg-[#252937] p-1.5 sm:p-2 rounded-full"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
                <svg
                  className="w-8 h-8 animate-spin text-[#f9d028] mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                <p className="text-sm text-[#c8ccd8] mt-2">Processing...</p>
              </div>
            </div>
          )}
        </div>
      </div>,
      document.body
    );

  // Payer information form (for embedded D24 deposits)
  if (depositMode === 'payer-form') {
    const docType = countryDocumentTypes.find((d: any) => d.code === payer.document_type);

    return (
      <div>
        {/* What is being deposited, and how. */}
        <div className={`${WALLET_PILL} justify-between`}>
          <span className="truncate text-[16px] leading-6 text-[#9da2b4]">
            {t('acct.local.depositOf', { method: selectedMethod ?? '' })}
          </span>
          <span className={`shrink-0 tabular-nums ${WALLET_VALUE}`}>
            {amount} {currency}
          </span>
        </div>

        <p className="mt-4 text-center text-[14px] leading-5 text-[#9da2b4]">
          {t('acct.local.completeProfileHint')}
        </p>

        <div className="mt-4 space-y-3.5">
          {/* Document Type - Dynamically loaded based on country. Required: D24 rejects the embedded flow without it. */}
          <WalletField
            htmlFor="payer-doc-type"
            label={`${t('acct.local.documentType')} *`}
            hint={docType?.validation}
          >
            {loadingDocTypes ? (
              <div className={WALLET_PILL}>
                <span className="text-[16px] leading-6 text-[#9da2b4]">{t('common.loading')}</span>
              </div>
            ) : countryDocumentTypes.length > 0 ? (
              <WalletSelect
                id="payer-doc-type"
                options={countryDocumentTypes.map((d: any) => ({
                  value: d.code as string,
                  label: d.name as string,
                  detail: d.code as string,
                }))}
                value={payer.document_type}
                onChange={(v) => setPayer({ ...payer, document_type: v })}
                placeholder={t('acct.local.selectDocType')}
              />
            ) : (
              <div className={WALLET_PILL}>
                <input
                  id="payer-doc-type"
                  value={payer.document_type}
                  onChange={(e) => setPayer({ ...payer, document_type: e.target.value })}
                  placeholder={t('acct.local.selectDocType')}
                  className={WALLET_INPUT}
                />
              </div>
            )}
          </WalletField>

          <WalletField
            htmlFor="payer-doc"
            label={`${t('acct.local.documentId')} *`}
            hint={docType?.example}
          >
            <div className={WALLET_PILL}>
              <input
                id="payer-doc"
                value={payer.document}
                onChange={(e) => setPayer({ ...payer, document: e.target.value })}
                placeholder={t('acct.local.documentPlaceholder')}
                className={WALLET_INPUT}
              />
            </div>
          </WalletField>

          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-[21px]">
            <WalletField htmlFor="payer-first" label={`${t('auth.firstName')} *`}>
              <div className={WALLET_PILL}>
                <input
                  id="payer-first"
                  value={payer.first_name}
                  onChange={(e) => setPayer({ ...payer, first_name: e.target.value })}
                  placeholder={t('acct.local.enterName')}
                  autoComplete="given-name"
                  className={WALLET_INPUT}
                />
              </div>
            </WalletField>
            <WalletField htmlFor="payer-last" label={`${t('auth.lastName')} *`}>
              <div className={WALLET_PILL}>
                <input
                  id="payer-last"
                  value={payer.last_name}
                  onChange={(e) => setPayer({ ...payer, last_name: e.target.value })}
                  placeholder={t('acct.local.enterName')}
                  autoComplete="family-name"
                  className={WALLET_INPUT}
                />
              </div>
            </WalletField>
          </div>

          <WalletField htmlFor="payer-email" label={t('auth.email')}>
            <div className={WALLET_PILL}>
              <input
                id="payer-email"
                type="email"
                value={payer.email}
                onChange={(e) => setPayer({ ...payer, email: e.target.value })}
                placeholder="your@email.com"
                autoComplete="email"
                className={WALLET_INPUT}
              />
            </div>
          </WalletField>
        </div>

        <Button
          type="button"
          fullWidth
          onClick={handlePayerFormSubmit}
          disabled={loading}
          className="mt-[23px]"
        >
          {loading ? t('acct.local.fetchingDetails') : t('acct.wallet.tabDeposit')}
        </Button>

        <button
          type="button"
          onClick={handleGoBack}
          disabled={loading}
          className={`${WALLET_GHOST_BUTTON} mt-3`}
        >
          {t('auth.back')}
        </button>
      </div>
    );
  }

  // Embedded D24 deposit UI
  if (depositMode === 'embedded') {
    return (
      <>
        <D24EmbeddedDeposit
          amount={amount}
          currency={currency}
          paymentMethod={selectedMethod || ''}
          payer={payer}
          onBack={handleGoBack}
          onHostedCheckout={(url) => setD24CheckoutUrl(url)}
        />
        {d24CheckoutUrl && (
          <D24CheckoutModal redirectUrl={d24CheckoutUrl} onClose={() => setD24CheckoutUrl(null)} />
        )}
      </>
    );
  }

  if (checkoutUrl) {
    return checkoutPortal;
  }

  if (iframeUrl) {
    return changellyPortal;
  }

  const currencyOptions = (
    displayCurrencies.length > 0 ? displayCurrencies : [{ code: 'USD', name: 'US Dollar' }]
  ).map((c: any) => ({
    value: c.code as string,
    label: c.code as string,
    detail: c.name as string,
  }));
  const sign = displayCurrencies.find((c) => c.code === currency)?.symbol || '$';
  const noMethods = (
    <p className={`${WALLET_NOTE} py-8 text-center`}>
      {t('acct.local.noMethods', { currency: currency || '—' })}
    </p>
  );

  return (
    <div>
      {/* The design's screen: Currency, then the Deposit Method tiles, 16
          apart. The amount follows once a method is picked. */}
      {!showAmountInput && (
        <div className="space-y-4">
          <WalletField htmlFor="local-currency" label={t('pref.currency')}>
            {loadingCurrencies ? (
              <div className={WALLET_PILL}>
                <span className="text-[16px] leading-6 text-[#9da2b4]">{t('common.loading')}</span>
              </div>
            ) : (
              <WalletSelect
                id="local-currency"
                options={currencyOptions}
                value={currency}
                onChange={setCurrency}
                placeholder={t('acct.wallet.selectCurrency')}
              />
            )}
          </WalletField>

          {loadingMethods ? (
            <p className={`${WALLET_NOTE} py-8 text-center`}>{t('acct.local.loadingMethods')}</p>
          ) : paymentMethods.length > 0 ? (
            <PaymentMethodGrid
              label={t('acct.local.depositMethod')}
              methods={paymentMethods.map((m) => ({ key: m.code, name: m.name, logo: m.logo }))}
              selected={selectedMethod ?? undefined}
              onSelect={handleMethodSelect}
              disabled={loading}
            />
          ) : useChangellyFallback ? (
            loadingOffers ? (
              <p className={`${WALLET_NOTE} py-8 text-center`}>{t('acct.local.loadingMethods')}</p>
            ) : offers.length > 0 && offers[0]?.paymentMethodOffer ? (
              <PaymentMethodGrid
                label={t('acct.local.depositMethod')}
                methods={offers[0].paymentMethodOffer.map((method) => {
                  const info = PAYMENT_METHOD_LOGOS[method.method.toLowerCase()];
                  return {
                    key: method.method,
                    name: info?.name ?? method.methodName,
                    logo: info?.logo,
                  };
                })}
                selected={selectedPaymentMethod ?? undefined}
                onSelect={handleChangellyFallback}
                disabled={creatingOrder}
              />
            ) : (
              noMethods
            )
          ) : (
            noMethods
          )}
        </div>
      )}

      {/* Amount - shown only after a payment method is picked (D24 or Changelly) */}
      {showAmountInput && (selectedMethod || (selectedPaymentMethod && useChangellyFallback)) && (
        <div>
          {/* The method picked, with the way back to the tiles. */}
          {(() => {
            const info =
              useChangellyFallback && selectedPaymentMethod
                ? PAYMENT_METHOD_LOGOS[selectedPaymentMethod.toLowerCase()]
                : getSelectedMethodInfo();
            if (!info) return null;
            return (
              <WalletField label={t('acct.local.paymentMethod')}>
                <div className={WALLET_PILL}>
                  {info.logo && (
                    <img src={info.logo} alt="" className="h-8 w-12 shrink-0 object-contain" />
                  )}
                  <span className={`min-w-0 flex-1 truncate ${WALLET_VALUE}`}>
                    {info.name || info.methodName}
                  </span>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    disabled={loading}
                    className="shrink-0 text-[14px] font-medium leading-5 text-[#ffe779] hover:underline disabled:opacity-50"
                  >
                    {t('profile.change')}
                  </button>
                </div>
              </WalletField>
            );
          })()}

          <div className="mt-3.5">
            <WalletField htmlFor="local-amount" label={t('acct.wallet.amountIn', { currency })}>
              <div className={WALLET_PILL}>
                <input
                  id="local-amount"
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
                  className={`${WALLET_INPUT} tabular-nums`}
                />
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[18px] font-bold leading-6 text-[#9da2b4]"
                >
                  {sign}
                </span>
              </div>
            </WalletField>
          </div>

          {/* Changelly Fallback: Show only errors, not offer details */}
          {useChangellyFallback && amount && Number(amount) > 0 && offers[0]?.errorType && (
            <div className="mt-3 rounded-[20px] border border-[#e33827]/25 bg-[#e33827]/10 px-4 py-2.5 text-[13px] leading-5 text-[#e33827]">
              <p className="font-semibold">
                {offers[0].errorType === 'limits'
                  ? t('acct.local.amountLimit')
                  : offers[0].errorType === 'currency'
                    ? t('acct.local.exchangeUnavailable')
                    : t('acct.local.error')}
              </p>
              <p>{offers[0].errorMessage}</p>
              {offers[0].errorType === 'limits' &&
                offers[0].errorDetails?.map((detail: any) => (
                  <p key={detail.cause}>
                    {detail.cause === 'min' &&
                      t('acct.local.min', { amount: `${detail.value} ${currency}` })}
                    {detail.cause === 'max' &&
                      t('acct.local.max', { amount: `${detail.value} ${currency}` })}
                  </p>
                ))}
            </div>
          )}

          {/* Continue/Deposit button - Label depends on payment flow */}
          {(() => {
            const hasError = useChangellyFallback && offers.length > 0 && !!offers[0]?.errorType;
            const isChangellyLoading = useChangellyFallback && loadingOffers;
            // For Changelly: disable if amount changed from cached amount (user is editing)
            const amountChanged = useChangellyFallback && amount !== offersAmountCached;
            const isDisabled =
              loading ||
              creatingOrder ||
              isChangellyLoading ||
              !amount ||
              Number(amount) <= 0 ||
              hasError ||
              amountChanged;
            const isProcessing = loading || creatingOrder || isChangellyLoading;

            // Check if this is an embedded method (needs payer form next)
            const method = selectedMethod?.toUpperCase() || '';
            const isEmbeddedMethod = EMBEDDED_METHODS.some((m) => method.includes(m));

            return (
              <Button
                type="button"
                fullWidth
                onClick={useChangellyFallback ? handleChangellyDeposit : handleDeposit}
                disabled={isDisabled}
                className="mt-[23px]"
              >
                {isProcessing
                  ? isChangellyLoading
                    ? t('acct.local.calculating')
                    : t('acct.buy.processing')
                  : isEmbeddedMethod
                    ? t('registerModal.continue')
                    : t('acct.wallet.tabDeposit')}
              </Button>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default LocalCurrencyTab;
