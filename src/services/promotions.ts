import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { ApiError, PaginationMeta } from '@/types';
import type { RatingSummary } from '@/services/promotionReviews';

export type PromoCategoryValue = 'casino' | 'sports';
export type PromoStatusValue = 'live' | 'expired';

export interface PromotionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  details: string;
  terms: string;
  image_url: string | null;
  category: PromoCategoryValue;
  starts_at: string;
  ends_at: string;
  status: PromoStatusValue;
  rating: RatingSummary;
}

export interface PromotionsPage {
  data: PromotionItem[];
  pagination: PaginationMeta;
}

export const PROMOTIONS_PAGE_SIZE = 8;

export async function fetchPromotions(query: {
  status: PromoStatusValue;
  category?: PromoCategoryValue;
  page: number;
  limit?: number;
}): Promise<PromotionsPage> {
  const res = await apiService.get<PromotionsPage>('/promotions', {
    status: query.status,
    category: query.category,
    page: query.page,
    limit: query.limit ?? PROMOTIONS_PAGE_SIZE,
  });
  if (!res?.success || !res.data || !Array.isArray(res.data.data)) {
    throw { message: res?.message || translate('promo.loadFailed') } satisfies ApiError;
  }
  return res.data;
}

export const paragraphsOf = (text: string | null | undefined): string[] =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
