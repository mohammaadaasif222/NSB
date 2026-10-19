'use client';

import { useEffect, useState, type FC } from 'react';
import { useMe } from '@/context/UserContext';
import { useOnramperBuyCrypto } from '@/hooks/useOnramperBuyCrypto';

type Step = 'form' | 'quotes';

const FALLBACK_FIAT = [
  { code: 'usd', name: 'US Dollar', symbol: '$' },
  { code: 'eur', name: 'Euro', symbol: '€' },
  { code: 'gbp', name: 'British Pound', symbol: '£' },
];

const FALLBACK_CRYPTO = [
  { code: 'btc', name: 'Bitcoin', network: 'bitcoin', symbol: 'BTC' },
  { code: 'eth', name: 'Ethereum', network: 'ethereum', symbol: 'ETH' },
  { code: 'usdt', name: 'USDT', network: 'ethereum', symbol: 'USDT' },
];

/**
 * Replaces the legacy BuyCryptoTab (Changelly). Flow:
 *   Step 1 — form   : user picks fiat, amount, crypto, payment method
 *   Step 2 — quotes : ranked list of onramps; user confirms recommended OR picks another
 *   On confirm      : backend creates signed session, we open the redirect URL in a new tab
 *
 * We deliberately keep the UI compact — Onramper hosts the actual payment flow once
 * we redirect. Our job is quote discovery + wallet validation.
 */
