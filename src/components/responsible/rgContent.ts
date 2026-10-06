import type { ExclusionPeriod, LimitKind } from '@/types/responsible';

/**
 * Everything the Responsible Gambling section says.
 *
 * Held here rather than inside the sections, on the same principle as
 * `footerContent.ts`: rewording a question, adding a support organisation or
 * changing the exclusion ladder is an edit to this file and touches no markup.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  BEFORE THIS GOES LIVE — two things need a compliance decision, not a
 *  developer one. Both are marked REVIEW below:
 *
 *    1. SUPPORT_ORGS must carry whatever resource your licensing jurisdiction
 *       mandates. The four here are genuine international services, but they
 *       are not a substitute for the one your licence names.
 *    2. The exclusion ladder and the cooling-off period must match the terms
 *       your licence requires. The values here are the common defaults.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ==================================================================== */
/* Limits                                                                */
/* ==================================================================== */

/**
 * REVIEW: 24 hours is the usual cooling-off before a raised limit applies.
 *
 * The asymmetry is the entire point of the feature: a player who wants less
 * exposure gets it immediately, and a player who wants more has to still want
 * it tomorrow. A limit that can be raised in the moment is not a limit.
 */
export const LIMIT_INCREASE_COOLING_OFF_HOURS = 24;

export interface LimitDefinition {
  kind: LimitKind;
  label: string;
  description: string;
  /** Currency limits take an amount; `session` takes whole minutes. */
  unit: 'currency' | 'minutes';
}

export const LIMIT_DEFINITIONS: readonly LimitDefinition[] = [
  {
    kind: 'deposit',
    label: 'Deposit limit',
    description: 'The most you can add to your balance in the period you choose.',
    unit: 'currency',
  },
  {
    kind: 'loss',
    label: 'Loss limit',
    description: 'Caps what you can lose net of any wins, so a bad run has a floor.',
    unit: 'currency',
  },
  {
    kind: 'wager',
    label: 'Wager limit',
    description: 'The total you can stake, counted whether a bet wins or loses.',
    unit: 'currency',
  },
  {
    kind: 'session',
    label: 'Time limit',
    description: 'How long you can play in the period, after which you are signed out.',
    unit: 'minutes',
  },
];

/**
 * The symbol money is shown in.
 *
 * A single constant because it is a placeholder: once limits are wired, this
 * has to come from the player's display currency (`WalletContext` already
 * resolves one) rather than being assumed. Shown beside a figure the player
 * is about to commit to, so guessing wrong is not cosmetic.
 */
export const DISPLAY_CURRENCY_SYMBOL = '$';

export const LIMIT_PERIOD_LABELS: Record<string, string> = {
  daily: 'Per day',
  weekly: 'Per week',
  monthly: 'Per month',
};

/* ==================================================================== */
/* Self-exclusion                                                        */
/* ==================================================================== */

export interface ExclusionOption {
  value: ExclusionPeriod;
  label: string;
  /** Shown under the label so the weight of the choice is legible. */
  note: string;
  /**
   * Long exclusions ask the player to type a confirmation phrase. A single
   * mis-click should not be able to close an account for five years.
   */
  requiresTypedConfirmation?: boolean;
}

/** REVIEW: confirm this ladder matches your licence conditions. */
export const EXCLUSION_OPTIONS: readonly ExclusionOption[] = [
  // "24 Hours Cooldown" is the design's own name for this one — it heads the
  // Step 1 card and the confirm dialog with it, so the label carries it rather
  // than each call site re-wording it.
  {
    value: '24h',
    label: '24 Hours Cooldown',
    note: 'A short break. Your account reopens automatically.',
  },
  { value: '7d', label: '7 days', note: 'A week away. Your account reopens automatically.' },
  { value: '30d', label: '30 days', note: 'A month away. Your account reopens automatically.' },
  { value: '3m', label: '3 months', note: 'Your account stays closed for the full period.' },
  { value: '6m', label: '6 months', note: 'Your account stays closed for the full period.' },
  { value: '1y', label: '1 year', note: 'Your account stays closed for the full period.' },
  {
    value: '5y',
    label: '5 years',
    note: 'A long exclusion. Please be certain before you confirm.',
    requiresTypedConfirmation: true,
  },
  {
    value: 'permanent',
    label: 'Permanent',
    note: 'Your account is closed for good and cannot be reopened.',
    requiresTypedConfirmation: true,
  },
];

/** What a player types to confirm a long or permanent exclusion. */
export const EXCLUSION_CONFIRM_PHRASE = 'EXCLUDE ME';

/** The facts a player is owed before they confirm. Nothing here is softened. */
export const EXCLUSION_TERMS: readonly string[] = [
  'It cannot be undone. Once confirmed, the exclusion runs for the full period you chose — support cannot shorten or lift it, whatever the reason.',
  'You will be signed out immediately and will not be able to deposit, bet or open a new account.',
  'Any balance you are holding is returned to you. Open bets are settled as normal.',
  'All marketing stops. You will not receive promotional email, SMS or push from us for the duration.',
  'Bonuses, free spins and loyalty progress tied to the account are forfeited and do not return when the period ends.',
  'When the period ends your account does not reopen on its own unless the period says so above — you have to ask for it back, and there is a waiting period before that takes effect.',
];

