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
  /** Null on accounts with no email on file — the API does send it. */
  email: string | null;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  timezone: string | null;
  theme: ThemeName | null;
  two_factor_enabled: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
  is_email_verified?: boolean;
  created_at?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

export const THEME_OPTIONS: { value: ThemeName; label: string; swatch: string }[] = [
  { value: 'dark', label: 'Dark', swatch: '#0f172a' },
  { value: 'midnight', label: 'Midnight', swatch: '#020617' },
  { value: 'thin', label: 'Thin', swatch: '#1e2533' },
  { value: 'light', label: 'Light', swatch: '#e2e8f0' },
  { value: 'white', label: 'White', swatch: '#ffffff' },
  { value: 'slate', label: 'Slate', swatch: '#3f4856' },
  { value: 'ocean', label: 'Ocean', swatch: '#082f49' },
  { value: 'forest', label: 'Forest', swatch: '#052e1b' },
  { value: 'contrast', label: 'High Contrast', swatch: '#000000' },
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
