import axios, { AxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse } from '@/types';
import { getDeviceSession } from '@/lib/seon';
import { TRANSPORT_CODES } from '@/lib/apiError';
import { expireSession, readSession } from '@/lib/session';
import { translate } from '@/i18n/translate';

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


api.interceptors.request.use(async (config) => {
  const stored = readSession();

  if (stored && Date.now() < stored.expiresAt) {
    config.headers.Authorization = `Bearer ${stored.token}`;
  } else if (stored) {
    expireSession();
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


const noBodyFailure = (error: AxiosError): { code?: string; message: string } => {
  const status = error.response?.status;

  if (status) {
    return {
      message: status >= 500 ? translate('misc.api.serverError') : translate('misc.api.rejected'),
    };
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return {
      code: TRANSPORT_CODES.timeout,
      message: translate('errors.timeout'),
    };
  }

  return {
    code: TRANSPORT_CODES.unreachable,
    message: translate('errors.unreachable'),
  };
};

/** Fired when sign-up or sign-in is refused for the player's country. */
export const REGION_RESTRICTED_EVENT = 'rl:region-restricted';

api.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      expireSession();
    }

    const body = error.response?.data as { message?: unknown } | undefined;
    const usable = body && typeof body === 'object' && typeof body.message === 'string';
    const code = (body as { errors?: { code?: unknown } } | undefined)?.errors?.code;
    if (usable && code === 'REGION_RESTRICTED' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REGION_RESTRICTED_EVENT, { detail: body.message }));
    }

    return Promise.reject({
      ...(usable ? body : noBodyFailure(error)),
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
