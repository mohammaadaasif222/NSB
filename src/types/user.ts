export type UserStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Every role the backend can issue. The player app only ever signs in the
 * two platform roles (USER, VIP); the system roles are listed so a token
 * carrying one can be recognised and sent to the right portal. Kept in step
 * with ALL_ROLES in src/constants/roles.ts. '' is the logged-out state.
 */
export type UserRole =
  | 'USER'
  | 'VIP'
  | 'SUPER_MASTER'
  | 'MASTER'
  | 'RISK_MANAGEMENT'
  | 'ACCOUNTANT'
  | 'CUSTOMER_SUPPORT'
  | 'MARKETING'
  | 'PARTNER'
  | 'RISK_MANAGEMENT_TRAINEE'
  | '';

/** The user object optionally returned alongside a login token. */
export interface User {
  id: string | number;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  mobile: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  source?: string;
}
