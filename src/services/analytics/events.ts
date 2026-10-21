import { track } from './track';

/**
 * The event catalogue: every name the app is allowed to send, in one place.
 *
 * Call sites never type an event name or a parameter bag by hand. That is what
 * keeps the reports usable a year from now — a name is spelled one way, a
 * parameter means one thing, and renaming an event is a compile error rather
 * than a slow leak of orphaned rows into GA4.
 *
 * Where GA4 already has a name for something (`login`, `sign_up`, `purchase`,
 * `view_promotion`, `share`) that name is used, because those feed the built-in
 * reports — monetisation, funnels, promotions — that custom names never reach.
 * Everything a casino needs and GA4 has no word for is a custom event.
 *
 * Several domains below have no feature behind them yet: payments, redemption,
 * subscriptions, document KYC, bonus claims and referrals are all placeholder
 * screens today. Their events are written out anyway so the flow can be
 * measured from its first day rather than instrumented months later, when the
 * "before" is already gone. Each one is marked NOT WIRED YET.
 *
 * Never pass an email address, mobile number, username or card detail into any
 * of these. GA4's terms forbid it, Clarity keeps what it is handed, and neither
 * can be cleaned up afterwards.
 */

/* -------------------------------------------------------------- shared -- */

/** How a player identified themselves. */
export type AuthMethod = 'mail' | 'phone' | 'username' | 'google';

/** Which code a one-time password belongs to. */
export type OtpPurpose = 'sign_up' | 'password_reset';

/** Which kind of purchase a checkout is. */
export type PurchaseFlow = 'cash_bundle' | 'subscription';

