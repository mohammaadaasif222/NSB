import apiService from './api';
import { encryptPassword } from '@/utils/crypto';
import type { LoginResponseData, RegisterRequest, RegisterResponseData } from '@/types';

/**
 * The password auth calls behind the login and register modals. Thin
 * wrappers only — validation and UI state live with the modals.
 */

/* ── Registration ───────────────────────────────────────────────── */

export const registerAccount = (body: RegisterRequest) =>
  apiService.post<RegisterResponseData>('/auth/register', body);

/** `identifier` is the email or mobile the code was sent to. */
export const verifySignupOtp = (identifier: string, code: string) =>
  apiService.post('/auth/verify-otp', { identifier, code });

export const resendSignupOtp = (identifier: string) =>
  apiService.post('/auth/resend-otp', { identifier });

/* ── Login ──────────────────────────────────────────────────────── */

/**
 * The PLAYER login endpoint. `identifier` is an email, mobile number or
 * username — the backend works out which. The password is obfuscated before
 * it leaves the browser (see utils/crypto).
 */
export const loginWithPassword = async (identifier: string, password: string) =>
  apiService.post<LoginResponseData>('/auth/user/login', {
    identifier,
    password: await encryptPassword(password),
  });

/* ── Password reset ─────────────────────────────────────────────── */

/** Sends a 6-digit reset code to the account's email or mobile. */
export const requestPasswordReset = (identifier: string) =>
  apiService.post('/auth/forgot-password', { identifier });

/**
 * Redeems the code and sets the new password in one call — the API has no
 * separate "check the code" step for resets.
 */
export const resetPassword = (identifier: string, code: string, newPassword: string) =>
  apiService.post('/auth/reset-password', { identifier, code, new_password: newPassword });
