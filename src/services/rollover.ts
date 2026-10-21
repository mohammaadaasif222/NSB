import apiService from './api';
import type {
  DepositRollover,
  DepositRolloverDetail,
  DepositRolloverStatus,
  Paged,
  RolloverSummary,
} from '@/types';

export const getRolloverSummary = () => apiService.get<RolloverSummary>('/rollover/me');

export interface RolloverHistoryParams {
  page?: number;
  limit?: number;
  status?: DepositRolloverStatus;
}

export const getRolloverHistory = (params: RolloverHistoryParams = {}) =>
  apiService.get<Paged<DepositRollover>>('/rollover/me/history', params);

export const getRollover = (id: string) =>
  apiService.get<DepositRolloverDetail>(`/rollover/me/${id}`);
