import apiService from './api';
import type { MyStatistics, StatisticsRange } from '@/types';

export const getMyStatistics = (range: StatisticsRange) =>
  apiService.get<MyStatistics>('/statistics/me', { range });
