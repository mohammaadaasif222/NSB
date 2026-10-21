import apiService from './api';
import type { Paged, ReferralClaim, ReferralCode, ReferralSummary, ReferredPlayer } from '@/types';

export const getReferralSummary = () => apiService.get<ReferralSummary>('/referrals/me/summary');

export const getReferredPlayers = (params: { page?: number; limit?: number } = {}) =>
  apiService.get<Paged<ReferredPlayer>>('/referrals/me/referred', params);

export const createReferralCode = (body: { code: string; name: string }) =>
  apiService.post<ReferralCode>('/referrals/me/codes', body);

export const updateReferralCode = (id: string, body: { name?: string; is_active?: boolean }) =>
  apiService.patch<ReferralCode>(`/referrals/me/codes/${id}`, body);

export const claimReferralCommission = () => apiService.post<ReferralClaim>('/referrals/me/claim');

export const recordReferralVisit = (code: string) =>
  apiService.post<{ valid: boolean }>(`/referrals/codes/${encodeURIComponent(code)}/visit`);

/** The link a player shares: the site with their code on it. */
export const referralLink = (code: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?ref=${encodeURIComponent(code)}`;
};
