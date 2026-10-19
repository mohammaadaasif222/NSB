'use client';

import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useMe } from '@/context/UserContext';
import { useOnramperBuyCrypto } from '@/hooks/useOnramperBuyCrypto';
import { getCurrencies, getDisplayCurrencies, type DisplayCurrencyOption } from '@/services/wallet';
import type { Currency } from '@/types';

/**
 * Buy Crypto — single screen flow:
 *   1. User enters amount, picks fiat, picks crypto
 *   2. As soon as all three are set, we auto-fetch quotes (debounced)
 *   3. Provider dropdown pre-selects the Recommended quote
 *   4. "Buy Now" calls /checkout and opens the Onramper redirect URL
 *
 * The two intermediate pages from the earlier design (form → quotes list)
 * are collapsed into one — matches the mockup the user asked for.
 */

const FALLBACK_CRYPTO = [
  { code: 'btc', name: 'Bitcoin', network: 'bitcoin', symbol: 'BTC' },
  { code: 'eth', name: 'Ethereum', network: 'ethereum', symbol: 'ETH' },
  { code: 'usdt', name: 'Tether', network: 'ethereum', symbol: 'USDT' },
];

const DEBOUNCE_MS = 400;

const OnramperBuyCryptoTab: FC = () => {
  const { me } = useMe();
  const hook = useOnramperBuyCrypto();

  // Core form state
  const [amount, setAmount] = useState('50');
  const [source, setSource] = useState('usd');
  const [destination, setDestination] = useState('btc');
  // Fixed for the simplified flow — the mockup doesn't expose these pickers.
  // Add them back as dropdowns if operators want finer control later.
  const [paymentMethod] = useState('creditcard');
  // Country is NOT set by the frontend. The backend resolves it from the
  // user's real IP (via GeoIP) so the quotes/checkout respect the user's
  // actual jurisdiction, not a hardcoded default.
  const [network, setNetwork] = useState('bitcoin');
  const [walletAddress, setWalletAddress] = useState('');

  // Picked provider id — defaults to recommended once quotes land.
  const [selectedRamp, setSelectedRamp] = useState<string>('');

  // Catalogue data
  const [displayFiats, setDisplayFiats] = useState<DisplayCurrencyOption[]>([]);
  const [dbCryptos, setDbCryptos] = useState<Currency[]>([]);

  // Debounce timer for quote re-fetches on input change.
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Mount: load fiats + cryptos + Onramper catalogue ─────────── */
  useEffect(() => {
    void hook.loadCatalogue();
    void (async () => {
      try {
        const resp = await getDisplayCurrencies();
        const list = (resp as any)?.data ?? (resp as any);
        if (Array.isArray(list)) setDisplayFiats(list);
      } catch { /* fall back */ }
    })();
    void (async () => {
      try {
        const resp = await getCurrencies();
        const list = (resp as any)?.data ?? (resp as any);
        if (Array.isArray(list)) {
          setDbCryptos(
            (list as Currency[]).filter(
              (c) =>
                c.category === 'CRYPTO' &&
                c.is_deposit_enabled &&
                (c.networks?.length ?? 0) > 0,
            ),
          );
        }
      } catch { /* fall back */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Normalised fiat + crypto lists ───────────────────────────── */

  const fiats = useMemo(() => {
    if (displayFiats.length > 0) {
      return displayFiats.map((f) => ({ code: f.code, name: f.name, symbol: f.symbol }));
    }
    return hook.fiats.map((f) => ({ code: f.code, name: f.name, symbol: f.symbol }));
  }, [displayFiats, hook.fiats]);

  const cryptos = useMemo(() => {
    if (dbCryptos.length > 0) {
      return dbCryptos.map((c) => {
        const firstEnabledNet =
          c.networks.find((n) => n.is_enabled) ?? c.networks[0];
        return {
          code: c.code.toLowerCase(),
          name: c.name,
          network: (firstEnabledNet?.code ?? 'ethereum').toLowerCase(),
          symbol: c.code,
        };
      });
    }
    if (hook.cryptos.length > 0) {
      return hook.cryptos.map((c) => ({
        code: c.code,
        name: c.name,
        network: (c.network ?? 'ethereum').toLowerCase(),
        symbol: c.symbol || c.code.toUpperCase(),
      }));
    }
    return FALLBACK_CRYPTO;
  }, [dbCryptos, hook.cryptos]);

  /* ── When destination changes: derive network + fetch wallet ──── */
  useEffect(() => {
    const match = cryptos.find((c) => c.code === destination.toLowerCase());
    const derivedNetwork = (match?.network ?? network).toLowerCase();
    if (derivedNetwork !== network) setNetwork(derivedNetwork);

    const fetchWallet = async () => {
      if (!me?.id) return;
      try {
        const resolved = await hook.resolveDestinationAddress(
          destination.toUpperCase(),
          derivedNetwork.toUpperCase(),
        );
        setWalletAddress(resolved.address);
      } catch {
        setWalletAddress('');
      }
    };
    void fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, cryptos.length]);

  /* ── Auto-quote on debounced input change ─────────────────────── */
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    const n = Number(amount);
    if (!source || !destination || !Number.isFinite(n) || n <= 0 || !walletAddress) {
      return;
    }
    quoteTimer.current = setTimeout(() => {
      // Country intentionally omitted — the backend resolves it from the
      // user's IP via GeoIP. Sending it from here would require either
      // hardcoding a value or asking the user to pick, both of which lose
      // the "match the user's actual location" guarantee.
      void hook.loadQuotes({
        source,
        destination,
        amount: n,
        paymentMethod,
        walletAddress,
      });
    }, DEBOUNCE_MS);

    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, source, destination, paymentMethod, walletAddress]);

  /* ── When quotes land, pre-select the recommended one ─────────── */
  useEffect(() => {
    if (hook.quotes.length === 0) {
      setSelectedRamp('');
      return;
    }
    const recommended =
      hook.quotes.find((q) => q.recommendations?.includes('Recommended') && !q.errors?.length) ??
      hook.quotes.find((q) => !q.errors?.length) ??
      hook.quotes[0];
    setSelectedRamp(recommended.ramp);
  }, [hook.quotes]);

  /* ── Buy Now → create checkout session + open redirect URL ────── */
  const handleBuyNow = async () => {
    if (!selectedRamp) return;
    try {
      const { redirectUrl } = await hook.startCheckout({
        onramp: selectedRamp,
        source,
        destination,
        amount: Number(amount),
        paymentMethod,
        network,
        // country intentionally omitted — backend resolves from user IP
        successRedirectUrl:
          typeof window !== 'undefined' ? `${window.location.origin}/wallet` : undefined,
      });
      if (redirectUrl) window.open(redirectUrl, '_blank', 'noopener');
    } catch { /* surfaced via hook.errorCheckout */ }
  };

  const selectedQuote = hook.quotes.find((q) => q.ramp === selectedRamp);
  const selectedQuoteHasError = (selectedQuote?.errors?.length ?? 0) > 0;
  const canBuy =
    !!selectedRamp &&
    !selectedQuoteHasError &&
    !hook.creatingCheckout &&
    !hook.loadingQuotes &&
    Number(amount) > 0;

  const fiatSymbol = fiats.find((f) => f.code.toLowerCase() === source)?.symbol ?? '';

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold text-white">Buy Crypto</h2>

      {/* ── You pay with ── */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">You pay with</label>
        <div className="flex items-center gap-2 rounded-xl bg-[#1a1d26] border border-[#2a2d36] px-4 py-3">
          <span className="text-gray-500 text-lg">{fiatSymbol || '$'}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            className="flex-1 bg-transparent text-white text-xl font-semibold outline-none"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value.toLowerCase())}
            className="bg-transparent text-white font-semibold outline-none appearance-none cursor-pointer pr-5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
            }}
          >
            {fiats.map((f) => (
              <option key={f.code} value={f.code.toLowerCase()}>
                {f.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── In Exchange For ── */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">In Exchange For</label>
        <div className="relative">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value.toLowerCase())}
            className="w-full appearance-none rounded-xl bg-[#1a1d26] border border-[#2a2d36] px-4 py-3 text-white font-semibold outline-none cursor-pointer"
          >
            {cryptos.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Select Provider and Receive ── */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Select Provider and Receive</label>
        <div
          className="relative rounded-xl bg-[#1a1d26] border border-[#2a2d36] px-4 py-3"
        >
          {hook.loadingQuotes ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Fetching best price…</span>
              <span className="text-gray-500 text-sm tabular-nums">
                0.00000000 {destination.toUpperCase()}
              </span>
            </div>
          ) : hook.quotes.length === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">No providers available</span>
              <span className="text-gray-500 text-sm tabular-nums">
                0.00000000 {destination.toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <select
                  value={selectedRamp}
                  onChange={(e) => setSelectedRamp(e.target.value)}
                  className="w-full bg-transparent text-white font-semibold outline-none appearance-none cursor-pointer capitalize"
                >
                  {hook.quotes.map((q) => {
                    const hasError = (q.errors?.length ?? 0) > 0;
                    const recommended = q.recommendations?.includes('Recommended');
                    return (
                      <option key={q.ramp} value={q.ramp} disabled={hasError}>
                        {q.ramp}
                        {recommended ? ' · RECOMMENDED' : ''}
                        {hasError ? ' (unavailable)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <span className="text-white font-semibold text-sm tabular-nums whitespace-nowrap">
                {selectedQuote?.payout ?? '0.00000000'} {destination.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Warning line */}
        {hook.quotes.length === 0 && !hook.loadingQuotes && (
          <p className="text-red-400 text-xs mt-2 flex items-start gap-1">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            Please change the currency or if you use VPN, please turn it off and the methods
            will be available to you
          </p>
        )}

        {selectedQuoteHasError && (
          <p className="text-amber-400 text-xs mt-2">
            {selectedQuote?.errors?.[0]?.message ?? 'This provider is unavailable'}
          </p>
        )}

        {hook.errorCheckout && (
          <p className="text-red-400 text-xs mt-2">{hook.errorCheckout}</p>
        )}
      </div>

      {/* ── Help link ── */}
      <button
        type="button"
        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
        onClick={() => window.open('https://docs.onramper.com/', '_blank', 'noopener')}
      >
        How to use Buy Crypto <ChevronDown className="w-3 h-3 -rotate-90" />
      </button>

      {/* ── Buy Now ── */}
      <button
        type="button"
        onClick={() => void handleBuyNow()}
        disabled={!canBuy}
        className="w-full rounded-xl bg-[#f0b90b] text-black font-bold py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
      >
        {hook.creatingCheckout ? 'Opening checkout…' : 'Buy Now'}
      </button>
    </div>
  );
};

export default OnramperBuyCryptoTab;
