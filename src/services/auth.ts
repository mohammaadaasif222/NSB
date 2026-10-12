import apiService from './api';
import { encryptPassword } from '@/utils/crypto';
import type {
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  VerifyOtpResponseData,
} from '@/types';


export const registerAccount = async (body: RegisterRequest) =>
  apiService.post<RegisterResponseData>('/auth/register', {
    ...body,
    password: await encryptPassword(body.password),
  });

export const verifySignupOtp = (identifier: string, code: string) =>
  apiService.post<VerifyOtpResponseData>('/auth/verify-otp', { identifier, code });

export const resendSignupOtp = (identifier: string) =>
  apiService.post('/auth/resend-otp', { identifier });


export const loginWithPassword = async (identifier: string, password: string) =>
  apiService.post<LoginResponseData>('/auth/user/login', {
    identifier,
    password: await encryptPassword(password),
  });

export const requestPasswordReset = (identifier: string) =>
  apiService.post('/auth/forgot-password', { identifier });


export const resetPassword = (identifier: string, code: string, newPassword: string) =>
  apiService.post('/auth/reset-password', { identifier, code, new_password: newPassword });
