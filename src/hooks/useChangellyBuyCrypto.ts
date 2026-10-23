/**
 * STUB — Changelly has been removed in favour of Onramper.
 *
 * This file preserves the exported type names + hook signature so
 * `LocalCurrencyTab`'s Changelly fallback branch keeps compiling.
 * At runtime the fallback is a no-op: `fetchCryptos`, `fetchOffers`,
 * `createOrder` all resolve to empty state. When D24 has no methods
 * for the user's country, the fallback silently fails to produce
 * offers and the UI shows "no payment methods available".
 *
 * TODO: refactor `LocalCurrencyTab` to drop the fallback entirely,
 * then delete this file.
 */

export interface Cryptocurrency {
  code: string;
  name: string;
  icon?: string;
}

export interface PaymentMethod {
  offerId: string;
  amountExpectedTo: string;
  method: string;
  methodName: string;
  rate: string;
  invertedRate: string;
  fee: string;
}

export interface Offer {
  providerCode: string;
  offerId?: string;
  rate?: string;
  invertedRate?: string;
  fee?: string;
  amountExpectedTo?: string;
  method?: string;
  methodName?: string;
  paymentMethodOffer?: PaymentMethod[];
  errorType?: string;
  errorMessage?: string;
  errorDetails?: Array<{ cause: string; message?: string }>;
}

export interface Order {
  orderId: string;
  redirectUrl?: string;
  iframeUrl?: string;
}

/**
 * Permissive signatures — the real hook used positional args that LocalCurrencyTab
 * still passes. The stub accepts anything and ignores it.
 */
// Frozen singleton so every call returns the SAME reference. Callers that
// have `fetchOffers` / `fetchCryptos` / `createOrder` in a useEffect
// dependency array (LocalCurrencyTab does) would otherwise see a new ref on
// every render, re-fire the effect, re-render, loop. The old
// `return { ... }` built fresh objects per call and caused exactly that:
// /api/d24/payment-methods fired continuously while the local-currency tab
// was open.
const STABLE: Readonly<{
  cryptos: Cryptocurrency[];
  loadingCryptos: boolean;
  errorCryptos: string | null;
  fetchCryptos: (...args: unknown[]) => Promise<void>;
  offers: Offer[];
  loadingOffers: boolean;
  errorOffers: string | null;
  fetchOffers: (...args: unknown[]) => Promise<Offer[]>;
  creatingOrder: boolean;
  errorCreateOrder: string | null;
  createOrder: (...args: unknown[]) => Promise<Order | null>;
}> = Object.freeze({
  cryptos: [] as Cryptocurrency[],
  loadingCryptos: false,
  errorCryptos: null,
  fetchCryptos: async () => undefined,

  offers: [] as Offer[],
  loadingOffers: false,
  errorOffers: null,
  fetchOffers: async () => [],

  creatingOrder: false,
  errorCreateOrder: null,
  createOrder: async () => null,
});

export function useChangellyBuyCrypto() {
  return STABLE;
}
