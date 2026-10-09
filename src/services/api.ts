import axios, { AxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse } from '@/types';
import { getDeviceSession } from '@/lib/seon';
import { TRANSPORT_CODES } from '@/lib/apiError';

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


const noBodyFailure = (error: AxiosError): { code?: string; message: string } => {
  const status = error.response?.status;

  if (status) {
    return {
      message:
        status >= 500
          ? 'The server is having trouble right now. Please try again shortly.'
          : 'The server rejected the request but gave no reason.',
    };
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return {
      code: TRANSPORT_CODES.timeout,
      message: 'The server took too long to respond. Please try again.',
    };
  }

  return {
    code: TRANSPORT_CODES.unreachable,
    message: 'Could not reach the server. Check your connection and try again.',
  };
};

api.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
    }

    const body = error.response?.data as { message?: unknown } | undefined;
    const usable = body && typeof body === 'object' && typeof body.message === 'string';

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
