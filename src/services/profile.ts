import apiService from './api';

import type { ApiUser } from '@/types/profile';

const UPLOAD_TIMEOUT = 60_000;

export const uploadAvatar = (blob: Blob, filename: string) => {
  const body = new FormData();
  body.append('file', blob, filename);

  return apiService.post<ApiUser>('/users/me/avatar', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  });
};

export const removeAvatar = () => apiService.delete<ApiUser>('/users/me/avatar');
