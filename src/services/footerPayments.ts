import apiService from '@/services/api';

export type FooterPaymentMethod =
  | 'visa'
  | 'applepay'
  | 'googlepay'
  | 'paypal'
  | 'ebay'
  | 'mastercard'
  | 'cirrus';

const CACHE_MS = 5 * 60_000;

let cached: { at: number; value: Promise<FooterPaymentMethod[]> } | null = null;

export const fetchFooterPaymentMethods = (): Promise<FooterPaymentMethod[]> => {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }
  const value = apiService
    .get<FooterPaymentMethod[]>('/footer-payment-methods')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : []))
    .catch(() => {
      cached = null;
      return [];
    });
  cached = { at: Date.now(), value };
  return value;
};
