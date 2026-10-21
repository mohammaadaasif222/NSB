/** The referral programme. Amounts are USD strings. */

export type ReferralStatus = 'PENDING' | 'ACTIVE' | 'ON_HOLD' | 'REJECTED';
export type ReferralClaimStatus = 'COMPLETED' | 'PENDING_REVIEW' | 'REJECTED';

export interface CommissionTier {
  min_active: number;
  rate: number;
}

export interface ReferralCode {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  clicks: number;
  referrals: number;
  created_at: string;
}

export interface ReferralStats {
  referred: number;
  active: number;
  total_wagered: string;
  total_earned: string;
  available: string;
  held: string;
  claimed: string;
  pending_review: string;
}

export interface ReferralSummary {
  enabled: boolean;
  codes: ReferralCode[];
  stats: ReferralStats;
  tier: { current: CommissionTier | null; next: CommissionTier | null; tiers: CommissionTier[] };
  min_claim: string;
  can_claim: boolean;
  min_qualifying_deposit: string;
}

export interface ReferredPlayer {
  id: string;
  username: string;
  status: ReferralStatus;
  code: string | null;
  joined_at: string;
  qualified_at: string | null;
  total_wagered: string;
  total_commission: string;
}

export interface ReferralClaim {
  id: string;
  amount: string;
  status: ReferralClaimStatus;
  review_note: string | null;
  created_at: string;
  credited_at: string | null;
}
