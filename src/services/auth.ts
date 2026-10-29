import apiService from './api';
import { encryptPassword } from '@/utils/crypto';
import type { TelegramAuthData } from '@/hooks/useTelegramAuth';
import type {
  LinkedAccountData,
  LinkedAccountListData,
  LinkProvider,
  LoginResponseData,
  SessionEndedData,
  SessionListData,
  RegisterRequest,
  RegisterResponseData,
  TwoFactorChallengeData,
  VerifyOtpResponseData,
} from '@/types';

export const registerAccount = async (body: RegisterRequest) =>
  apiService.post<RegisterResponseData>(
    '/auth/register',
    {
      ...body,
      password: await encryptPassword(body.password),
    },
    { timeout: 45000 }
  );

export const verifySignupOtp = (identifier: string, code: string) =>
  apiService.post<VerifyOtpResponseData>('/auth/verify-otp', { identifier, code });

export const resendSignupOtp = (identifier: string) =>
  apiService.post('/auth/resend-otp', { identifier });

export const loginWithPassword = async (
  identifier: string,
  password: string,
  headers?: Record<string, string>,
  countryCode?: string
) =>
  apiService.post<Partial<LoginResponseData> & Partial<TwoFactorChallengeData>>(
    '/auth/user/login',
    {
      identifier,
      password: await encryptPassword(password),
      ...(countryCode ? { country_code: countryCode } : {}),
    },
    { headers }
  );

/** Second step of a two-factor login: the code that was emailed or texted. */
export const verifyLoginOtp = (challenge: string, code: string, headers?: Record<string, string>) =>
  apiService.post<LoginResponseData>('/auth/login/verify-otp', { challenge, code }, { headers });

export const resendLoginOtp = (challenge: string, channel?: 'email' | 'mobile') =>
  apiService.post('/auth/login/resend-otp', { challenge, ...(channel ? { channel } : {}) });

export const requestPasswordReset = (identifier: string, countryCode?: string) =>
  apiService.post('/auth/forgot-password', {
    identifier,
    ...(countryCode ? { country_code: countryCode } : {}),
  });

export const resetPassword = (identifier: string, code: string, newPassword: string) =>
  apiService.post('/auth/reset-password', { identifier, code, new_password: newPassword });

export const listSessions = () => apiService.get<SessionListData>('/auth/sessions');

export const endSession = (id: string) =>
  apiService.delete<SessionEndedData>(`/auth/sessions/${encodeURIComponent(id)}`);

export const endAllSessions = () => apiService.post<{ sessions_ended: number }>('/auth/logout-all');

export const listLinkedAccounts = () =>
  apiService.get<LinkedAccountListData>('/auth/linked-accounts');

export const linkGoogleAccount = (token: string) =>
  apiService.post<LinkedAccountData>('/auth/linked-accounts', { type: 'google', token });

export const linkTelegramAccount = (telegram: TelegramAuthData) =>
  apiService.post<LinkedAccountData>('/auth/linked-accounts', { type: 'telegram', telegram });

export const unlinkAccount = (provider: LinkProvider) =>
  apiService.delete<{ unlinked: true }>(`/auth/linked-accounts/${encodeURIComponent(provider)}`);

/** Signed-in player with no email: send a code to the address they want to add. */
export const requestAddEmailOtp = (email: string) =>
  apiService.post('/auth/email/request-otp', { email });

/** Confirm that code; the email is then saved to the account as verified. */
export const verifyAddEmail = (email: string, code: string) =>
  apiService.post<{ verified: boolean; email: string }>('/auth/email/verify', { email, code });

export const requestAddMobileOtp = (mobile: string, countryCode: string) =>
  apiService.post('/auth/mobile/request-otp', { mobile, country_code: countryCode });

export const verifyAddMobile = (mobile: string, countryCode: string, code: string) =>
  apiService.post<{ verified: boolean; mobile: string; country_code: string }>(
    '/auth/mobile/verify',
    { mobile, country_code: countryCode, code }
  );
