import apiService from './api';
import { translate } from '@/i18n/translate';
import type {
  PlayerKycProfile,
  PlayerKycTiers,
  SumsubTokenResponse,
  SubmitLevel1Payload,
} from '@/types/kyc';

export const kycApi = {
  /**
   * Submits Level 1 Personal Information.
   */
  submitLevel1: async (payload: SubmitLevel1Payload): Promise<PlayerKycProfile> => {
    const res = await apiService.post<PlayerKycProfile>('/kyc/level-1', payload);
    if (!res.success || !res.data) {
      throw new Error(res.message || translate('misc.kyc.submitFailed'));
    }
    return res.data;
  },
  /**
   * Generates or refreshes a Sumsub WebSDK access token.
   */
  getSumsubToken: async (source?: string): Promise<SumsubTokenResponse> => {
    const domain = source || (typeof window !== 'undefined' ? window.location.hostname : undefined);
    const res = await apiService.post<SumsubTokenResponse>('/kyc/sumsub/token', {
      source: domain,
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || translate('misc.kyc.tokenFailed'));
    }
    return res.data;
  },

  /**
   * Retrieves current player-safe KYC profile and status.
   */
  getKycMe: async (): Promise<PlayerKycProfile | null> => {
    try {
      const res = await apiService.get<PlayerKycProfile>('/kyc/me');
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch {
      // 404 means no profile started yet
      return null;
    }
  },

  /**
   * Triggers an immediate on-demand reconciliation with Sumsub.
   */
  syncKyc: async (): Promise<PlayerKycProfile | null> => {
    try {
      const res = await apiService.post<PlayerKycProfile>('/kyc/sync');
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * WebSDK token for a progressive level (3 or 4).
   *
   * Throws rather than returning null: the caller opens a verification widget
   * with the result, and the backend's message ("document collection is not
   * switched on", "Level 2 must be complete first") is what the player needs
   * to see.
   */
  /** The widget token for a liveness re-check staff asked for. */
  getLivenessToken: async (): Promise<SumsubTokenResponse> => {
    const res = await apiService.post<SumsubTokenResponse>('/kyc/liveness/token');
    if (!res.success || !res.data) {
      throw new Error(res.message || translate('misc.kyc.levelFailed'));
    }
    return res.data;
  },

  getTierToken: async (tier: number): Promise<SumsubTokenResponse> => {
    const res = await apiService.post<SumsubTokenResponse>(`/kyc/tiers/${tier}/token`);
    if (!res.success || !res.data) {
      throw new Error(res.message || translate('misc.kyc.levelFailed'));
    }
    return res.data;
  },

  /**
   * Progressive verification levels (3 and 4).
   *
   * Returns null rather than throwing: these levels are supplementary, and a
   * failure here must not stop the Level 1/2 flow from rendering.
   */
  getTiers: async (): Promise<PlayerKycTiers | null> => {
    try {
      const res = await apiService.get<PlayerKycTiers>('/kyc/tiers');
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Reconciles in-flight levels with Sumsub before returning them. Used after
   * the widget closes, so a missed webhook does not strand a level in review.
   */
  syncTiers: async (): Promise<PlayerKycTiers | null> => {
    try {
      const res = await apiService.post<PlayerKycTiers>('/kyc/tiers/sync');
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },
};

export default kycApi;
