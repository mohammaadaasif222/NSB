import apiService from './api';

/** One personal notification, e.g. why a withdrawal was rejected or escalated. */
export interface PlayerNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFeed {
  unread: number;
  rows: PlayerNotification[];
}

export interface PlatformNotification {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  link_url: string | null;
  publish_at: string;
}

export interface PlatformFeed {
  unread: number;
  rows: PlatformNotification[];
}

export interface NotificationSummary {
  personal: number;
  platform: number;
}

const EMPTY: NotificationFeed = { unread: 0, rows: [] };
const EMPTY_PLATFORM: PlatformFeed = { unread: 0, rows: [] };

/** GET /notifications */
export const getNotifications = async (): Promise<NotificationFeed> => {
  const res = await apiService.get<NotificationFeed>('/notifications');
  return res.success && res.data ? res.data : EMPTY;
};

/** POST /notifications/read-all */
export const markAllNotificationsRead = async (): Promise<NotificationFeed> => {
  const res = await apiService.post<NotificationFeed>('/notifications/read-all');
  return res.success && res.data ? res.data : EMPTY;
};

export const getPlatformNotifications = async (): Promise<PlatformFeed> => {
  const res = await apiService.get<PlatformFeed>('/notifications/platform');
  return res.success && res.data ? res.data : EMPTY_PLATFORM;
};

export const markPlatformNotificationsSeen = async (): Promise<void> => {
  await apiService.post('/notifications/platform/seen');
};

export const getNotificationSummary = async (): Promise<NotificationSummary> => {
  const res = await apiService.get<NotificationSummary>('/notifications/summary');
  return res.success && res.data ? res.data : { personal: 0, platform: 0 };
};
