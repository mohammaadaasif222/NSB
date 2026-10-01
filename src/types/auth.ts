import type { User, UserRole } from './user';

/** Shape of the JWT payload signed by the backend (id, email, role). */
export interface JwtPayload {
  id: string;
  /** null for accounts created from the phone signup flow. */
  email: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** The authenticated user as derived from the decoded access token. */
export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
}

export interface AuthContextType {
  token: string | null;
  /** Decoded user from the token, or null when logged out / token invalid. */
  user: AuthUser | null;
  /** Convenience accessor for the current user's role ('' when logged out). */
  role: UserRole;
  /** True when the logged-in player holds the VIP role. */
  isVip: boolean;
  /**
   * False until the token has been restored from sessionStorage on the client.
   * Route guards must wait for this before acting on a null token.
   */
  hydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface LoginResponseData {
  token: string;
  user?: User;
  /**
   * Social sign-in only. `/auth/social/login` both creates and signs in, so
   * this is the one thing that separates a new player from a returning one —
   * the frontend cannot tell them apart otherwise.
   *
   * Optional because the password and OTP routes do not send it.
   */
  is_new_account?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface AddOrUpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  username: string;
  role: string;
  status: string;
}
