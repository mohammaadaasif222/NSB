import { useEffect, useState, useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { useChangellyBuyCrypto, type Cryptocurrency } from '@/hooks/useChangellyBuyCrypto';
import { getDisplayCurrencies } from '@/services/wallet';
import api from '@/services/api';

type BuyCryptoStep = 'step1' | 'step2';

// Fallback currency for initial display
const FALLBACK_FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

/** Localised currency name, falling back to the English one when Intl cannot help. */
const currencyName = (code: string, fallback: string, locale: string): string => {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
};

// Payment method logo mapping
const PAYMENT_METHOD_LOGOS: Record<string, { name: string; logo: string }> = {
  card: { name: 'Visa / Mastercard', logo: '/payment-logos/visa.png' },
  google_pay: { name: 'Google Pay', logo: '/payment-logos/gpay.png' },
  apple_pay: { name: 'Apple Pay', logo: '/payment-logos/apay.png' },
  pay_pal: { name: 'PayPal', logo: '/payment-logos/paypal.png' },
  ebay: { name: 'eBay', logo: '/payment-logos/ebay.png' },
  mastercard: { name: 'Mastercard', logo: '/payment-logos/mastercard.png' },
};

const BuyCryptoTab: FC = () => {
  const { me } = useMe();
  const { t, locale } = useTranslation();
  const {
    cryptos,
    loadingCryptos,
    errorCryptos,
    fetchCryptos,
    offers,
    loadingOffers,
    errorOffers,
    fetchOffers,
    creatingOrder,
    errorCreateOrder,
    createOrder,
  } = useChangellyBuyCrypto();

  // Form state
  const [step, setStep] = useState<BuyCryptoStep>('step1');
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [amount, setAmount] = useState('100');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>(''); // Stores providerCode (not offerId)
  const [selectedOfferId, setSelectedOfferId] = useState<string>(''); // Stores offerId for payment method
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null); // Track selected network
  const [displayCurrencies, setDisplayCurrencies] = useState<any[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(''); // Payment method code (e.g., "card", "google_pay")
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch display currencies on mount
  useEffect(() => {
    const fetchDisplayCurrencies = async () => {
      try {
        const response = await getDisplayCurrencies();
        setDisplayCurrencies(response?.data || []);
        // Set initial fiat currency to first available
        if (response?.data && response.data.length > 0) {
          setFiatCurrency(response.data[0].code);
        }
      } catch (error) {
        console.error('[Changelly] Failed to fetch display currencies:', error);
      }
    };
    fetchDisplayCurrencies();
  }, []);

  // Get country and state based on selected fiat currency from display_currencies table
  const getCountryAndState = () => {
    const currencyData = displayCurrencies.find((c) => c.code === fiatCurrency);
    const country = currencyData?.country_code || 'US';
    const state = country === 'US' ? 'CA' : undefined;
    return { country, state };
  };

  const { country, state } = getCountryAndState();

  // Fetch cryptos on mount
  useEffect(() => {
    fetchCryptos();
  }, [fetchCryptos]);

  // Fetch wallet address when crypto is selected
  useEffect(() => {
    console.log(
      '[Changelly] Address effect triggered - selectedCrypto:',
      selectedCrypto?.code,
      'me:',
      !!me
    );

    if (!selectedCrypto || !me) {
      console.log('[Changelly] Skipping address fetch - missing crypto or user');
      setToAddress(null);
      return;
    }

    console.log('[Changelly] Starting address fetch for:', selectedCrypto.code);
    const fetchAddress = async () => {
      try {
        setFetchingAddress(true);

        // First, fetch currency details to get available networks
        console.log('[Changelly] Fetching currency details for:', selectedCrypto.code);

        const currencyResponse = await api.get<{
          code: string;
          name: string;
          networks: Array<{
            code: string;
            name: string;
          }>;
        }>(`/wallet/currencies/${selectedCrypto.code}`);

        console.log('[Changelly] Currency response:', currencyResponse);

        const currencyDetails = currencyResponse?.data;
        const defaultNetwork = currencyDetails?.networks?.[0];

        console.log(
          '[Changelly] Available networks:',
          currencyDetails?.networks,
          'Default:',
          defaultNetwork
        );

        if (!defaultNetwork) {
          console.error('[Changelly] No networks available for currency:', selectedCrypto.code);
          setToAddress(`deposit_${selectedCrypto.code}_${me.id}`);
          return;
        }

        const token = sessionStorage.getItem('token');
        console.log('[Changelly] Token available:', !!token);
        console.log('[Changelly] Calling POST /wallet/deposit/address with:', {
          currency: selectedCrypto.code,
          network: defaultNetwork.code,
        });

        const addressResponse = await api.post<{
          address: string;
          currency_code: string;
          network_code: string;
        }>('/wallet/deposit/address', {
          currency: selectedCrypto.code,
          network: defaultNetwork.code,
        });

        console.log('[Changelly] Address response:', addressResponse);

        const address = addressResponse?.data?.address;
        const networkCode = addressResponse?.data?.network_code;
        setToAddress(address || null);
        setSelectedNetwork(networkCode || null);
        console.log('[Changelly] Successfully fetched wallet address:', address, 'Network:', networkCode);
      } catch (error: any) {
        console.error('[Changelly] Address fetch error - Full details:', {
          status: error?.status,
          message: error?.message,
          data: error?.data,
          fullError: error,
        });
        // Use placeholder if real address fetch fails
        setToAddress(`deposit_${selectedCrypto.code}_${me.id}`);
        console.warn(
          '[Changelly] Using placeholder address:',
          `deposit_${selectedCrypto.code}_${me.id}`
        );
      } finally {
        setFetchingAddress(false);
      }
    };

    fetchAddress();
  }, [selectedCrypto, me]);

  // Auto-fetch offers when all 3 are selected: amount, fiat currency, and crypto
  useEffect(() => {
    console.log(
      '[Changelly] Offers effect triggered - crypto:',
      selectedCrypto?.code,
      'amount:',
      amount,
      'fiat:',
      fiatCurrency
    );

    if (!selectedCrypto || !amount || Number(amount) <= 0 || !fiatCurrency) {
      console.log('[Changelly] Skipping offers fetch - missing required fields');
      setSelectedProvider('');
      setSelectedOfferId('');
      setSelectedPaymentMethod('');
      setMinAmount(null);
      setMaxAmount(null);
      return;
    }

    console.log('[Changelly] Calling fetchOffers for:', selectedCrypto.code, 'Country:', country);
    fetchOffers(
      Number(amount),
      fiatCurrency,
      selectedCrypto.code,
      country,
      state
    );
  }, [selectedCrypto, amount, fiatCurrency, displayCurrencies, fetchOffers]);

  // Auto-select first provider when offers are fetched
  useEffect(() => {
    if (offers.length > 0 && offers[0].providerCode) {
      setSelectedProvider(offers[0].providerCode);
      // Auto-select first payment method if available
      if (offers[0].paymentMethodOffer && offers[0].paymentMethodOffer.length > 0) {
        const firstMethod = offers[0].paymentMethodOffer[0];
        setSelectedOfferId(firstMethod.offerId);
        setSelectedPaymentMethod(firstMethod.method);
      }
    }
  }, [offers]);

  // Extract min/max amounts from offers or error details
  useEffect(() => {
    if (offers.length > 0) {
      const firstOffer = offers[0];

      // Extract min from error details if present (errorType === 'limits')
      if (firstOffer.errorType === 'limits' && firstOffer.errorDetails && firstOffer.errorDetails.length > 0) {
        const minDetail = firstOffer.errorDetails.find((d: any) => d.cause === 'min');
        const maxDetail = firstOffer.errorDetails.find((d: any) => d.cause === 'max');

        if (minDetail) {
          setMinAmount(Number(minDetail.value));
        }
        if (maxDetail) {
          setMaxAmount(Number(maxDetail.value));
        }
      }

      // Also check for minAmount/maxAmount directly in offer object
      if (firstOffer.minAmount) {
        setMinAmount(Number(firstOffer.minAmount));
      }
      if (firstOffer.maxAmount) {
        setMaxAmount(Number(firstOffer.maxAmount));
      }
    }
  }, [offers]);

  // Handle crypto selection
  const handleSelectCrypto = (crypto: Cryptocurrency) => {
    console.log('[Changelly] Crypto selected:', crypto.code);
    setSelectedCrypto(crypto);
    setShowCryptoDropdown(false);
  };

  // Handle Buy Now → Create order with selected provider
  const handleBuyNow = async () => {
    if (!selectedCrypto || !selectedProvider || !toAddress || !selectedNetwork) return;

    try {
      console.log('[Changelly] Creating order...', { fiatCurrency, country, selectedPaymentMethod, state });
      // Create order with selected provider and payment method
      const order = await createOrder(
        Number(amount),
        fiatCurrency,
        selectedCrypto.code,
        selectedProvider,
        country,
        toAddress,
        selectedNetwork, // Pass the network code (e.g., 'ETHEREUM', 'SOLANA')
        selectedPaymentMethod, // Pass the selected payment method code (e.g., 'card', 'google_pay')
        state, // US: 'CA', Others: undefined
      );

      if (order) {
        console.log('[Changelly] Order created, received URL:', order.iframeUrl);
        setIframeUrl(order.iframeUrl);
        setExpectedAmount(order.expectedAmount);
        console.log('[Changelly] Showing payment iframe in modal');
      }
    } catch (error: any) {
      console.error('[Changelly] Error creating order:', error);
    }
  };

  // Reset to step 1
  const handleReset = () => {
    setStep('step1');
    setSelectedCrypto(null);
    setIframeUrl(null);
    setExpectedAmount(null);
    setSelectedOfferId('');
    setSelectedPaymentMethod('');
  };

  return (
    <div className="min-h-[400px] space-y-4">
      {/* Step 1: Amount & Crypto Selection */}
      {step === 'step1' && (
        <div className="space-y-4">
          {/* Amount Input with Dual Currency */}
          <div>
            <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
              {t('acct.buy.amount')}
            </label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              {/* Left side: Amount input */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  placeholder="100"
                  min={minAmount ?? '10'}
                  max={maxAmount ?? '10000'}
                  className="flex-1 bg-transparent text-white outline-none placeholder-white/30"
                />
              </div>

              {/* Right side: Fiat currency selector */}
              <div className="relative">
                <button
                  onClick={() => setShowFiatDropdown(!showFiatDropdown)}
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{fiatCurrency}</span>
                  <span className="text-white/60 text-xs">▼</span>
                </button>

                {showFiatDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#1a1b2e] border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {(displayCurrencies.length > 0 ? displayCurrencies : FALLBACK_FIAT_CURRENCIES).map((fiat) => (
                      <button
                        key={fiat.code}
                        onClick={() => {
                          setFiatCurrency(fiat.code);
                          setShowFiatDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                          fiatCurrency === fiat.code
                            ? 'bg-white/10 border-l-2 border-orange-500'
                            : ''
                        }`}
                      >
                        <div className="font-medium text-white">{fiat.code}</div>
                        <div className="text-xs text-white/60">
                          {fiat.name || currencyName(fiat.code, fiat.code, locale)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">
              {t('acct.buy.minMax', {
                min: minAmount ? minAmount.toLocaleString(locale) : (10).toLocaleString(locale),
                max: maxAmount ? maxAmount.toLocaleString(locale) : (10000).toLocaleString(locale),
              })}
            </p>
          </div>

          {/* Crypto Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
              {t('acct.buy.selectCrypto')}
            </label>

            {loadingCryptos && (
              <div className="text-center py-6 text-white/60">{t('acct.buy.loadingCryptos')}</div>
            )}

            {errorCryptos && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
                {errorCryptos.message}
              </div>
            )}

            {!loadingCryptos && !errorCryptos && cryptos.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-colors text-left flex items-center justify-between"
                >
                  <div>
                    {selectedCrypto ? (
                      <>
                        <div className="font-semibold text-white">{selectedCrypto.code}</div>
                        <div className="text-xs text-white/60">{selectedCrypto.name}</div>
                      </>
                    ) : (
                      <span className="text-white/60">{t('acct.buy.chooseCrypto')}</span>
                    )}
                  </div>
                  <span className="text-white/60">▼</span>
                </button>

                {showCryptoDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b2e] border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {cryptos.map((crypto) => (
                      <button
                        key={crypto.code}
                        onClick={() => {
                          handleSelectCrypto(crypto);
                          setShowCryptoDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                          selectedCrypto?.code === crypto.code
                            ? 'bg-white/10 border-l-2 border-orange-500'
                            : ''
                        }`}
                      >
                        <div className="font-semibold text-white">{crypto.code}</div>
                        <div className="text-xs text-white/60">{crypto.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loadingCryptos && cryptos.length === 0 && !errorCryptos && (
              <div className="text-center py-6 text-white/60">{t('acct.buy.noCryptos')}</div>
            )}
          </div>

          {/* Payment Methods Grid - Show available payment options */}
          {selectedCrypto && amount && fiatCurrency && (
            <div>
              <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
                {t('acct.buy.provider')}
              </label>

              {loadingOffers && (
                <div className="text-center py-6 text-white/60">
                  {t('acct.buy.fetchingProviders')}
                </div>
              )}

              {/* Show error with details based on error type */}
              {!loadingOffers && (offers.length === 0 || (offers.length > 0 && offers[0]?.errorType) || errorOffers) && (
                <div className="space-y-3">
                  {/* Main error message from API error state */}
                  {errorOffers && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
                      <p className="font-semibold mb-1">⚠️ Error</p>
                      <p>{errorOffers.message}</p>
                    </div>
                  )}

                  {/* Specific error handling based on error type from first offer */}
                  {offers.length > 0 && offers[0] && (
                    <>
                      {/* Limits error - show minimum amount */}
                      {offers[0].errorType === 'limits' && offers[0].errorDetails && offers[0].errorDetails.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-300 text-xs">
                          <p className="font-semibold mb-1">💡 Minimum Amount Required</p>
                          {offers[0].errorDetails.map((detail: any) => (
                            <p key={detail.cause}>
                              {detail.cause === 'min' && `Minimum: ${detail.value} ${fiatCurrency}`}
                              {detail.cause === 'max' && `Maximum: ${detail.value} ${fiatCurrency}`}
                            </p>
                          ))}
                          <p className="mt-1">Please adjust the amount to proceed</p>
                        </div>
                      )}

                      {/* Currency error - show unsupported message */}
                      {offers[0].errorType === 'currency' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-300 text-xs">
                          <p className="font-semibold mb-1">⚠️ Exchange Pair Not Available</p>
                          <p>{offers[0].errorMessage || 'This cryptocurrency/currency combination is not available'}</p>
                          <p className="mt-1">Try selecting a different cryptocurrency or fiat currency</p>
                        </div>
                      )}

                      {/* Generic error handling */}
                      {offers[0].errorType && offers[0].errorType !== 'limits' && offers[0].errorType !== 'currency' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-300 text-xs">
                          <p className="font-semibold mb-1">⚠️ {offers[0].errorType.charAt(0).toUpperCase() + offers[0].errorType.slice(1)}</p>
                          <p>{offers[0].errorMessage}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Payment Methods Grid - Square Cards with Logos */}
              {!loadingOffers && !errorOffers && offers.length > 0 && !offers[0]?.errorType && offers[0]?.paymentMethodOffer && (
                <div className="space-y-4">
                  {/* Logo Cards Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {offers[0].paymentMethodOffer.map((method) => {
                      const methodKey = method.method.toLowerCase();
                      const methodInfo = PAYMENT_METHOD_LOGOS[methodKey] || { name: method.methodName, logo: '/payment-logos/default.png' };

                      return (
                        <button
                          key={method.offerId}
                          onClick={() => {
                            setSelectedOfferId(method.offerId);
                            setSelectedPaymentMethod(method.method);
                          }}
                          className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center relative overflow-hidden group ${
                            selectedOfferId === method.offerId
                              ? 'border-orange-500 bg-orange-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
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

                  {/* Details Section for Selected Method */}
                  {selectedOfferId && offers[0].paymentMethodOffer && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                      {(() => {
                        const selectedMethod = offers[0].paymentMethodOffer.find((m) => m.offerId === selectedOfferId);
                        if (!selectedMethod) return null;

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">{selectedMethod.methodName}</span>
                              <span className="text-xs text-white/50">{offers[0].providerCode}</span>
                            </div>
                            <div className="border-t border-white/10" />
                            <div className="flex items-center justify-between">
                              <div className="text-white/60 text-sm">You will receive:</div>
                              <div className="text-green-400 font-semibold text-sm">
                                {Number(selectedMethod.amountExpectedTo).toFixed(8)} {selectedCrypto.code}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-white/60 text-sm">Fee:</div>
                              <div className="text-white/80 text-sm">{selectedMethod.fee}%</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {!loadingOffers && offers.length === 0 && !errorOffers && selectedCrypto && (
                <div className="text-center py-6 text-white/60">{t('acct.buy.noProviders')}</div>
              )}
            </div>
          )}

          {/* Amount validation error */}
          {amount && minAmount && Number(amount) < minAmount && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              <span className="font-semibold">⚠️ Amount too low:</span> Minimum {minAmount.toLocaleString(locale)} {fiatCurrency} required
            </div>
          )}

          {amount && maxAmount && Number(amount) > maxAmount && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              <span className="font-semibold">⚠️ Amount too high:</span> Maximum {maxAmount.toLocaleString(locale)} {fiatCurrency} allowed
            </div>
          )}

          {/* Error message when order creation fails */}
          {errorCreateOrder && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              <span className="font-semibold">Error creating order:</span> {errorCreateOrder.message}
            </div>
          )}

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={
              creatingOrder ||
              loadingOffers ||
              fetchingAddress ||
              !amount ||
              Number(amount) <= 0 ||
              (minAmount && Number(amount) < minAmount) ||
              (maxAmount && Number(amount) > maxAmount) ||
              !selectedCrypto ||
              !selectedProvider ||
              !selectedPaymentMethod ||
              !toAddress ||
              !selectedNetwork ||
              offers.length === 0
            }
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-lg text-white hover:opacity-90 transition-opacity text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingAddress ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {t('acct.buy.gettingWallet')}
              </div>
            ) : loadingOffers ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {t('acct.buy.loadingProviders')}
              </div>
            ) : creatingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {t('acct.buy.processing')}
              </div>
            ) : (
              t('acct.buy.buyNow')
            )}
          </button>
        </div>
      )}

      {/* Step 2: Payment Iframe */}
      {step === 'step2' && iframeUrl && selectedCrypto && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">{t('acct.buy.expectedReceive')}</span>
              <span className="font-semibold text-white">
                {expectedAmount?.toFixed(8)} {selectedCrypto.code}
              </span>
            </div>
            <div className="border-t border-white/10" />
            <div className="text-xs text-white/60">{t('acct.buy.processingTime')}</div>
          </div>

          {/* URL Display - No Iframe */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
                {t('acct.buy.paymentUrl')}
              </label>
              <div className="bg-black/50 border border-white/20 rounded p-3 break-all text-white/80 text-sm font-mono max-h-40 overflow-y-auto">
                {iframeUrl}
              </div>
            </div>

            {/* Copy URL Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(iframeUrl);
                console.log('[Changelly] URL copied to clipboard');
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-lg text-white hover:opacity-90 transition-opacity text-sm font-semibold"
            >
              {t('acct.buy.copyUrl')}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-300 text-xs space-y-1">
            <p>✅ {t('acct.buy.infoLocked')}</p>
            <p>✅ {t('acct.buy.infoSecured')}</p>
            <p>✅ {t('acct.buy.infoKeepOpen')}</p>
          </div>

          {/* Action */}
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-semibold"
          >
            {t('acct.buy.backToWallet')}
          </button>
        </div>
      )}

      {/* Changelly iframe portal - Responsive modal for mobile, tablet, desktop */}
      {iframeUrl && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4">
          {/* Modal container - Responsive width and height */}
          <div className="relative w-full h-full sm:h-[85vh] md:h-[80vh] md:w-[80vw] lg:w-[64vw] bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-full">
            {/* Close button */}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-slate-300 hover:text-slate-100 transition-colors bg-slate-800/80 hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* iframe - no scrollbar */}
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              className="w-full h-full border-0 overflow-hidden"
              title="Changelly Payment Checkout"
              allow="payment"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-presentation"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />

            {/* Loading overlay */}
            {creatingOrder && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <svg className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
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
      )}
    </div>
  );
};

export default BuyCryptoTab;
