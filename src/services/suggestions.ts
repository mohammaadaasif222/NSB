import apiService from '@/services/api';

/** The Suggestion Box's categories, in the order the backend accepts and the picker lists them. */
export const SUGGESTION_CATEGORIES = [
  'games',
  'bonuses',
  'payments',
  'ux',
  'bug',
  'other',
] as const;

export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

export const SUGGESTION_MIN_LENGTH = 10;
export const SUGGESTION_MAX_LENGTH = 1000;

export const sendSuggestion = async (category: SuggestionCategory, body: string): Promise<void> => {
  await apiService.post<{ id: string }>('/suggestions', { category, body });
};
