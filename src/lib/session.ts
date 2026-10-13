import { jwtDecode } from 'jwt-decode';

import { isPlatformRole } from '@/constants/roles';

import type { JwtPayload } from '@/types';

export const isPlayerToken = (token: string | undefined | null): token is string => {
  if (!token) return false;

  try {
    return isPlatformRole(jwtDecode<JwtPayload>(token).role);
  } catch {
    return false;
  }
};
