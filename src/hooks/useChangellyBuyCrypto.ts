import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { translate } from '@/i18n/translate';

/**
 * Changelly Buy Crypto API Types
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
  offerId: string;
  rate: string;
  invertedRate: string;
  fee: string;
  amountFrom: string;
  amountExpectedTo: string;
  paymentMethodOffer: PaymentMethod[];
  additionalData: Record<string, any>;
}

export interface CreateOrderResponse {
  orderId: string;
  iframeUrl: string;
  redirectUrl?: string;
  toAddress: string;
  expectedAmount: number;
  expectedCrypto: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

/**
 * Custom hook for Changelly buy crypto flow
 * Manages API calls and state for the buy crypto feature
 */
export const useChangellyBuyCrypto = () => {
  const { token } = useAuth();

  // Loading states
  const [loadingCryptos, setLoadingCryptos] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Data states
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Error states
  const [errorCryptos, setErrorCryptos] = useState<ApiError | null>(null);
  const [errorOffers, setErrorOffers] = useState<ApiError | null>(null);
  const [errorCreateOrder, setErrorCreateOrder] = useState<ApiError | null>(null);

  /**
   * Fetch list of cryptocurrencies available for purchase
   * Only shows cryptos enabled for deposits
   */
  const fetchCryptos = useCallback(async () => {
    try {
      setLoadingCryptos(true);
      setErrorCryptos(null);

      const response = await api.get<{
        success: boolean;
        data: Cryptocurrency[];
        message: string;
      }>('/wallet/buy-crypto/enabled-cryptos');

      const cryptoList = response?.data?.data || [];
      setCryptos(cryptoList);
      return cryptoList;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || translate('misc.buyCrypto.cryptosFailed');
      const err = { message: errorMsg, code: error?.response?.data?.code };
      setErrorCryptos(err);
      console.error('[Changelly] Error fetching cryptos:', err);
      return [];
    } finally {
      setLoadingCryptos(false);
    }
  }, []);

  /**
   * Fetch offers from Changelly for a specific currency pair
   * Shows all available payment providers with rates
   */
  const fetchOffers = useCallback(
    async (
      fiatAmount: number,
      fiatCurrency: string,
      cryptoCode: string,
      country: string,
      state?: string,
    ): Promise<Offer[]> => {
      try {
        if (!fiatAmount || fiatAmount <= 0) {
          throw new Error('Amount must be greater than zero');
        }

        setLoadingOffers(true);
        setErrorOffers(null);

        const response = await api.post<{
          success: boolean;
          data: Offer[];
          rateUpdatedAt: string;
          message: string;
        }>('/wallet/buy-crypto/offers', {
          fiatAmount,
          fiatCurrency,
          cryptoCode,
          country,
          ...(state ? { state } : {}),
        });

        const offerList = response?.data?.data || [];
        setOffers(offerList);
        return offerList;
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || translate('misc.buyCrypto.offersFailed');
        const err = { message: errorMsg, code: error?.response?.data?.code };
        setErrorOffers(err);
        console.error('[Changelly] Error fetching offers:', err);
        return [];
      } finally {
        setLoadingOffers(false);
      }
    },
    [],
  );

  /**
   * Create a Changelly order
   * Returns iframe URL where user completes payment
   * Address is locked to user's verified Coinspaid wallet
   */
  const createOrder = useCallback(
    async (
      fiatAmount: number,
      fiatCurrency: string,
      cryptoCode: string,
      providerId: string,
      country: string,
      toAddress: string,
      state?: string,
    ): Promise<CreateOrderResponse | null> => {
      try {
        if (!token) {
          throw new Error('Not authenticated');
        }

        setCreatingOrder(true);
        setErrorCreateOrder(null);

        const response = await api.post<{
          success: boolean;
          data: CreateOrderResponse;
          message: string;
        }>('/wallet/buy-crypto/orders', {
          fiatAmount,
          fiatCurrency,
          cryptoCode,
          providerId,
          country,
          toAddress,
          ...(state ? { state } : {}),
        });

        return response?.data?.data || null;
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || translate('misc.buyCrypto.orderFailed');
        const err = { message: errorMsg, code: error?.response?.data?.code };
        setErrorCreateOrder(err);
        console.error('[Changelly] Error creating order:', err);
        return null;
      } finally {
        setCreatingOrder(false);
      }
    },
    [token],
  );

  return {
    // Cryptos
    cryptos,
    loadingCryptos,
    errorCryptos,
    fetchCryptos,

    // Offers
    offers,
    loadingOffers,
    errorOffers,
    fetchOffers,

    // Order creation
    creatingOrder,
    errorCreateOrder,
    createOrder,
  };
};
