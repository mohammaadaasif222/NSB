import type { TranslationKey } from '@/i18n/locales';
import { translate } from '@/i18n/translate';

/**
 * Mirrors the backend's src/constants/roles.ts — keep the two in step.
 *
 * The player app is for PLATFORM roles only. System accounts (Super Master,
 * Master and the operations roles) sign in on the admin console against
 * POST /auth/system/login and are rejected here — the backend enforces this
 * at POST /auth/user/login; the client checks too so a wrong-portal sign-in
 * fails with a clear message instead of a half-working session.
 */
export const PLATFORM_ROLES = ['USER', 'VIP'] as const;

export const SYSTEM_ROLES = [
  'SUPER_MASTER',
  'MASTER',
  'RISK_MANAGEMENT',
  'ACCOUNTANT',
  'CUSTOMER_SUPPORT',
  'MARKETING',
  'PARTNER',
  'RISK_MANAGEMENT_TRAINEE',
] as const;

export const ALL_ROLES = [...PLATFORM_ROLES, ...SYSTEM_ROLES] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type SystemRole = (typeof SYSTEM_ROLES)[number];
export type AnyRole = (typeof ALL_ROLES)[number];

export const VIP_ROLE: PlatformRole = 'VIP';

const includes = (list: readonly string[], role: string | undefined | null): boolean =>
  !!role && list.includes(role);

export const isKnownRole = (role: string | undefined | null): role is AnyRole =>
  includes(ALL_ROLES, role);

export const isPlatformRole = (role: string | undefined | null): role is PlatformRole =>
  includes(PLATFORM_ROLES, role);

export const isSystemRole = (role: string | undefined | null): role is SystemRole =>
  includes(SYSTEM_ROLES, role);

export const isVip = (role: string | undefined | null): boolean => role === VIP_ROLE;

const ROLE_LABELS: Record<AnyRole, TranslationKey> = {
  USER: 'role.player',
  VIP: 'role.vip',
  SUPER_MASTER: 'content.role.superMaster',
  MASTER: 'content.role.master',
  RISK_MANAGEMENT: 'content.role.riskManagement',
  ACCOUNTANT: 'content.role.accountant',
  CUSTOMER_SUPPORT: 'content.role.customerSupport',
  MARKETING: 'content.role.marketing',
  PARTNER: 'content.role.partner',
  RISK_MANAGEMENT_TRAINEE: 'content.role.riskManagementTrainee',
};

/** Human label for a role badge, in the active language; an unknown value is shown as-is. */
export const roleLabel = (role: string | undefined | null): string => {
  if (!role) {
    return '—';
  }
  return isKnownRole(role) ? translate(ROLE_LABELS[role]) : role;
};
