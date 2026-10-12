/**
 * Changelly Fiat API Service Configuration
 *
 * This service handles all Changelly-related API calls through the main API instance.
 * The backend handles authentication and signature verification.
 */

import api from './api';

/**
 * Types for Changelly responses
 */
export interface CryptoListResponse {
  success: boolean;
  data: Array<{
    code: string;
    name: string;
    icon?: string;
  }>;
  message: string;
}

export interface OffersResponse {
  success: boolean;
  data: Array<{
    provider: string;
    rate: number;
    toAmount: number;
    fee: number;
    processingTime?: string;
    minFromAmount?: number;
    maxFromAmount?: number;
  }>;
  rateUpdatedAt: string;
  message: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    iframeUrl: string;
    toAddress: string;
    expectedAmount: number;
    expectedCrypto: string;
  };
  message: string;
}

/**
 * Get list of enabled cryptocurrencies for purchase
 * Only returns cryptos that are enabled for deposits in our system
 */
export const getEnabledCryptos = async (): Promise<CryptoListResponse> => {
  try {
    const response = await api.get<CryptoListResponse>(
      '/wallet/buy-crypto/enabled-cryptos',
    );
    return response?.data || { success: false, data: [], message: '' };
  } catch (error) {
    console.error('[Changelly Service] Error fetching cryptos:', error);
    throw error;
  }
};

/**
 * Get offers from Changelly for a specific currency pair
 * Shows all available payment providers with rates and fees
 *
 * @param fiatAmount Amount user wants to spend (in fiat)
 * @param fiatCurrency Fiat currency code (e.g., 'usd')
 * @param cryptoCode Crypto code (e.g., 'btc')
 * @param country ISO country code (e.g., 'US')
 */
export const getOffers = async (
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCode: string,
  country: string,
): Promise<OffersResponse> => {
  try {
    const response = await api.post<OffersResponse>(
      '/wallet/buy-crypto/offers',
      {
        fiatAmount,
        fiatCurrency,
        cryptoCode,
        country,
      },
    );
    return response?.data || { success: false, data: [], rateUpdatedAt: '', message: '' };
  } catch (error) {
    console.error('[Changelly Service] Error fetching offers:', error);
    throw error;
  }
};

/**
 * Create a Changelly order
 * Returns iframe URL where user completes payment
 * The destination address is LOCKED by Changelly (user cannot modify it)
 *
 * @param fiatAmount Amount user is paying (in fiat)
 * @param fiatCurrency Fiat currency code (e.g., 'usd')
 * @param cryptoCode Crypto code (e.g., 'btc')
 * @param providerId Provider ID from offers list
 * @param country ISO country code (e.g., 'US')
 * @param toAddress User's verified Coinspaid wallet address (LOCKED!)
 * @param network Network code for multi-chain tokens (e.g., 'ETHEREUM', 'SOLANA')
 * @param state US state code (optional)
 */
export const createOrder = async (
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCode: string,
  providerId: string,
  country: string,
  toAddress: string,
  network: string,
  state?: string,
): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post<CreateOrderResponse>(
      '/wallet/buy-crypto/orders',
      {
        fiatAmount,
        fiatCurrency,
        cryptoCode,
        providerId,
        country,
        toAddress,
        network,
        ...(state && { state }),
      },
    );
    return response?.data || {
      success: false,
      data: {
        orderId: '',
        iframeUrl: '',
        toAddress: '',
        expectedAmount: 0,
        expectedCrypto: '',
      },
      message: '',
    };
  } catch (error) {
    console.error('[Changelly Service] Error creating order:', error);
    throw error;
  }
};
