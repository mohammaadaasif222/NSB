/**
 * The summary terms the Affiliate page prints.
 *
 * NOT THE LEGAL DOCUMENT. `/terms-of-service` carries the real one, written
 * against how the product actually behaves; this is the short restatement the
 * design puts on this page, and the two are not the same words.
 *
 * That is a problem worth naming rather than hiding: two documents that both
 * read as "the terms" will drift, and the short one is the one a player sees
 * at the moment they are deciding to share a link. Either this becomes a
 * genuine summary that is reviewed alongside the full document, or the panel
 * links to `/terms-of-service` instead of restating it. Counsel's call, not
 * this file's — but it is kept in one place so it is a single edit either way.
 */

export interface TermsSection {
  /** Numbered exactly as the design prints them. */
  heading: string;
  points: readonly string[];
}

export const TERMS_INTRO =
  'Welcome to Rolluck. By creating an account or using our website, games, promotions, and services, you agree to these Terms & Conditions.';

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    heading: '1. About Rolluck',
    points: [
      'Rolluck provides online gaming and entertainment services through its website and related platforms. These Terms explain the rules that apply when you use our services.',
    ],
  },
  {
    heading: '2. Eligibility',
    points: [
      'You must meet the minimum legal age and all other eligibility requirements applicable in your location to use Rolluck.',
      'You are responsible for ensuring that online gaming is legally permitted in your jurisdiction.',
      'Rolluck reserves the right to verify your age, identity, and eligibility at any time.',
    ],
  },
  {
    heading: '3. Your Account',
    points: [
      'You are responsible for providing accurate and up-to-date information when creating your account.',
      'You must keep your login details confidential and must not allow another person to use your account.',
      'One person may only maintain accounts as permitted by Rolluck.',
      'If we identify suspicious, fraudulent, or unauthorized activity, we may restrict, suspend, or close an account.',
    ],
  },
  {
    heading: '4. Deposits & Withdrawals',
    points: [
      'All deposits must come from a payment method that you are authorized to use.',
      'You are responsible for checking your balance and transaction information.',
      'Withdrawals may require identity verification and additional checks before being processed.',
      'Processing times may vary depending on the payment method and verification requirements.',
    ],
  },
  {
    heading: '5. Games & Results',
    points: [
      'All games are subject to their individual rules and conditions.',
      'Game results are determined by the applicable game systems and technologies used by Rolluck.',
      'In the event of a technical issue, system error, or malfunction, Rolluck may take appropriate action, including voiding affected transactions or games where permitted by applicable law.',
    ],
  },
  {
    heading: '6. Bonuses & Promotions',
    points: [
      'Promotions, bonuses, rewards, and campaigns may have their own specific terms.',
      'You must read and understand the applicable promotional conditions before participating.',
      'Rolluck reserves the right to cancel, modify, or withdraw a promotion where permitted by applicable law.',
    ],
  },
  {
    heading: '7. Responsible Gaming',
    points: [
      'We want gaming to remain entertainment.',
      'Set limits, understand your spending, and only play with money you can afford to lose.',
      'If gaming stops feeling like entertainment, take a break and use the responsible gaming tools available through Rolluck.',
    ],
  },
  {
    heading: '8. Prohibited Activities',
    points: [
      'You must not use Rolluck for fraud, money laundering, unauthorized transactions, cheating, manipulation, or any other unlawful activity.',
      'You must not attempt to interfere with our website, games, systems, or security measures.',
    ],
  },
  {
    heading: '9. Account Suspension & Closure',
    points: [
      'Rolluck may suspend or close an account where there is a breach of these Terms, suspected fraud, security concerns, legal requirements, or other legitimate reasons.',
      'Where required by law, applicable balances will be handled according to the relevant procedures.',
    ],
  },
];
