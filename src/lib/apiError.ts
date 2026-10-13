import type { ApiError } from '@/types';
import type { TranslationKey } from '@/i18n/locales';


export const TRANSPORT_CODES = {
  unreachable: 'NETWORK_UNREACHABLE',
  timeout: 'NETWORK_TIMEOUT',
} as const;

const VALIDATION_FAILED = 'Validation failed';

export const transportErrorKey = (error: unknown): TranslationKey | null => {
  const code = (error as { code?: string } | undefined)?.code;
  if (code === TRANSPORT_CODES.timeout) return 'errors.timeout';
  if (code === TRANSPORT_CODES.unreachable) return 'errors.unreachable';
  return null;
};


export const fieldErrorMessage = (error: unknown): string | null => {
  const errors = (error as ApiError | undefined)?.errors;
  if (!errors) return null;
  return Object.values(errors).find((message) => Boolean(message)) ?? null;
};


export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const field = fieldErrorMessage(error);
  if (field) return field;

  const message = (error as ApiError | undefined)?.message;
  // "Validation failed" with no field map left to name is a label, not copy.
  if (message && message !== VALIDATION_FAILED) return message;

  return fallback;
};