/* ==================================================================== */
/* Self-assessment                                                       */
/* ==================================================================== */

/**
 * A reflection tool, not a clinical instrument.
 *
 * These cover the same ground the recognised screens do — chasing, borrowing,
 * concealment, tolerance, and the effect on money, health and the people
 * around you. They are written as plain yes/no questions rather than copied
 * from a scored instrument, because presenting a modified instrument under
 * its own name would misrepresent what the score means.
 *
 * Nothing here diagnoses anything, and the result copy says so.
 */
export interface AssessmentQuestion {
  id: string;
  text: string;
}

export const ASSESSMENT_QUESTIONS: readonly AssessmentQuestion[] = [
  { id: 'q1', text: 'Have you bet more than you could really afford to lose?' },
  { id: 'q2', text: 'Have you needed to bet larger amounts to get the same excitement?' },
  { id: 'q3', text: 'Have you gone back another day to win back money you lost?' },
  { id: 'q4', text: 'Have you borrowed money or sold anything in order to gamble?' },
  { id: 'q5', text: 'Have you felt that you might have a problem with gambling?' },
  { id: 'q6', text: 'Has gambling caused you stress, anxiety or other health problems?' },
  {
    id: 'q7',
    text: 'Have other people criticised your gambling, whether or not you thought they were right?',
  },
  {
    id: 'q8',
    text: 'Has gambling caused money problems for you or the people you live with?',
  },
  { id: 'q9', text: 'Have you felt guilty about how you gamble, or what happens when you do?' },
  {
    id: 'q10',
    text: 'Have you hidden your gambling, or played down how much you gamble, from people close to you?',
  },
];

export interface AssessmentBandCopy {
  heading: string;
  body: string;
  /** Surfaces the support links under the result. */
  urgeSupport: boolean;
}

export const ASSESSMENT_BANDS: Record<'low' | 'moderate' | 'high', AssessmentBandCopy> = {
  low: {
    heading: 'No warning signs in your answers',
    body: 'Nothing you answered points to a problem today. That can change without being obvious, so it is worth coming back to these questions now and then — and setting a deposit limit while you feel in control costs you nothing.',
    urgeSupport: false,
  },
  moderate: {
    heading: 'Some signs worth paying attention to',
    body: 'A few of your answers are the ones services ask about for a reason. This is not a diagnosis and it does not mean you have a problem — but it is a good moment to set a limit, and to talk to somebody if any of it felt uncomfortably close.',
    urgeSupport: true,
  },
  high: {
    heading: 'Several signs you should not ignore',
    body: 'You answered yes to a number of the questions that matter most. We are not able to tell you what that means for you — but the people below can, they do it free and in confidence, and talking to them is not a commitment to stopping. Please consider setting a limit or taking a break while you think it over.',
    urgeSupport: true,
  },
};

/** Where the bands fall, out of `ASSESSMENT_QUESTIONS.length`. */
export const ASSESSMENT_THRESHOLDS = { moderate: 1, high: 4 } as const;

/* ==================================================================== */
/* Support                                                               */
/* ==================================================================== */

/**
 * REVIEW — COMPLIANCE.
 *
 * These four are real, independent, free and international, which is why they
 * are safe to ship as a starting point. They are NOT a substitute for the
 * resource your licence requires you to display, which depends on where you
 * are licensed and where the player is.
 *
 * No telephone numbers: helpline numbers differ by country and change, and a
 * number that rings out is worse than a link that works. Each site below
 * routes a visitor to the right local service.
 */
export interface SupportOrg {
  name: string;
  description: string;
  href: string;
}

export const SUPPORT_ORGS: readonly SupportOrg[] = [
  {
    name: 'Gambling Therapy',
    description: 'Free online support and live chat, available internationally in many languages.',
    href: 'https://www.gamblingtherapy.org/',
  },
  {
    name: 'Gamblers Anonymous',
    description: 'A worldwide fellowship of people recovering from a gambling problem.',
    href: 'https://www.gamblersanonymous.org/',
  },
  {
    name: 'GamCare',
    description: 'Free information, advice and counselling for anyone affected by gambling.',
    href: 'https://www.gamcare.org.uk/',
  },
  {
    name: 'BeGambleAware',
    description: 'Independent advice, a self-assessment and a directory of local treatment.',
    href: 'https://www.begambleaware.org/',
  },
];

/* ==================================================================== */
/* FAQs                                                                  */
/* ==================================================================== */

export interface RgFaq {
  question: string;
  answer: string;
}

