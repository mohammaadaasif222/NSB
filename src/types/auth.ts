import type { User, UserRole } from './user';

export interface JwtPayload {
  id: string;
  email: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
}

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  role: UserRole;
  isVip: boolean;
  hydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface LoginResponseData {
  token: string;
  user?: User;
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

export type ContactChannel = 'mobile' | 'email';

export type SignupMethod = ContactChannel;

export type LoginMethod = 'username' | 'mobile' | 'email';

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  mobile?: string;
  country_code?: string;
  promo_code?: string;
  referral_code?: string;
  captcha_token?: string;
}

export interface RegisterResponseData {
  username?: string;
  otp_required?: boolean;
  identifier?: string;
  token?: string;
}

export interface VerifyOtpResponseData {
  verified?: boolean;
  token?: string;
}
