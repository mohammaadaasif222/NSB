'use client';

import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ChevronDownIcon } from '@/components/icons';
import WalletField, {
  WALLET_ERROR,
  WALLET_INPUT,
  WALLET_PILL,
  WALLET_VALUE,
} from '../shared/WalletField';
import WalletSelect from '../shared/WalletSelect';
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
      } catch {
        /* fall back */
      }
    })();
    void (async () => {
      try {
        const resp = await getCurrencies();
        const list = (resp as any)?.data ?? (resp as any);
        if (Array.isArray(list)) {
          setDbCryptos(
            (list as Currency[]).filter(
              (c) =>
                c.category === 'CRYPTO' && c.is_deposit_enabled && (c.networks?.length ?? 0) > 0
            )
          );
        }
      } catch {
        /* fall back */
      }
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
        const firstEnabledNet = c.networks.find((n) => n.is_enabled) ?? c.networks[0];
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
          derivedNetwork.toUpperCase()
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
    } catch {
      /* surfaced via hook.errorCheckout */
    }
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
    <div>
      <div className="space-y-[19px]">
        <WalletField htmlFor="buy-amount" label="You pay with">
          <div className={WALLET_PILL}>
            <label htmlFor="buy-amount" className={`flex min-w-0 flex-1 items-center ${WALLET_VALUE}`}>
              <span aria-hidden="true">{fiatSymbol || '$'}</span>
              <input
                id="buy-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                className={`${WALLET_INPUT} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </label>
            <span className="relative flex shrink-0 items-center gap-1.5">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value.toLowerCase())}
                aria-label="Currency"
                className="cursor-pointer appearance-none bg-transparent pe-6 text-[16px] font-bold leading-6 text-[#9da2b4] outline-none sm:text-[18px] [&>option]:bg-[#16181d] [&>option]:text-[#f0f1f5]"
              >
                {fiats.map((f) => (
                  <option key={f.code} value={f.code.toLowerCase()}>
                    {f.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={22}
                strokeWidth={1.6}
                className="pointer-events-none absolute end-0 text-[#f0f1f5]"
              />
            </span>
          </div>
        </WalletField>

        <WalletField htmlFor="buy-destination" label="In Exchange For">
          <WalletSelect
            id="buy-destination"
            options={cryptos.map((c) => ({ value: c.code, label: c.symbol, detail: c.name }))}
            value={destination}
            onChange={(v) => setDestination(v.toLowerCase())}
            placeholder="BTC"
          />
        </WalletField>

        <WalletField htmlFor="buy-provider" label="Select Provider and Receive">
          {hook.quotes.length === 0 || hook.loadingQuotes ? (
            <div className={WALLET_PILL}>
              <span className={`min-w-0 flex-1 truncate ${WALLET_VALUE} !font-normal text-[#9da2b4]`}>
                {hook.loadingQuotes ? 'Fetching best price…' : 'No providers available'}
              </span>
              <span className="shrink-0 text-[14px] leading-5 text-[#f0f1f5]">
                0.00000000 {destination.toUpperCase()}
              </span>
            </div>
          ) : (
            <WalletSelect
              id="buy-provider"
              options={hook.quotes.map((q) => ({
                value: q.ramp,
                label: `${q.ramp}${(q.errors?.length ?? 0) > 0 ? ' (unavailable)' : ''}`,
                detail: q.recommendations?.includes('Recommended') ? 'Recommended' : undefined,
              }))}
              value={selectedRamp}
              onChange={setSelectedRamp}
              placeholder="Select provider"
              trailing={
                <span className="text-[14px] font-normal leading-5 text-[#f0f1f5]">
                  {selectedQuote?.payout ?? '0.00000000'} {destination.toUpperCase()}
                </span>
              }
            />
          )}

          {hook.quotes.length === 0 && !hook.loadingQuotes && (
            <p className={`mt-2 flex items-start gap-1 ${WALLET_ERROR}`}>
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              Please change the currency or if you use VPN, please turn it off and the methods will be
              available to you
            </p>
          )}

          {selectedQuoteHasError && (
            <p className="mt-2 text-[13px] leading-5 text-[#ffe779]">
              {selectedQuote?.errors?.[0]?.message ?? 'This provider is unavailable'}
            </p>
          )}

          {hook.errorCheckout && <p className={`mt-2 ${WALLET_ERROR}`}>{hook.errorCheckout}</p>}
        </WalletField>
      </div>

      <Button
        type="button"
        fullWidth
        className="mt-10"
        onClick={() => void handleBuyNow()}
        disabled={!canBuy}
      >
        {hook.creatingCheckout ? 'Opening checkout…' : 'Buy Now'}
      </Button>

      <button
        type="button"
        className="mx-auto mt-4 flex items-center gap-1 text-[13px] leading-5 text-[#9da2b4] hover:text-[#f0f1f5]"
        onClick={() => window.open('https://docs.onramper.com/', '_blank', 'noopener')}
      >
        How to use Buy Crypto <ChevronDownIcon size={14} className="-rotate-90 rtl:rotate-90" />
      </button>
    </div>
  );
};

export default OnramperBuyCryptoTab;
