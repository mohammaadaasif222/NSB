import apiService from '@/services/api';
import type { Locale } from '@/i18n/locales';

/** The pop-up shown after signing in, in the player's language. */
export interface LoginPopup {
  id: string;
  title: string;
  body: string;
  /** No button when empty. */
  cta_label: string;
  /** A path on the site or an https link. */
  cta_url: string | null;
  image_url: string | null;
}

/**
 * The pop-up for this sign-in, or null. The server records it as shown, so
 * call it once per sign-in.
 */
export async function fetchLoginPopup(locale: Locale): Promise<LoginPopup | null> {
  const res = await apiService.post<LoginPopup | null>(
    '/login-popups/next',
    {},
    { params: { locale } }
  );
  return res?.success ? (res.data ?? null) : null;
}

/** The player pressed the pop-up's button; best effort. */
export function recordLoginPopupClick(id: string): void {
  void apiService.post(`/login-popups/${id}/click`).catch(() => undefined);
}
