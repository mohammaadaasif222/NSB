import apiService from './api';

import type { SignedAssetsData } from '@/types';

export const signAssets = (keys: readonly string[]) =>
  apiService.get<SignedAssetsData>(
    '/assets/sign',
    { key: keys },
    { paramsSerializer: { indexes: null } }
  );
