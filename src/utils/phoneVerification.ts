import type { ApiUser } from '@/types/profile';

export const isUnverifiedPhoneAccount = (
  me: Pick<ApiUser, 'mobile' | 'email' | 'is_email_verified'> | null | undefined
): boolean => Boolean(me?.mobile) && !me?.email && !me?.is_email_verified;
