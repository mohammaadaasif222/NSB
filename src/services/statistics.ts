import apiService from './api';
import type { MyStatistics, StatisticsRange } from '@/types';

export const getMyStatistics = (range: StatisticsRange) =>
  apiService.get<MyStatistics>('/statistics/me', { range });

export type StatisticsReportFormat = 'text' | 'pdf' | 'xlsx';

/** Email the same statistics (for the selected range) as text, PDF or Excel. */
export const emailMyStatistics = (email: string, range: StatisticsRange, format: StatisticsReportFormat) =>
  apiService.post<{ sent: boolean; format: StatisticsReportFormat }>('/statistics/me/email', {
    email,
    range,
    format,
  });
