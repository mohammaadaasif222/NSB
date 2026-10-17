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

const TOKEN_KEY = 'token';
const EXPIRY_KEY = 'token_expiry';

const FALLBACK_TTL_MS = 30 * 60 * 1000;

const store = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const expiryClaim = (token: string): number | null => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const tokenExpiresAt = (token: string): number =>
  expiryClaim(token) ?? Date.now() + FALLBACK_TTL_MS;

export interface StoredSession {
  token: string;
  expiresAt: number;
}

export const readSession = (): StoredSession | null => {
  const storage = store();

  if (!storage) return null;

  const token = storage.getItem(TOKEN_KEY);
  const expiresAt = Number(storage.getItem(EXPIRY_KEY));

  if (!token || !Number.isFinite(expiresAt) || expiresAt <= 0) {
    return null;
  }

  return { token, expiresAt };
};

export const writeSession = (token: string): StoredSession => {
  const session: StoredSession = { token, expiresAt: tokenExpiresAt(token) };
  const storage = store();

  storage?.setItem(TOKEN_KEY, session.token);
  storage?.setItem(EXPIRY_KEY, String(session.expiresAt));

  return session;
};

export const clearSession = (): void => store()?.clear();

export type SessionEndReason = 'expired' | 'ended-everywhere';

type SessionEndListener = (reason: SessionEndReason) => void;

const listeners = new Set<SessionEndListener>();

export const onSessionExpired = (listener: SessionEndListener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const expireSession = (reason: SessionEndReason = 'expired'): boolean => {
  const storage = store();

  if (!storage?.getItem(TOKEN_KEY)) {
    return false;
  }

  storage.clear();

  for (const listener of [...listeners]) {
    listener(reason);
  }

  return true;
};
