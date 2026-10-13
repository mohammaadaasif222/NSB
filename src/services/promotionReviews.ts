import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { ApiError, PaginationMeta } from '@/types';

export interface PromotionReview {
  id: string;
  username: string;
  avatar_url: string | null;
  rating: number;
  remark: string | null;
  created_at: string;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export interface ReviewsPage {
  summary: RatingSummary;
  data: PromotionReview[];
  pagination: PaginationMeta;
}

export interface SubmittedReview {
  review: PromotionReview;
  summary: RatingSummary;
}

export const REVIEWS_PAGE_SIZE = 12;

const base = (promotionId: string): string =>
  `/promotion-reviews/${encodeURIComponent(promotionId)}`;

export async function fetchReviews(
  promotionId: string,
  page = 1,
  limit = REVIEWS_PAGE_SIZE
): Promise<ReviewsPage> {
  const res = await apiService.get<ReviewsPage>(base(promotionId), { page, limit });
  if (!res?.success || !res.data || !Array.isArray(res.data.data)) {
    throw { message: res?.message || translate('promo.reviewsFailed') } satisfies ApiError;
  }
  return res.data;
}

export async function fetchRatingSummaries(
  promotionIds: string[]
): Promise<Record<string, RatingSummary>> {
  const res = await apiService.get<Record<string, RatingSummary>>('/promotion-reviews/summaries', {
    ids: promotionIds.join(','),
  });
  if (!res?.success || !res.data) {
    throw { message: res?.message || translate('promo.reviewsFailed') } satisfies ApiError;
  }
  return res.data;
}

export async function fetchMyReview(promotionId: string): Promise<PromotionReview | null> {
  const res = await apiService.get<PromotionReview | null>(`${base(promotionId)}/mine`);
  if (!res?.success) {
    throw { message: res?.message || translate('promo.reviewsFailed') } satisfies ApiError;
  }
  return res.data ?? null;
}

export async function removeMyReview(promotionId: string): Promise<RatingSummary> {
  const res = await apiService.delete<{ summary: RatingSummary }>(base(promotionId));
  if (!res?.success || !res.data?.summary) {
    throw { message: res?.message || translate('promo.reviewFailed') } satisfies ApiError;
  }
  return res.data.summary;
}

export async function submitReview(
  promotionId: string,
  rating: number,
  remark: string
): Promise<SubmittedReview> {
  const res = await apiService.post<SubmittedReview>(base(promotionId), { rating, remark });
  if (!res?.success || !res.data?.review) {
    throw { message: res?.message || translate('promo.reviewFailed') } satisfies ApiError;
  }
  return res.data;
}
