/**
 * Stand-in data for the Affiliate page.
 *
 * NOT WIRED. There is no affiliate endpoint, so every figure below is invented
 * and the link is not one any player actually holds. This is the one file to
 * replace when the API arrives.
 *
 * The link matters more than the figures, for the same reason the referral
 * code does: a wrong total is read and forgotten, but a wrong affiliate link
 * gets *sent to people*, and everyone who signs up through it earns the player
 * nothing. Before this ships, `AFFILIATE_LINK` has to come from the API and
 * the copy and share controls have to stay disabled until it does.
 */

/** Matches the placeholder the design prints, so it reads as a sample. */
export const AFFILIATE_LINK = 'https://staging.xyzlife.top/r/Akiii134';

export interface AffiliateSummary {
  /** Pre-formatted. The API should send numbers and the page should format. */
  totalEarnings: string;
  totalWagered: string;
  totalCollected: string;
  /** A count, not money — the design prints it bare. */
  totalReferrals: number;
  availableFunds: string;
}

const SUMMARY: AffiliateSummary = {
  totalEarnings: '$526,10.00',
  totalWagered: '$245.00',
  totalCollected: '$984,125.00',
  totalReferrals: 5,
  availableFunds: '$526,10.00',
};

/**
 * Stands in for `GET /affiliate/summary`.
 *
 * Async so the page already waits on a result rather than reading a
 * module-level object — wiring the endpoint is then a change to this function
 * body and nothing else.
 */
export const fetchAffiliateSummary = (): Promise<AffiliateSummary> => Promise.resolve(SUMMARY);
