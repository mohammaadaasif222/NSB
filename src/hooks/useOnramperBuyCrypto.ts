import { useCallback, useState } from 'react';
import {
  createOnramperCheckout,
  fetchOnramperDestinationAddress,
  fetchOnramperPaymentMethods,
  fetchOnramperQuotes,
  fetchOnramperSupported,
  type OnramperCrypto,
  type OnramperFiat,
  type OnramperPaymentMethod,
  type OnramperQuote,
} from '@/services/onramperService';

interface OnramperState {
  // Catalogue
  fiats: OnramperFiat[];
  cryptos: OnramperCrypto[];
  loadingCatalogue: boolean;
  errorCatalogue: string | null;

  // Payment methods for current (source, destination)
  paymentMethods: OnramperPaymentMethod[];
  loadingPaymentMethods: boolean;

  // Quotes for current (source, destination, amount, paymentMethod)
  quotes: OnramperQuote[];
  loadingQuotes: boolean;
  errorQuotes: string | null;

  // Checkout
  creatingCheckout: boolean;
  errorCheckout: string | null;
}

const INITIAL: OnramperState = {
  fiats: [],
  cryptos: [],
  loadingCatalogue: false,
  errorCatalogue: null,
  paymentMethods: [],
  loadingPaymentMethods: false,
  quotes: [],
  loadingQuotes: false,
  errorQuotes: null,
  creatingCheckout: false,
  errorCheckout: null,
};

/**
 * React hook that mirrors the Onramper flow:
 *   1. loadCatalogue()  — fetch supported fiats + cryptos
 *   2. loadPaymentMethods(source, destination, country?)
 *   3. loadQuotes({...}) — ranked list; first entry has `Recommended`
 *   4. startCheckout({...}) — returns redirectUrl + orderId
 */
export function useOnramperBuyCrypto() {
  const [state, setState] = useState<OnramperState>(INITIAL);

  const loadCatalogue = useCallback(async () => {
    setState((s) => ({ ...s, loadingCatalogue: true, errorCatalogue: null }));
    try {
      const { fiat, crypto } = await fetchOnramperSupported();
      setState((s) => ({
        ...s,
        fiats: fiat,
        cryptos: crypto,
        loadingCatalogue: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loadingCatalogue: false,
        errorCatalogue:
          err instanceof Error ? err.message : 'Failed to load supported currencies',
      }));
    }
  }, []);

  const loadPaymentMethods = useCallback(
    async (source: string, destination: string, country?: string) => {
      setState((s) => ({ ...s, loadingPaymentMethods: true, paymentMethods: [] }));
      try {
        const methods = await fetchOnramperPaymentMethods({ source, destination, country });
        setState((s) => ({ ...s, paymentMethods: methods, loadingPaymentMethods: false }));
      } catch {
        setState((s) => ({ ...s, loadingPaymentMethods: false }));
      }
    },
    [],
  );

  const loadQuotes = useCallback(
    async (input: {
      source: string;
      destination: string;
      amount: number;
      country?: string;
      paymentMethod?: string;
      walletAddress?: string;
    }) => {
      setState((s) => ({ ...s, loadingQuotes: true, errorQuotes: null, quotes: [] }));
      try {
        const quotes = await fetchOnramperQuotes(input);
        setState((s) => ({ ...s, quotes, loadingQuotes: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loadingQuotes: false,
          errorQuotes:
            err instanceof Error
              ? err.message
              : 'Could not fetch quotes right now — try again',
        }));
      }
    },
    [],
  );

  const startCheckout = useCallback(
    async (input: {
      onramp: string;
      source: string;
      destination: string;
      amount: number;
      paymentMethod: string;
      network: string;
      country?: string;
      successRedirectUrl?: string;
    }) => {
      setState((s) => ({ ...s, creatingCheckout: true, errorCheckout: null }));
      try {
        const result = await createOnramperCheckout(input);
        setState((s) => ({ ...s, creatingCheckout: false }));
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed';
        setState((s) => ({ ...s, creatingCheckout: false, errorCheckout: message }));
        throw err;
      }
    },
    [],
  );

  const resolveDestinationAddress = useCallback(
    async (currency: string, network: string) => {
      return fetchOnramperDestinationAddress({ currency, network });
    },
    [],
  );

  return {
    ...state,
    loadCatalogue,
    loadPaymentMethods,
    loadQuotes,
    startCheckout,
    resolveDestinationAddress,
  };
}