const OnramperBuyCryptoTab: FC = () => {
  const { me } = useMe();
  const hook = useOnramperBuyCrypto();

  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('100');
  const [source, setSource] = useState('usd');
  const [destination, setDestination] = useState('btc');
  const [paymentMethod, setPaymentMethod] = useState('creditcard');
  const [country, setCountry] = useState<string>('us');
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('bitcoin');
  const [fetchingWallet, setFetchingWallet] = useState(false);

  // Load supported catalogue + user default on mount
  useEffect(() => {
    void hook.loadCatalogue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When destination crypto changes, derive network + fetch user's CoinsPaid wallet
  useEffect(() => {
    const crypto =
      hook.cryptos.find((c) => c.code.toLowerCase() === destination.toLowerCase()) ??
      FALLBACK_CRYPTO.find((c) => c.code === destination);
    if (crypto?.network) setNetwork(crypto.network);

    void fetchUserWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, hook.cryptos]);

  // Load payment methods when source + destination are set
  useEffect(() => {
    if (!source || !destination) return;
    void hook.loadPaymentMethods(source, destination, country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, destination, country]);

  const fetchUserWallet = async () => {
    if (!me?.id) return;
    setFetchingWallet(true);
    try {
      // The backend auto-resolves the user's CoinsPaid wallet for this
      // (currency, network). If none exists, it provisions one via CoinsPaid
      // and returns it. No manual passthrough needed on checkout.
      const resolved = await hook.resolveDestinationAddress(
        destination.toUpperCase(),
        network.toUpperCase(),
      );
      setWalletAddress(resolved.address);
    } catch {
      setWalletAddress('');
    } finally {
      setFetchingWallet(false);
    }
  };

  const canFetchQuotes =
    Number(amount) > 0 && source && destination && walletAddress && !fetchingWallet;

  const handleFetchQuotes = async () => {
    await hook.loadQuotes({
      source,
      destination,
      amount: Number(amount),
      country,
      paymentMethod,
      walletAddress,
    });
    setStep('quotes');
  };

  const handleBuy = async (onramp: string) => {
    try {
      const { redirectUrl } = await hook.startCheckout({
        onramp,
        source,
        destination,
        amount: Number(amount),
        paymentMethod,
        network,
        country,
        successRedirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/wallet` : undefined,
      });
      if (redirectUrl) {
        window.open(redirectUrl, '_blank', 'noopener');
      }
    } catch {
      // Error surfaced via hook.errorCheckout
    }
  };

  const fiats = hook.fiats.length > 0 ? hook.fiats : FALLBACK_FIAT;
  const cryptos = hook.cryptos.length > 0 ? hook.cryptos : FALLBACK_CRYPTO;

  // ─── STEP 1: form ──────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-bold text-white">Buy Crypto</h2>

        <Field label="You pay">
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-lg bg-[#1a1d26] border border-[#2a2d36] px-3 py-2 text-white"
              placeholder="100"
              min="0"
              step="any"
            />
            <select
              value={source}
              onChange={(e) => setSource(e.target.value.toLowerCase())}
              className="w-28 rounded-lg bg-[#1a1d26] border border-[#2a2d36] px-3 py-2 text-white"
            >
              {fiats.map((f) => (
                <option key={f.code} value={f.code.toLowerCase()}>
                  {f.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field label="You get">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value.toLowerCase())}
            className="w-full rounded-lg bg-[#1a1d26] border border-[#2a2d36] px-3 py-2 text-white"
          >
            {cryptos.map((c) => (
              <option key={c.code} value={c.code.toLowerCase()}>
                {c.symbol || c.code.toUpperCase()} — {c.name}{c.network ? ` (${c.network})` : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pay with">
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-lg bg-[#1a1d26] border border-[#2a2d36] px-3 py-2 text-white"
            disabled={hook.loadingPaymentMethods}
          >
            {hook.paymentMethods.length > 0 ? (
              hook.paymentMethods.map((p) => (
                <option key={p.paymentTypeId} value={p.paymentTypeId}>
                  {p.name}
                </option>
              ))
            ) : (
              <>
                <option value="creditcard">Credit card</option>
                <option value="debitcard">Debit card</option>
              </>
            )}
          </select>
          {hook.loadingPaymentMethods && (
            <p className="text-xs text-gray-400 mt-1">Loading payment methods...</p>
          )}
        </Field>

        <Field label="Country">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value.toLowerCase())}
            maxLength={2}
            className="w-full rounded-lg bg-[#1a1d26] border border-[#2a2d36] px-3 py-2 text-white font-mono"
            placeholder="us"
          />
        </Field>

        <Field label="Deposit to your wallet">
          <input
            type="text"
            value={fetchingWallet ? 'Loading your address...' : walletAddress}
            readOnly
            className="w-full rounded-lg bg-[#0e1017] border border-[#2a2d36] px-3 py-2 text-xs text-gray-300 font-mono truncate"
          />
          <p className="text-[10.5px] text-gray-500 mt-1">
            Your CoinsPaid {destination.toUpperCase()} wallet. Crypto will be credited to your balance on-chain confirmation.
          </p>
        </Field>

        {hook.errorCatalogue && (
          <p className="text-xs text-amber-400">{hook.errorCatalogue}</p>
        )}

        <button
          type="button"
          disabled={!canFetchQuotes || hook.loadingQuotes}
          onClick={() => void handleFetchQuotes()}
          className="w-full rounded-lg bg-[#f0b90b] text-black font-semibold py-3 disabled:opacity-50"
        >
          {hook.loadingQuotes ? 'Fetching quotes...' : 'Get quotes'}
        </button>
      </div>
    );
  }

  // ─── STEP 2: quotes ────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep('form')}
          className="text-sm text-gray-400"
        >
          ← Change
        </button>
        <h2 className="text-base font-bold text-white">
          Buy {destination.toUpperCase()} with {amount} {source.toUpperCase()}
        </h2>
      </div>

      {hook.errorQuotes && (
        <p className="text-sm text-red-400">{hook.errorQuotes}</p>
      )}

      {hook.quotes.length === 0 && !hook.loadingQuotes && !hook.errorQuotes && (
        <p className="text-sm text-gray-400 text-center py-6">
          No ramps available for this combination. Try a different payment method or country.
        </p>
      )}

      {hook.quotes.length > 0 && (
        <div className="space-y-2">
          {hook.quotes.map((q, idx) => {
            const isRecommended = q.recommendations?.includes('Recommended') || idx === 0;
            const hasError = (q.errors?.length ?? 0) > 0;
            return (
              <div
                key={`${q.ramp}-${idx}`}
                className={`rounded-lg border p-3 ${
                  isRecommended ? 'border-[#f0b90b] bg-[#f0b90b14]' : 'border-[#2a2d36] bg-[#1a1d26]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white capitalize">{q.ramp}</span>
                      {isRecommended && (
                        <span className="text-[10px] font-bold bg-[#f0b90b] text-black px-1.5 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      )}
                      {q.recommendations?.includes('BestPrice') && (
                        <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                          BEST PRICE
                        </span>
                      )}
                      {q.recommendations?.includes('LowKYC') && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                          LOW KYC
                        </span>
                      )}
                    </div>
                    {hasError ? (
                      <p className="text-xs text-red-400 mt-1">
                        {q.errors?.[0]?.message ?? 'Unavailable'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        You get <span className="text-white font-semibold">{q.payout}</span>{' '}
                        {destination.toUpperCase()}
                        {q.rate ? ` · rate ${q.rate}` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleBuy(q.ramp)}
                    disabled={hasError || hook.creatingCheckout}
                    className="rounded-lg bg-[#f0b90b] text-black text-xs font-bold px-3 py-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    {hook.creatingCheckout ? '...' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hook.errorCheckout && (
        <p className="text-sm text-red-400">{hook.errorCheckout}</p>
      )}
    </div>
  );
};

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

export default OnramperBuyCryptoTab;