/** One purchasable thing, in the shape GA4's commerce reports expect. */
export interface PurchaseItem {
  item_id: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export interface CheckoutDetails {
  flow: PurchaseFlow;
  value: number;
  currency: string;
  payment_method?: string;
  items?: PurchaseItem[];
}

export interface PurchaseDetails extends CheckoutDetails {
  /** Our own order id. Never a card token, PSP customer id or payment handle. */
  transaction_id: string;
}

export interface MoneyMovement {
  value: number;
  currency: string;
  /** "bank_transfer", "card", "crypto" — the method, not the account. */
  method?: string;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const LONG_DIGITS = /\d{6,}/g;

/**
 * Turn a failure into something safe to keep forever.
 *
 * Server messages are written for the player and quote what the player typed
 * ("No account found for jo@example.com"), so they cannot be forwarded as they
 * are. Addresses and long digit runs — numbers, card fragments, account ids —
 * are stripped, and the result is cut to GA4's 100-character parameter limit.
 */
export const failureReason = (error: unknown): string => {
  const message =
    typeof error === 'string' ? error : ((error as { message?: string })?.message ?? 'unknown');

  return message.replace(EMAIL, '[redacted]').replace(LONG_DIGITS, '[redacted]').slice(0, 100);
};

/* ---------------------------------------------------------------- auth -- */

const auth = {
  /** A sign-up method was chosen — the top of the registration funnel. */
  signUpStarted: (method: AuthMethod): void => track('sign_up_start', { method }),

  /** The form passed client-side validation and went to the server. */
  signUpSubmitted: (method: AuthMethod): void => track('sign_up_submitted', { method }),

  /** The account now exists (still unverified). GA4's own name for this. */
  signUpCompleted: (method: AuthMethod): void => track('sign_up', { method }),

  signUpFailed: (method: AuthMethod, reason: string): void =>
    track('sign_up_failed', { method, reason }),

  /**
   * Whether the player accepted marketing at sign-up — the size of the list
   * promotions can actually reach. Only the answer is recorded; the address it
   * applies to belongs in the CRM, not here.
   */
  marketingOptIn: (accepted: boolean): void => track('marketing_opt_in', { accepted }),

  otpSent: (purpose: OtpPurpose, method?: AuthMethod): void =>
    track('otp_sent', { purpose, method }),

  otpResent: (purpose: OtpPurpose): void => track('otp_resend', { purpose }),

  /** The code was accepted — for a sign-up, this is where the account activates. */
  otpVerified: (purpose: OtpPurpose): void => track('otp_verified', { purpose }),

  otpFailed: (purpose: OtpPurpose, reason: string): void =>
    track('otp_failed', { purpose, reason }),

  loginStarted: (method: AuthMethod): void => track('login_start', { method }),

  /** GA4's own name for a completed sign-in. */
  loginCompleted: (method: AuthMethod): void => track('login', { method }),

  loginFailed: (method: AuthMethod, reason: string): void =>
    track('login_failed', { method, reason }),

  logout: (): void => track('logout'),

  passwordResetRequested: (): void => track('password_reset_requested'),

  passwordResetCompleted: (): void => track('password_reset_completed'),

  passwordResetFailed: (reason: string): void => track('password_reset_failed', { reason }),

  /** Changed from inside the account area, by a player who knows the old one. */
  passwordChanged: (): void => track('password_changed'),

  twoFactorToggled: (enabled: boolean): void => track('two_factor_toggled', { enabled }),
};

/* ----------------------------------------------------------------- kyc -- */

const kyc = {
  /** The verification screen was opened, and what it found there. */
  sectionViewed: (emailVerified: boolean): void =>
    track('kyc_section_viewed', { email_verified: emailVerified }),

  emailVerificationRequested: (): void => track('email_verification_requested'),

  emailVerified: (): void => track('email_verified'),

  /** NOT WIRED YET — no document endpoint exists. */
  started: (level?: string): void => track('kyc_started', { level }),

  /** NOT WIRED YET. `documentType` is the kind of document, never its number. */
  documentUploaded: (documentType: string): void =>
    track('kyc_document_uploaded', { document_type: documentType }),

  /** NOT WIRED YET. Upgraded: a failed KYC is worth watching back. */
  submitted: (documentCount?: number): void =>
    track('kyc_submitted', { document_count: documentCount }, { upgrade: 'kyc_submitted' }),

  /** NOT WIRED YET. */
  approved: (): void => track('kyc_approved'),

  /** NOT WIRED YET. */
  rejected: (reason: string): void => track('kyc_rejected', { reason }),
};

/* ------------------------------------------------------------- payment -- */

const payment = {
  /** NOT WIRED YET. The bundle shelf was shown. GA4's commerce list event. */
  bundlesViewed: (bundles: PurchaseItem[]): void =>
    track('view_item_list', { item_list_id: 'cash_bundles', items: bundles }),

  /** NOT WIRED YET. */
  bundleSelected: (bundle: PurchaseItem): void =>
    track('select_item', { item_list_id: 'cash_bundles', items: [bundle] }),

  /**
   * NOT WIRED YET. Checkout opened — the moment money becomes possible, and
   * the point from which the recording is worth keeping in full.
   */
  checkoutStarted: (details: CheckoutDetails): void =>
    track('begin_checkout', { ...details }, { upgrade: 'checkout' }),

  /** NOT WIRED YET. */
  paymentInfoAdded: (flow: PurchaseFlow, paymentMethod: string): void =>
    track('add_payment_info', { flow, payment_method: paymentMethod }),

  /**
   * NOT WIRED YET. A completed purchase. GA4's `purchase` is what drives every
   * revenue report, so `value`, `currency` and a stable `transaction_id` matter
   * more here than anywhere else in the catalogue — a repeated id is discarded
   * as a duplicate, which is exactly what a page refresh should do.
   */
  purchaseCompleted: (details: PurchaseDetails): void => track('purchase', { ...details }),

  /** NOT WIRED YET. The one event that pays for the whole integration. */
  paymentFailed: (
    flow: PurchaseFlow,
    reason: string,
    paymentMethod?: string,
    value?: number,
    currency?: string
  ): void =>
    track(
      'payment_failed',
      { flow, reason, payment_method: paymentMethod, value, currency },
      { upgrade: 'payment_failed' }
    ),

  /** NOT WIRED YET. Left checkout without paying. */
  checkoutAbandoned: (flow: PurchaseFlow, step?: string): void =>
    track('checkout_abandoned', { flow, step }),
};

/* -------------------------------------------------------------- redeem -- */

const redeem = {
  /** NOT WIRED YET. The redemption form was opened. */
  started: (): void => track('redeem_started'),

  /** NOT WIRED YET. Submitted for approval. */
  requested: (movement: MoneyMovement): void =>
    track('redeem_requested', { ...movement }, { upgrade: 'redeem_requested' }),

  /** NOT WIRED YET. Paid out. */
  completed: (movement: MoneyMovement): void => track('redeem_completed', { ...movement }),

  /** NOT WIRED YET. Rejected, or failed on the way out. */
  failed: (reason: string, value?: number, currency?: string): void =>
    track('redeem_failed', { reason, value, currency }, { upgrade: 'redeem_failed' }),

  /** NOT WIRED YET. Withdrawn by the player before it was paid. */
  cancelled: (reason?: string): void => track('redeem_cancelled', { reason }),
};

/* -------------------------------------------------------- subscription -- */

const subscription = {
  /** NOT WIRED YET. */
  plansViewed: (plans: PurchaseItem[]): void =>
    track('view_item_list', { item_list_id: 'subscription_plans', items: plans }),

  /** NOT WIRED YET. */
  planSelected: (plan: PurchaseItem): void =>
    track('select_item', { item_list_id: 'subscription_plans', items: [plan] }),

  /**
   * NOT WIRED YET. A subscription that has started billing.
   *
   * This is `purchase` as well, on purpose: a subscription is revenue, and
   * splitting it into a custom event would leave it out of every monetisation
   * report. `flow: 'subscription'` is what separates the two in a breakdown.
   */
  purchased: (details: PurchaseDetails): void => track('purchase', { ...details }),

  /** NOT WIRED YET. A renewal charge, which is revenue but not a new customer. */
  renewed: (planId: string, value: number, currency: string): void =>
    track('subscription_renewed', { plan_id: planId, value, currency }),

  /** NOT WIRED YET. */
  cancelled: (planId: string, reason?: string): void =>
    track('subscription_cancelled', { plan_id: planId, reason }),

  /** NOT WIRED YET. A renewal the card refused — churn that nobody chose. */
  renewalFailed: (planId: string, reason: string): void =>
    track('subscription_renewal_failed', { plan_id: planId, reason }),
};

/* --------------------------------------------------------------- bonus -- */

const bonus = {
  /** The rewards tray was opened. */
  panelViewed: (): void => track('bonus_panel_viewed'),

  /** NOT WIRED YET — the rewards list is static until the endpoint lands. */
  offerViewed: (bonusId: string, bonusType?: string): void =>
    track('bonus_offer_viewed', { bonus_id: bonusId, bonus_type: bonusType }),

  /** NOT WIRED YET. */
  claimStarted: (bonusId: string): void => track('bonus_claim_started', { bonus_id: bonusId }),

  /** NOT WIRED YET. */
  claimed: (bonusId: string, bonusType?: string, value?: number, currency?: string): void =>
    track('bonus_claimed', { bonus_id: bonusId, bonus_type: bonusType, value, currency }),

  /** NOT WIRED YET. */
  claimFailed: (bonusId: string, reason: string): void =>
    track('bonus_claim_failed', { bonus_id: bonusId, reason }),
};

/* ----------------------------------------------------------- promotion -- */

export interface PromotionDetails {
  promotion_id: string;
  promotion_name: string;
  /** Which artwork or copy variant was shown, when there is more than one. */
  creative_name?: string;
  /** Where on the site it appeared: "home_hero", "lobby_banner". */
  location_id?: string;
}

const promotion = {
  /** Shown to the player. GA4's own promotion report is built from these two. */
  viewed: (details: PromotionDetails): void => track('view_promotion', { ...details }),

  /** Clicked. */
  selected: (details: PromotionDetails): void => track('select_promotion', { ...details }),
};

/* ------------------------------------------------------------ referral -- */

const referral = {
  /** The referral screen was opened. */
  sectionViewed: (): void => track('referral_section_viewed'),

  linkCopied: (): void => track('referral_link_copied'),

  /** GA4's own name; `method` is where it was shared. */
  shared: (method: string): void => track('share', { method, content_type: 'referral_link' }),

  /**
   * A sign-up that arrived on someone's code. Tracked on the new account's
   * session, which is where the conversion actually happens.
   */
  signUpAttributed: (source?: string): void => track('referral_sign_up', { source }),

  /** The referrer claimed commission. */
  rewardEarned: (value?: number, currency?: string): void =>
    track('referral_reward_earned', { value, currency }),
};

/* -------------------------------------------------------------- wallet -- */

const wallet = {
  /** The wallet and transaction history screen was opened. */
  viewed: (): void => track('wallet_viewed'),

  /** Real and bonus funds behave differently; which one is active matters. */
  switched: (walletType: string): void => track('wallet_switched', { wallet: walletType }),
};

export const analytics = {
  auth,
  kyc,
  payment,
  redeem,
  subscription,
  bonus,
  promotion,
  referral,
  wallet,
} as const;
