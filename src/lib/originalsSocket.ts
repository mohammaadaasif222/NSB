/**
 * Socket.io client for the rlk-originals-backend games service.
 *
 * Mirrors the Win-Win reference client: the server's socketAuth middleware
 * (rlk-originals-backend/src/middlewares/socketAuth.js) verifies the JWT
 * from `auth.token` against the SAME `JWT_SECRET` the main backend signs
 * with — so the access token from the main-backend session is used verbatim
 * here. The server pulls the authoritative userId from `payload.sub` and
 * ignores anything the client claims in `query.playerId`.
 */
import { io, type Socket } from 'socket.io-client';

import { readSession } from '@/lib/session';
import { getOrCreateDemoPlayerId } from '@/lib/originalsAuthBridge';

const ORIGINALS_URL =
  (process.env.NEXT_PUBLIC_ORIGINALS_SOCKET_URL as string | undefined) ||
  'http://localhost:5000';

let socket: Socket | null = null;

const getAccessToken = (): string | null => {
  const s = readSession();
  if (!s || Date.now() >= s.expiresAt) return null;
  return s.token;
};

/**
 * Returns the singleton originals socket, (re)connecting if needed.
 *
 * The `playerId` argument is a HINT only — the server derives the
 * authoritative id from the verified JWT. Kept for parity with the Win-Win
 * reference and log lines.
 */
export const initSocket = (_playerId?: string): Socket => {
  if (typeof window === 'undefined') {
    throw new Error('initSocket must only be called on the client');
  }

  if (!socket) {
    const token = getAccessToken();
    // No token → anonymous demo player. The originals-backend socketAuth
    // middleware accepts this when ALLOW_UNAUTH_SOCKET=true via the legacy
    // query.playerId path, binding socket.data.playerId to the id we send
    // AND marking authSource="legacy_query" (which OriginalAPI.js reads
    // to short-circuit real-wallet calls into local demo-pot sims).
    const demoPlayerId = token ? null : getOrCreateDemoPlayerId();
    socket = io(ORIGINALS_URL, {
      auth: { token },
      ...(demoPlayerId ? { query: { playerId: demoPlayerId } } : {}),
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socket.on('connect', () => {
      // Keep the log line light — detailed debug comes from the game handlers.
      // eslint-disable-next-line no-console
      console.log('[originals] socket connected', socket?.id);
    });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('[originals] socket disconnected', reason);
    });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[originals] socket connect_error', err?.message);
    });
    return socket;
  }

  if (!socket.connected) {
    // Refresh the token in case the session rotated while the socket was down —
    // otherwise the reconnect would carry a stale token and the server would
    // reject the handshake.
    try {
      const fresh = getAccessToken();
      if (fresh && socket.auth && typeof socket.auth === 'object') {
        (socket.auth as { token?: string }).token = fresh;
      }
    } catch {
      /* best effort */
    }
    socket.connect();
  }
  return socket;
};

/** Fully tear down the originals socket — call on route unmount. */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/**
 * Push a rotated access token to the games socket, matching the behaviour
 * the main-backend uses after /auth/refresh so the socket does not get
 * stuck with an expired token.
 */
export const pushAuthTokenToOriginalsSocket = (accessToken: string): void => {
  if (!accessToken) return;
  if (socket && socket.connected) {
    socket.emit('refresh_auth_token', { token: accessToken });
  }
};
