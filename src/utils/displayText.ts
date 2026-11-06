import type { DisplayTexts } from '@/types';

export const displayText = <F extends string>(
  texts: DisplayTexts<F> | undefined,
  locale: string,
  field: F
): string | null => texts?.[locale]?.[field]?.trim() || null;
