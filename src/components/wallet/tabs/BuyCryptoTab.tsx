import { useEffect, useState, type FC } from 'react';
import { useMe } from '@/context/UserContext';
import { useChangellyBuyCrypto, type Cryptocurrency, type Offer } from '@/hooks/useChangellyBuyCrypto';

type BuyCryptoStep = 'step1' | 'step3';

// Common fiat currencies for payment
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

// US States for country-specific requirements
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'AS', 'GU', 'MP', 'PR', 'VI'
];

// Available buy crypto providers
const BUY_CRYPTO_PROVIDERS = [
  {
    id: 'changelly',
    name: 'Changelly',
    description: 'Fast & reliable crypto conversion',
    icon: '🔄',
    processingTime: '5-30 minutes',
  },
  // Future providers can be added here:
  // { id: 'swapped', name: 'Swapped', description: '...', icon: '⚡', processingTime: '...' },
];

const BuyCryptoTab: FC = () => {
  const { me } = useMe();
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
    createOrder,
  } = useChangellyBuyCrypto();

  // Form state
  const [step, setStep] = useState<BuyCryptoStep>('step1');
  const [amount, setAmount] = useState('100');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('changelly');
  const [country] = useState('US'); // TODO: Detect user's country
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('CA'); // Default to CA for US
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Fetch cryptos on mount
  useEffect(() => {
    fetchCryptos();
  }, [fetchCryptos]);

  // Fetch offers when amount or crypto changes
  useEffect(() => {
    if (!selectedCrypto || !amount || Number(amount) <= 0) {
      return;
    }

    // For US requests, state is required
    if (country === 'US' && !selectedState) {
      return;
    }

    fetchOffers(
      Number(amount),
      fiatCurrency,
      selectedCrypto.code,
      country,
      country === 'US' ? selectedState : undefined,
    );
  }, [selectedCrypto, amount, fiatCurrency, country, selectedState, fetchOffers]);

  // Handle crypto selection
  const handleSelectCrypto = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
  };

  // Handle step 2: Buy Now → Create order with selected provider
  const handleBuyNow = async () => {
    if (!selectedCrypto || !selectedProvider || !me) return;

    // TODO: Get user's actual Coinspaid address for this crypto
    // For now, using placeholder (should be from wallet addresses in DB)
    const toAddress = '1A1z7agoat'; // PLACEHOLDER

    // For Changelly: use the best available offer
    if (selectedProvider === 'changelly') {
      if (!offers || offers.length === 0) return;

      // Select the offer with best rate (lowest fee or highest toAmount)
      const bestOffer = offers.reduce<Offer | null>((best, current) =>
        current.toAmount > (best?.toAmount || 0) ? current : best,
        null,
      );

      if (!bestOffer) return;

      const order = await createOrder(
        Number(amount),
        fiatCurrency,
        selectedCrypto.code,
        bestOffer.provider,
        country,
        toAddress,
        country === 'US' ? selectedState : undefined,
      );

      if (order) {
        setIframeUrl(order.iframeUrl);
        setExpectedAmount(order.expectedAmount);
        setStep('step3');
      }
    }
    // Future providers can be handled here
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
              Amount
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
                          fiatCurrency === fiat.code ? 'bg-white/10 border-l-2 border-orange-500' : ''
                        }`}
                      >
                        <div className="font-medium text-white">{fiat.code}</div>
                        <div className="text-xs text-white/60">{fiat.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">Min 10 • Max 10,000</p>
          </div>

          {/* Crypto Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
              Select Cryptocurrency
            </label>

            {loadingCryptos && (
              <div className="text-center py-6 text-white/60">Loading cryptocurrencies...</div>
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
                      <span className="text-white/60">Choose a cryptocurrency...</span>
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
                          selectedCrypto?.code === crypto.code ? 'bg-white/10 border-l-2 border-orange-500' : ''
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
              <div className="text-center py-6 text-white/60">No cryptocurrencies available</div>
            )}
          </div>

          {/* Select Provider Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
              Select Provider
            </label>
            <div className="relative">
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-colors text-left flex items-center justify-between"
              >
                <div>
                  {BUY_CRYPTO_PROVIDERS.find(p => p.id === selectedProvider) ? (
                    <>
                      <div className="font-semibold text-white">
                        {BUY_CRYPTO_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {BUY_CRYPTO_PROVIDERS.find(p => p.id === selectedProvider)?.description}
                      </div>
                    </>
                  ) : (
                    <span className="text-white/60">Choose a provider...</span>
                  )}
                </div>
                <span className="text-white/60">▼</span>
              </button>

              {showProviderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b2e] border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {BUY_CRYPTO_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setShowProviderDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                        selectedProvider === provider.id ? 'bg-white/10 border-l-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="font-semibold text-white">{provider.name}</div>
                      <div className="text-xs text-white/60">{provider.description}</div>
                      <div className="text-xs text-white/60 mt-1">⏱️ {provider.processingTime}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* State Selector (US only) */}
          {country === 'US' && (
            <div>
              <label className="block text-xs font-semibold text-[#9da2b4] mb-2">
                State <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-white font-medium">{selectedState}</span>
                  <span className="text-white/60 text-xs">▼</span>
                </button>

                {showStateDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b2e] border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {US_STATES.map((state) => (
                      <button
                        key={state}
                        onClick={() => {
                          setSelectedState(state);
                          setShowStateDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                          selectedState === state ? 'bg-white/10 border-l-2 border-orange-500' : ''
                        }`}
                      >
                        <span className="font-semibold text-white">{state}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 mt-1">Required for US transactions</p>
            </div>
          )}

          {/* Error Display */}
          {errorOffers && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              {errorOffers.message}
            </div>
          )}

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={creatingOrder || loadingOffers || !amount || Number(amount) <= 0 || !selectedCrypto}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-lg text-white hover:opacity-90 transition-opacity text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingOffers ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Loading...
              </div>
            ) : creatingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </div>
            ) : (
              'Buy Now'
            )}
          </button>
        </div>
      )}

      {/* Step 3: Iframe Payment */}
      {step === 'step3' && iframeUrl && selectedCrypto && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Expected to receive</span>
              <span className="font-semibold text-white">
                {expectedAmount?.toFixed(8)} {selectedCrypto.code}
              </span>
            </div>
            <div className="border-t border-white/10" />
            <div className="text-xs text-white/60">
              Processing time: 5-30 minutes (depending on payment method)
            </div>
          </div>

          {/* Iframe Container */}
          <div className="border-2 border-dashed border-white/20 rounded-lg overflow-hidden bg-white/5 aspect-video">
            <iframe
              src={iframeUrl}
              title="Changelly Payment"
              className="w-full h-full"
              allow="payment"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-300 text-xs space-y-1">
            <p>✅ Destination address is locked and cannot be changed</p>
            <p>✅ Your payment is secured through Changelly</p>
            <p>✅ Keep this window open until payment completes</p>
          </div>

          {/* Action */}
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-semibold"
          >
            Back to Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyCryptoTab;
