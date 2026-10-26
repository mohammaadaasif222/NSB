/**
 * Live chat.
 *
 * Note what is NOT here: VIP tier, account status, wagering. Those are written
 * to Intercom by the API and never travel through the browser, because
 * anything the page receives is something the page could also have sent. See
 * the backend's model/intercom.attributes.ts for the split.
 */

/** What the messenger boots with. Decided by the API, forwarded verbatim. */
export interface IntercomDisplayAttributes {
  user_id: string;
  name: string;
  /** Absent for phone-signup accounts that have not added an address. */
  email?: string;
  /** Unix seconds. */
  created_at: number;
}

/** GET /intercom/identity */
export interface IntercomIdentityResponse {
  /** Empty when the API has no INTERCOM_SECRET — chat then runs unverified. */
  token: string;
  attributes: IntercomDisplayAttributes;
}

/** GET /intercom/settings — the launcher switches, set in System config. */
export interface SupportChatSettings {
  intercom_chat_enabled: boolean;
  internal_chat_enabled: boolean;
  chat_ambience_enabled?: boolean;
  chat_regional_rooms_enabled?: boolean;
  /**
   * Intercom workspace App ID, served at runtime so the switch above works
   * without a rebuild. Empty means not configured on the API, and the bubble
   * stays hidden however the switch is set.
   */
  intercom_app_id: string;
}
