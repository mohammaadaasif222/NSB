import type { TranslationKey } from '@/i18n/locales';

/**
 * Stand-in data for the Referral section.
 *
 * NOT WIRED — there is no referral endpoint, so none of this comes from the
 * backend and the code below is not a code any player actually holds.
 *
 * That matters more here than it does on the Statistic tab. A wrong figure is
 * read and forgotten; a wrong referral code gets *sent to someone*, and the
 * friend who types it in gets nothing. Before this ships, `REFERRAL_CODE` has
 * to come from the API and the copy button has to be disabled until it does.
 * Everything a real implementation needs to replace is in this one file.
 */

/** Matches the placeholder the design prints, so it reads as a sample. */
export const REFERRAL_CODE = '2654FGE15';

export type ReferralStatus = 'completed' | 'pending' | 'inProgress' | 'cancelled';

const STATUS_LABELS = {
  completed: 'ref.completed',
  pending: 'ref.pending',
  inProgress: 'ref.inProgress',
  cancelled: 'ref.cancelled',
} as const satisfies Record<ReferralStatus, TranslationKey>;

export const labelKeyOf = (status: ReferralStatus): TranslationKey => STATUS_LABELS[status];

export interface ReferralRow {
  id: string;
  /** Pre-formatted — the API should send an ISO date and the row should format it. */
  date: string;
  user: string;
  status: ReferralStatus;
  /** `null` reads as "No Change", which is what the design prints for a row with no reward yet. */
  reward: string | null;
}

const REFERRAL_ROWS: readonly ReferralRow[] = [
  {
    id: 'REF-7B2E4A9C',
    date: 'Jul 18, 2025',
    user: 'john.doe@email.com',
    status: 'completed',
    reward: '+$25.00 Bonus',
  },
  {
    id: 'REF-3C4F1D7B',
    date: 'Jul 19, 2025',
    user: 'jane.smith@email.com',
    status: 'pending',
    reward: '-$10.00 Adjustment',
  },
  {
    id: 'REF-9D8E2B6F',
    date: 'Jul 20, 2025',
    user: 'alex.brown@email.com',
    status: 'completed',
    reward: '+$40.00 Bonus',
  },
  {
    id: 'REF-5E7A9C0D',
    date: 'Jul 21, 2025',
    user: 'emily.jones@email.com',
    status: 'inProgress',
    reward: null,
  },
  {
    id: 'REF-2A1F3E4B',
    date: 'Jul 22, 2025',
    user: 'michael.lee@email.com',
    status: 'completed',
    reward: '+$15.00 Bonus',
  },
  {
    id: 'REF-8C7D5F2A',
    date: 'Jul 23, 2025',
    user: 'sarah.wilson@email.com',
    status: 'cancelled',
    reward: '-$5.00 Penalty',
  },
  {
    id: 'REF-4B9E6D3F',
    date: 'Jul 24, 2025',
    user: 'daniel.kim@email.com',
    status: 'completed',
    reward: '+$30.00 Bonus',
  },
  {
    id: 'REF-1F3C8A7D',
    date: 'Jul 25, 2025',
    user: 'laura.evans@email.com',
    status: 'pending',
    reward: null,
  },
  {
    id: 'REF-6D2B7F9E',
    date: 'Jul 26, 2025',
    user: 'chris.martin@email.com',
    status: 'completed',
    reward: '+$20.00 Bonus',
  },
  {
    id: 'REF-0E4A1C5B',
    date: 'Jul 27, 2025',
    user: 'nina.rogers@email.com',
    status: 'inProgress',
    reward: null,
  },
  {
    id: 'REF-7F3D9E2C',
    date: 'Jul 28, 2025',
    user: 'mark.jordan@email.com',
    status: 'completed',
    reward: '+$50.00 Bonus',
  },
];

/**
 * Stands in for `GET /referrals`.
 *
 * Async for the same reason the ledger's is: the section already waits on a
 * result rather than reading a module-level array, so wiring the endpoint is a
 * change to this function's body. Unpaged, because the design's table is — add
 * `page`/`pageSize` here and a `total` to the result when that changes, and
 * the table takes its rows as a prop either way.
 */
export const fetchReferrals = (): Promise<{ rows: readonly ReferralRow[] }> =>
  Promise.resolve({ rows: REFERRAL_ROWS });
