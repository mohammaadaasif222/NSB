import type { TranslationKey } from '@/i18n/locales';
import type { UserRole, UserStatus } from './user';

export type ThemeName =
  'dark' | 'light' | 'white' | 'thin' | 'midnight' | 'slate' | 'ocean' | 'forest' | 'contrast';

export const THEME_NAMES: readonly ThemeName[] = [
  'dark',
  'light',
  'white',
  'thin',
  'midnight',
  'slate',
  'ocean',
  'forest',
  'contrast',
];

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === 'string' && (THEME_NAMES as readonly string[]).includes(value);

/**
 * The logged-in player as returned by GET /users/me.
 *
 * The backend sends the whole `users` row minus the password and the
 * reset/verify tokens; only the fields the app reads are typed here.
 */
export interface ApiUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  username_changed_at?: string | null;
  /** Null on accounts with no email on file — the API does send it. */
  email: string | null;
  mobile: string;
  /** Dial code the mobile was registered with, e.g. "91". */
  country_code?: string | null;
  role: UserRole;
  status: UserStatus;
  timezone: string | null;
  theme: ThemeName | null;
  two_factor_enabled: boolean;
  /** Per-user opt-in to peer tips and rain. True by default — false blocks
   *  incoming tips with a specific error so the sender knows why. */
  accept_tips: boolean;
  /** "Disable Tips/Rain Notifications" toggle. True still lets the user
   *  receive tips but silences their tip-bell writes. Applied to both the
   *  recipient and the sender's own receipt. */
  disable_tip_notifications: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
  is_email_verified?: boolean;
  created_at?: string;
  /** Present while a risk lock is on the account. Never says why. */
  account_restriction?: AccountRestriction | null;
  /** Social sign-in provider (google, telegram, steam). Null for email &
   * password accounts — used to decide whether a current password is needed
   * when changing the password. */
  provider?: string | null;
  provider_user_id?: string | null;
}

export interface AccountRestriction {
  lock: 'SOFT_LOCK' | 'HARD_LOCK' | 'BETTING_LOCK';
  blocked_actions: ('LOGIN' | 'DEPOSIT' | 'GAMEPLAY' | 'TIP' | 'WITHDRAW')[];
  /** CONTACT_VERIFICATION: verifying a real email lifts it. */
  requires: 'CONTACT_VERIFICATION' | 'KYC' | null;
  unlock_kyc_level: number | null;
  message: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

/** `label` is a translation key — render it through `t()`. */
export const THEME_OPTIONS: { value: ThemeName; label: TranslationKey; swatch: string }[] = [
  { value: 'dark', label: 'acct.theme.dark', swatch: '#0f172a' },
  { value: 'midnight', label: 'acct.theme.midnight', swatch: '#020617' },
  { value: 'thin', label: 'acct.theme.thin', swatch: '#1e2533' },
  { value: 'light', label: 'acct.theme.light', swatch: '#e2e8f0' },
  { value: 'white', label: 'acct.theme.white', swatch: '#ffffff' },
  { value: 'slate', label: 'acct.theme.slate', swatch: '#3f4856' },
  { value: 'ocean', label: 'acct.theme.ocean', swatch: '#082f49' },
  { value: 'forest', label: 'acct.theme.forest', swatch: '#052e1b' },
  { value: 'contrast', label: 'acct.theme.contrast', swatch: '#000000' },
];

/** The backend's default for a new account. */
export const DEFAULT_TIMEZONE = 'GMT+04 Samara / Armenia';

export const TIMEZONE_OPTIONS: string[] = [
  'GMT+00 UTC / London',
  'GMT+01 Berlin / Paris',
  'GMT+02 Athens / Cairo',
  'GMT+03 Moscow / Nairobi',
  'GMT+04 Samara / Armenia',
  'GMT+05:30 India Standard Time',
  'GMT+07 Bangkok / Jakarta',
  'GMT+08 Singapore / Beijing',
  'GMT+09 Tokyo / Seoul',
  'GMT+10 Sydney / Guam',
  'GMT-05 New York / Toronto',
  'GMT-06 Chicago / Mexico City',
  'GMT-08 Los Angeles / Vancouver',
];

/**
 * Display labels for `TIMEZONE_OPTIONS`. The option strings themselves are
 * what the backend stores, so they stay as they are; only what the player
 * reads is translated.
 */
const TIMEZONE_LABELS: Record<string, TranslationKey> = {
  'GMT+00 UTC / London': 'acct.tz.london',
  'GMT+01 Berlin / Paris': 'acct.tz.berlin',
  'GMT+02 Athens / Cairo': 'acct.tz.athens',
  'GMT+03 Moscow / Nairobi': 'acct.tz.moscow',
  'GMT+04 Samara / Armenia': 'acct.tz.samara',
  'GMT+05:30 India Standard Time': 'acct.tz.india',
  'GMT+07 Bangkok / Jakarta': 'acct.tz.bangkok',
  'GMT+08 Singapore / Beijing': 'acct.tz.singapore',
  'GMT+09 Tokyo / Seoul': 'acct.tz.tokyo',
  'GMT+10 Sydney / Guam': 'acct.tz.sydney',
  'GMT-05 New York / Toronto': 'acct.tz.newYork',
  'GMT-06 Chicago / Mexico City': 'acct.tz.chicago',
  'GMT-08 Los Angeles / Vancouver': 'acct.tz.losAngeles',
};

/** The translation key for a stored timezone, or null for one we have no label for. */
export const timezoneLabelKey = (tz: string): TranslationKey | null => TIMEZONE_LABELS[tz] ?? null;

/** "JD" for Jane Doe: the avatar fallback when there is no picture. */
export const initialsOf = (user: Pick<ApiUser, 'first_name' | 'last_name'> | null): string => {
  if (!user) {
    return '?';
  }
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
  return initials || '?';
};

export const fullNameOf = (user: Pick<ApiUser, 'first_name' | 'last_name'> | null): string =>
  user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
