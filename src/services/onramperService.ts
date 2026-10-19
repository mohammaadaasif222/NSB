import api from './api';

/**
 * Onramper buy-crypto service — thin wrapper around our backend's
 * /api/onramper/* routes. The backend proxies to Onramper, handles
 * signing, and persists OnramperOrder rows.
 */

export interface OnramperFiat {
  code: string;
  name: string;
  symbol: string;
  icon?: string;
}

export interface OnramperCrypto {
  code: string;
  name: string;
  network?: string;
  symbol: string;
  icon?: string;
}

export interface OnramperPaymentMethod {
  paymentTypeId: string;
  name: string;
  icon?: string;
  currencyStatus?: string;
}

export interface OnramperQuote {
  ramp: string;
  paymentMethod: string;
  rate: number;
  payout: number;
  networkFee?: number;
  transactionFee?: number;
  recommendations?: string[];
  quoteId?: string;
  errors?: Array<{ errorId: number; message: string; type: string }>;
}

export interface OnramperOrderRow {
  id: string;
  partner_context: string;
  session_id: string | null;
  onramper_transaction_id: string | null;
  onramp_provider: string | null;
  source_currency: string;
  source_amount: string;
  target_currency: string;
  target_amount: string | null;
  payment_method: string;
  country: string | null;
  wallet_address: string;
  transaction_hash: string | null;
  status: 'NEW' | 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  created_at: string;
  updated_at: string;
}

/** Supported fiat + crypto catalogue (whatever Onramper exposes to our API key). */
export async function fetchOnramperSupported(): Promise<{
  fiat: OnramperFiat[];
  crypto: OnramperCrypto[];
}> {
  const resp = await api.get('/onramper/supported');
  const data = (resp.data as any)?.data ?? resp.data;
  // Backend returns the raw Onramper `message` payload.
  return {
    fiat: data?.fiat ?? [],
    crypto: data?.crypto ?? [],
  };
}

/** Payment methods available for a (source, destination, country) triple. */
export async function fetchOnramperPaymentMethods(input: {
  source: string;
  destination: string;
  country?: string;
}): Promise<OnramperPaymentMethod[]> {
  // NOTE: our `api.get(url, params)` treats the 2nd arg as the query params
  // directly, not as an axios config. Passing `{ params: ... }` would
  // nest-serialise as `params[source]=...` — don't do that.
  const resp = await api.get('/onramper/payment-methods', {
    source: input.source,
    destination: input.destination,
    ...(input.country ? { country: input.country } : {}),
  });
  const data = (resp.data as any)?.data ?? resp.data;
  return Array.isArray(data) ? data : [];
}

/** Real-time quotes from all available onramps, ranked by Onramper. */
export async function fetchOnramperQuotes(input: {
  source: string;
  destination: string;
  amount: number;
  country?: string;
  paymentMethod?: string;
  walletAddress?: string;
}): Promise<OnramperQuote[]> {
  const resp = await api.get('/onramper/quotes', {
    source: input.source,
    destination: input.destination,
    amount: input.amount,
    ...(input.country ? { country: input.country } : {}),
    ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
    ...(input.walletAddress ? { walletAddress: input.walletAddress } : {}),
  });
  const data = (resp.data as any)?.data ?? resp.data;
  return Array.isArray(data) ? data : [];
}

/** Create a signed checkout session — opens Onramper hosted flow.
 *  The backend auto-resolves the destination wallet address, so the frontend
 *  does not send one. */
export async function createOnramperCheckout(input: {
  onramp: string;
  source: string;
  destination: string;
  amount: number;
  paymentMethod: string;
  network: string;
  country?: string;
  successRedirectUrl?: string;
}): Promise<{
  orderId: string;
  redirectUrl: string;
  sessionId: string | null;
  partnerContext: string;
}> {
  const resp = await api.post('/onramper/checkout', input);
  const data = (resp.data as any)?.data ?? (resp.data as any);
  return {
    orderId: data?.orderId,
    redirectUrl: data?.redirectUrl ?? '',
    sessionId: data?.sessionId ?? null,
    partnerContext: data?.partnerContext ?? '',
  };
}

/** Resolve the user's CoinsPaid destination address for a (currency, network).
 *  The backend provisions a new address via CoinsPaid if none exists. */
export async function fetchOnramperDestinationAddress(input: {
  currency: string;
  network: string;
}): Promise<{ address: string; tag: string | null; isNew: boolean }> {
  const resp = await api.get('/onramper/destination-address', {
    currency: input.currency,
    network: input.network,
  });
  const data = (resp.data as any)?.data ?? (resp.data as any);
  return {
    address: data?.address ?? '',
    tag: data?.tag ?? null,
    isNew: Boolean(data?.isNew),
  };
}

/** Paginated list of the current user's Onramper orders. */
export async function fetchOnramperOrders(
  page = 1,
  limit = 10,
): Promise<{
  data: OnramperOrderRow[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}> {
  const resp = await api.get('/onramper/orders', { page, limit });
  const payload = (resp.data as any)?.data ?? (resp.data as any);
  return {
    data: payload?.data ?? [],
    pagination: payload?.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
}
