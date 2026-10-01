/**
 * Google Analytics 4 and Microsoft Clarity.
 *
 *   analytics.<domain>.<event>()   from any component — see events.ts
 *   <Analytics />                  loads both tags — see components/analytics
 *
 * Off unless NEXT_PUBLIC_GA_MEASUREMENT_ID / NEXT_PUBLIC_CLARITY_PROJECT_ID are
 * set, so nothing is collected in development or in a preview that was not
 * deliberately pointed at a property.
 */

export { analytics, failureReason } from './events';

export type {
  AuthMethod,
  CheckoutDetails,
  MoneyMovement,
  OtpPurpose,
  PromotionDetails,
  PurchaseDetails,
  PurchaseFlow,
  PurchaseItem,
} from './events';

export { identify, pageView, resetIdentity, track } from './track';

export { CLARITY_ENABLED, CLARITY_PROJECT_ID, GA_ENABLED, GA_MEASUREMENT_ID } from './config';
