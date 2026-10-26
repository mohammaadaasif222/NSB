import apiService from '@/services/api';

export type SocialPlatform = 'whatsapp' | 'instagram' | 'facebook' | 'x' | 'telegram';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

const CACHE_MS = 5 * 60_000;

let cached: { at: number; value: Promise<SocialLink[]> } | null = null;

export const fetchSocialLinks = (): Promise<SocialLink[]> => {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }
  const value = apiService
    .get<SocialLink[]>('/social-links')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : []))
    .catch(() => {
      cached = null;
      return [];
    });
  cached = { at: Date.now(), value };
  return value;
};
