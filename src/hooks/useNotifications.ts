import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { realtimeService } from '@/services/realtimeService';
import {
  getNotificationSummary,
  getNotifications,
  getPlatformNotifications,
  markAllNotificationsRead,
  markPlatformNotificationsSeen,
  type NotificationSummary,
  type PlatformNotification,
  type PlayerNotification,
} from '@/services/notifications';

const SUMMARY_POLL_MS = 2 * 60 * 1000;
const NOTIFICATION_EVENT = 'notification.new';
const NONE: NotificationSummary = { personal: 0, platform: 0 };

export interface NotificationsFeed {
  personal: PlayerNotification[];
  platform: PlatformNotification[];
  unread: NotificationSummary;
  loaded: boolean;
  version: number;
  failed: boolean;
  markPersonalRead: () => void;
  markPlatformSeen: () => void;
}

export const useNotifications = (open: boolean): NotificationsFeed => {
  const { token } = useAuth();
  const [personal, setPersonal] = useState<PlayerNotification[]>([]);
  const [platform, setPlatform] = useState<PlatformNotification[]>([]);
  const [unread, setUnread] = useState<NotificationSummary>(NONE);
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);
  const [failed, setFailed] = useState(false);

  const openRef = useRef(open);
  openRef.current = open;
  const request = useRef(0);

  const refreshSummary = useCallback(async (): Promise<void> => {
    try {
      setUnread(await getNotificationSummary());
    } catch {
      return;
    }
  }, []);

  const load = useCallback(async (): Promise<void> => {
    const id = ++request.current;
    const [own, shared] = await Promise.allSettled([
      getNotifications(),
      getPlatformNotifications(),
    ]);
    if (id !== request.current) return;
    if (own.status === 'fulfilled') {
      setPersonal(own.value.rows);
      setUnread((u) => ({ ...u, personal: own.value.unread }));
    }
    if (shared.status === 'fulfilled') {
      setPlatform(shared.value.rows);
      setUnread((u) => ({ ...u, platform: shared.value.unread }));
    }
    setFailed(own.status === 'rejected' && shared.status === 'rejected');
    setLoaded(true);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!token) {
      request.current += 1;
      setPersonal([]);
      setPlatform([]);
      setUnread(NONE);
      setLoaded(false);
      return;
    }

    void refreshSummary();

    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void refreshSummary();
    };
    const onNew = (): void => {
      void (openRef.current ? load() : refreshSummary());
    };

    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(onVisible, SUMMARY_POLL_MS);
    realtimeService.on(NOTIFICATION_EVENT, onNew);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
      realtimeService.off(NOTIFICATION_EVENT, onNew);
    };
  }, [token, refreshSummary, load]);

  useEffect(() => {
    if (open && token) void load();
  }, [open, token, load]);

  const markPersonalRead = useCallback((): void => {
    setUnread((u) => ({ ...u, personal: 0 }));
    void markAllNotificationsRead().catch(() => undefined);
  }, []);

  const markPlatformSeen = useCallback((): void => {
    setUnread((u) => ({ ...u, platform: 0 }));
    void markPlatformNotificationsSeen().catch(() => undefined);
  }, []);

  return {
    personal,
    platform,
    unread,
    loaded,
    version,
    failed,
    markPersonalRead,
    markPlatformSeen,
  };
};
