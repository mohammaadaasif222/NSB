import { useEffect, useState, useRef, type FC } from 'react';
import { createPortal } from 'react-dom';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { useChangellyBuyCrypto, type Cryptocurrency } from '@/hooks/useChangellyBuyCrypto';
import api from '@/services/api';

type BuyCryptoStep = 'step1' | 'step2';

// Common fiat currencies for payment. `name` is the English fallback; the
// picker shows the name in the player's language via Intl.DisplayNames.
const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
];

/** Localised currency name, falling back to the English one when Intl cannot help. */
const currencyName = (code: string, fallback: string, locale: string): string => {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
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
  const [selectedProvider, setSelectedProvider] = useState<string>(''); // Empty until offers fetched
  const [country] = useState('US'); // TODO: Detect user's country
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null); // Track selected network
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      return;
    }

    console.log('[Changelly] Calling fetchOffers for:', selectedCrypto.code);
    // For US: automatically use 'CA' as state
    // For others: don't pass state
    fetchOffers(
      Number(amount),
      fiatCurrency,
      selectedCrypto.code,
      country,
      country === 'US' ? 'CA' : undefined
    );
  }, [selectedCrypto, amount, fiatCurrency, country, fetchOffers]);

  // Auto-select first provider when offers are fetched
  useEffect(() => {
    if (offers.length > 0 && !selectedProvider) {
      setSelectedProvider(offers[0].providerCode);
    }
  }, [offers, selectedProvider]);

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
      console.log('[Changelly] Creating order...');
      // Create order with selected provider
      // For US: automatically use 'CA' as state
      // For other countries: don't pass state
      const order = await createOrder(
        Number(amount),
        fiatCurrency,
        selectedCrypto.code,
        selectedProvider,
        country,
        toAddress,
        selectedNetwork, // Pass the network code (e.g., 'ETHEREUM', 'SOLANA')
        country === 'US' ? 'CA' : undefined, // Automatically use CA for US, undefined for others
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
                  min="10"
                  max="10000"
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
                    {FIAT_CURRENCIES.map((fiat) => (
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
                          {currencyName(fiat.code, fiat.name, locale)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">
              {t('acct.buy.minMax', {
                min: (10).toLocaleString(locale),
                max: (10000).toLocaleString(locale),
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

          {/* Select Provider Dropdown - Dynamic from offers */}
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

              {errorOffers && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
                  {errorOffers.message}
                </div>
              )}

              {!loadingOffers && !errorOffers && offers.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      {selectedProvider ? (
                        <>
                          <div className="font-semibold text-white capitalize">
                            {selectedProvider}
                          </div>
                          {offers.find((o) => o.providerCode === selectedProvider) && (
                            <div className="text-xs text-white/60">
                              {t('acct.buy.fee', {
                                fee:
                                  offers.find((o) => o.providerCode === selectedProvider)?.fee ??
                                  '',
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-white/60">{t('acct.buy.chooseProvider')}</span>
                      )}
                    </div>
                    <span className="text-white/60">▼</span>
                  </button>

                  {showProviderDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b2e] border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {offers.map((offer) => (
                        <button
                          key={offer.providerCode}
                          onClick={() => {
                            setSelectedProvider(offer.providerCode);
                            setShowProviderDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                            selectedProvider === offer.providerCode
                              ? 'bg-white/10 border-l-2 border-orange-500'
                              : ''
                          }`}
                        >
                          <div className="font-semibold text-white capitalize">
                            {offer.providerCode}
                          </div>
                          <div className="text-xs text-white/60">
                            {t('acct.buy.fee', { fee: offer.fee })} •{' '}
                            {t('acct.buy.expected', {
                              amount: `${Number(offer.amountExpectedTo).toFixed(8)} ${selectedCrypto.code}`,
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loadingOffers && offers.length === 0 && !errorOffers && selectedCrypto && (
                <div className="text-center py-6 text-white/60">{t('acct.buy.noProviders')}</div>
              )}
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
              !selectedCrypto ||
              !selectedProvider ||
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
