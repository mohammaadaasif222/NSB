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
export function useChangellyBuyCrypto() {
  return {
    cryptos: [] as Cryptocurrency[],
    loadingCryptos: false,
    errorCryptos: null as string | null,
    fetchCryptos: async (..._args: unknown[]): Promise<void> => undefined,

    offers: [] as Offer[],
    loadingOffers: false,
    errorOffers: null as string | null,
    fetchOffers: async (..._args: unknown[]): Promise<Offer[]> => [],

    creatingOrder: false,
    errorCreateOrder: null as string | null,
    createOrder: async (..._args: unknown[]): Promise<Order | null> => null,
  };
}
