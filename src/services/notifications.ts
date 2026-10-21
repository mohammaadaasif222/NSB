import apiService from './api';

/** One personal notification, e.g. why a withdrawal was rejected or escalated. */
export interface PlayerNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFeed {
  unread: number;
  rows: PlayerNotification[];
}

const EMPTY: NotificationFeed = { unread: 0, rows: [] };

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
