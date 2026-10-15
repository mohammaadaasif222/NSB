import apiService from '@/services/api';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PublicFaqs {
  enabled: boolean;
  faqs: FaqItem[];
}

/** The questions written in the console, and the System config switch for the section. */
export async function fetchFaqs(): Promise<PublicFaqs> {
  const res = await apiService.get<PublicFaqs>('/faqs');
  if (!res?.success || !res.data || !Array.isArray(res.data.faqs)) {
    throw new Error(res?.message || 'Could not load FAQs');
  }
  return res.data;
}
