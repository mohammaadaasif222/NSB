import axios, { AxiosRequestConfig, type AxiosInstance } from 'axios';
import type { ApiResponse } from '@/types';
import { getDeviceSession } from '@/lib/seon';

/**
 * Main Axios Instance
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Endpoints the backend risk-scores.
 *
 * Only these carry the device fingerprint. Attaching it to every request would
 * add several kilobytes to each one — including game tiles and balance polls —
 * for no benefit, since the backend only reads it on the flows below.
 *
 * Matched on a path SUFFIX so the list reads as the routes themselves. Keep it
 * in step with the SEON enforcement points in the backend controllers; a path
 * missing here is not a failure, just a scored event with less signal.
 */
const DEVICE_SESSION_PATHS = [
  '/auth/register',
  '/auth/login',
  '/auth/user/login',
  '/auth/system/login',
  '/auth/social/login',
  '/wallet/deposit/address',
  '/wallet/withdrawal/request',
  '/users/me',
  '/users/me/change-password',
  '/kyc/sumsub/token',
];

const needsDeviceSession = (url: string | undefined): boolean => {
  if (!url) return false;
  const path = url.split('?')[0];
  return DEVICE_SESSION_PATHS.some((p) => path === p || path.endsWith(p));
};

/**
 * Request Interceptor
 * Adds the access token, and the SEON device fingerprint on scored flows.
 *
 * Async because producing a fingerprint means loading a third-party script the
 * first time. That resolution is bounded and self-cancelling — if the agent is
 * blocked (ad-blocker, CSP, offline) it resolves to null once and every later
 * call returns immediately, so a blocked player is never made to wait.
 */
api.interceptors.request.use(async (config) => {
  const token = sessionStorage.getItem('token');
  const expiry = sessionStorage.getItem('token_expiry');

  if (token && expiry && Date.now() < Number(expiry)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (needsDeviceSession(config.url)) {
    const session = await getDeviceSession();
    // Absent is normal and never an error — the request proceeds and SEON is
    // told device fingerprinting was unavailable.
    if (session) {
      config.headers['X-Device-Session'] = session;
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
    }

    // The HTTP status travels with the body so callers can tell "sign in"
    // (401) from "not available" (409) without parsing message text.
    return Promise.reject({
      ...(error.response?.data ?? { message: 'Something went wrong' }),
      status: error.response?.status,
    });
  }
);

/**
 * Common Methods - generic-typed for full type-safety on responses
 */
const apiService = {
  get: <T = unknown>(
    url: string,
    params?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    api.get(url, { params, ...config }) as unknown as Promise<ApiResponse<T>>,

  post: <T = unknown>(
    url: string,
    payload: unknown = {},
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    api.post(url, payload, config) as unknown as Promise<ApiResponse<T>>,

  put: <T = unknown>(
    url: string,
    payload: unknown = {},
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => api.put(url, payload, config) as unknown as Promise<ApiResponse<T>>,

  patch: <T = unknown>(
    url: string,
    payload: unknown = {},
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    api.patch(url, payload, config) as unknown as Promise<ApiResponse<T>>,

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.delete(url, config) as unknown as Promise<ApiResponse<T>>,
};

export default apiService;