export const RG_FAQS: readonly RgFaq[] = [
  {
    question: 'How do I create an account on the Casino platform?',
    // Verbatim from the design — the one answer it actually writes out.
    answer:
      'To create an account, click the "Sign Up" button located at the top right corner of the homepage. Fill in the required details, including your email address, username, and a secure password. You will then receive a verification email — click the link to confirm your account. Once verified, you can log in, make your first deposit, and start playing. The entire process takes just a few minutes.',
  },
  {
    question: 'Is my personal and financial information secure?',
    answer:
      'Traffic between your device and our servers is encrypted, and card and wallet details are handled by our payment partners rather than stored on our systems. You can add two-factor authentication from Security in your account, and the same screen lists the devices currently signed in so an unfamiliar one is easy to spot and end.',
  },
  {
    question: 'What should I do if I forget my account password?',
    answer:
      'Use the "Forgot password" link on the sign-in screen. We email a reset link to the address on the account; opening it lets you set a new password. The link is single-use, and requesting a new one makes any earlier link invalid. If the email does not arrive, check your spam folder before asking for another.',
  },
  {
    question: 'Which games are available on the Casino platform?',
    answer:
      'Slots, live casino, table games and our own Rolluck Originals, listed under All Games with a provider filter if you are looking for a particular studio. Originals are provably fair — each round is built from a server seed, your client seed and a nonce, and you can change your seed and check any past round yourself.',
  },
  {
    question: 'What payment methods are accepted for deposits?',
    answer:
      'The wallet lists every method your account is eligible for, with the minimum, the maximum and what to expect for each. Crypto deposits credit once the network confirmations shown on the deposit screen have been seen. The methods offered can differ by account and by location, so the wallet is the accurate list rather than anything printed here.',
  },
  {
    question: 'What bonuses and promotions are available for new players?',
    answer:
      'The welcome package is shown on the lobby and in Promotions, and it attaches to your account at registration — there is nothing to redeem by hand. Promotions change, so Promotions is the current list; each one carries its own terms, which are worth reading before you opt in.',
  },
  {
    question: 'Are there any wagering requirements on bonus offers?',
    answer:
      'Usually yes, and the requirement is stated on the offer itself. Progress against it is shown with your bonus balance. Bonus funds are spent after your real balance, so you are never wagering a bonus while cash is still available, and the bonus converts to withdrawable funds once its requirement is met.',
  },
  {
    question: 'Can I play Casino games on my mobile device?',
    answer:
      'Yes. The site runs in a mobile browser with the same account, the same wallet and the same games — there is no separate app to install, and nothing needs to be transferred.',
  },
  {
    question: 'How long do withdrawals take to process?',
    answer:
      'A withdrawal is reviewed before it is sent, and how long the money then takes depends on the method you chose — crypto settles once the network confirms it, card and wallet returns on whatever schedule the provider keeps. A first withdrawal can take longer if identity verification has not been completed yet; clearing that once keeps later payouts on the faster path.',
  },
  {
    question: 'How do I verify my identity to comply with KYC requirements?',
    answer:
      'Verification lives under Verification in your account. You will be asked for identity details and documents; which ones depends on the checks that apply to you. Some actions — withdrawals in particular — can be held until it is complete, so it is worth doing before you need it rather than at the moment you want to cash out.',
  },
  {
    question: 'How can I set deposit limits or self-exclude for responsible gaming?',
    answer:
      'Both are on this page. Gambling Limits sets a cap on what you can deposit, and a reduction takes effect immediately while an increase is held for a cooling-off period, so a limit cannot be lifted in the moment you most want to lift it. Self-exclusion closes play for a period you choose and cannot be reversed early.',
  },
  {
    question: 'How do I contact customer support if I have an issue?',
    answer:
      'Email support@rolluck.com and include your username and what you were doing when the problem happened — it is the fastest route to someone who can look at your account. If what you need is independent of us, the organisations listed under Self-exclusion are free and confidential, and talking to them does not commit you to anything.',
  },
];

/* ==================================================================== */
/* Budget calculator                                                     */
/* ==================================================================== */

export interface BudgetFieldDef {
  key: keyof import('@/types/responsible').BudgetInput;
  label: string;
  hint: string;
  /** Income is added; everything else is subtracted. */
  kind: 'income' | 'outgoing';
}

export const BUDGET_FIELDS: readonly BudgetFieldDef[] = [
  {
    key: 'income',
    label: 'Monthly take-home income',
    hint: 'What actually reaches your account after tax.',
    kind: 'income',
  },
  {
    key: 'housing',
    label: 'Rent or mortgage',
    hint: 'Including any service charge.',
    kind: 'outgoing',
  },
  {
    key: 'utilities',
    label: 'Bills and utilities',
    hint: 'Power, water, internet, phone.',
    kind: 'outgoing',
  },
  { key: 'food', label: 'Food and household', hint: 'Groceries and essentials.', kind: 'outgoing' },
  { key: 'transport', label: 'Transport', hint: 'Fuel, fares, insurance.', kind: 'outgoing' },
  {
    key: 'debts',
    label: 'Loan and card repayments',
    hint: 'The minimum you must pay each month.',
    kind: 'outgoing',
  },
  {
    key: 'savings',
    label: 'Savings and commitments',
    hint: 'Money already promised elsewhere.',
    kind: 'outgoing',
  },
  {
    key: 'other',
    label: 'Everything else',
    hint: 'Childcare, subscriptions, medical.',
    kind: 'outgoing',
  },
];
