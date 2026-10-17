import { useCallback, useEffect, useState } from 'react';
import { endAllSessions, endSession, listSessions } from '@/services/auth';
import { expireSession } from '@/lib/session';
import { translate } from '@/i18n/translate';
import type { PlayerSession } from '@/types';

export const END_ALL = 'all';

interface UseSessions {
  sessions: PlayerSession[];
  loading: boolean;
  error: string;
  busy: string | null;
  refresh: () => Promise<void>;
  endOne: (id: string) => Promise<void>;
  endAll: () => Promise<void>;
}

export const useSessions = (): UseSessions => {
  const [sessions, setSessions] = useState<PlayerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await listSessions();

      if (res?.success && res.data) {
        setSessions(res.data.sessions);
        setError('');
      } else {
        setError(res?.message || translate('sec.sessionsFailed'));
      }
    } catch (err) {
      setError((err as { message?: string })?.message || translate('sec.sessionsFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const endOne = useCallback(async (id: string): Promise<void> => {
    setBusy(id);
    setError('');
    try {
      const res = await endSession(id);

      if (!res?.success) {
        setError(res?.message || translate('sec.endSessionFailed'));
        return;
      }

      if (res.data?.was_current) {
        expireSession('ended-everywhere');
        return;
      }

      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (err) {
      setError((err as { message?: string })?.message || translate('sec.endSessionFailed'));
    } finally {
      setBusy(null);
    }
  }, []);

  const endAll = useCallback(async (): Promise<void> => {
    setBusy(END_ALL);
    setError('');
    try {
      const res = await endAllSessions();

      if (!res?.success) {
        setError(res?.message || translate('sec.endSessionFailed'));
        return;
      }

      expireSession('ended-everywhere');
    } catch (err) {
      setError((err as { message?: string })?.message || translate('sec.endSessionFailed'));
    } finally {
      setBusy(null);
    }
  }, []);

  return { sessions, loading, error, busy, refresh, endOne, endAll };
};
