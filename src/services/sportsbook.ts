import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { ApiError, SportsbookLaunch } from '@/types';

/**
 * Open the sportsbook. Signed in, the player can bet; signed out, they browse.
 *
 * Rejects with an ApiError whose `status` tells the failures apart:
 *   403 account may not play · 502 could not open · 503 not configured
 */
export async function launchSportsbook(locale: string): Promise<SportsbookLaunch> {
  const res = await apiService.post<SportsbookLaunch>('/sportsbook/launch', { locale });

  if (!res?.success || !res.data?.html) {
    throw { message: res?.message || translate('game.launchFailed') } satisfies ApiError;
  }
  return res.data;
}
