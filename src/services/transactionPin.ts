import apiService from './api';

/** Whether the player has a transaction PIN, asked for on every withdrawal once set. */
export interface PinStatus {
  enabled: boolean;
  set_at: string | null;
  locked_until: string | null;
}

/** GET /users/me/transaction-pin */
export const getPinStatus = async (): Promise<PinStatus | null> => {
  const res = await apiService.get<PinStatus>('/users/me/transaction-pin');
  return res.success && res.data ? res.data : null;
};

/** PUT /users/me/transaction-pin; the account password confirms it is the player. */
export const savePin = async (pin: string, password: string): Promise<PinStatus> => {
  const res = await apiService.put<PinStatus>('/users/me/transaction-pin', { pin, password });
  if (!res.success || !res.data) throw new Error(res.message || 'Could not save your PIN');
  return res.data;
};
