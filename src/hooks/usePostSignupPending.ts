import { useSyncExternalStore } from 'react';
import { postSignupPending, subscribePostSignup } from '@/lib/postSignup';

/**
 * True from a signup until its welcome popup closes. The verify prompts hold
 * off meanwhile: they cannot be dismissed, so stacked under the welcome popup
 * they would fight it for focus, and over it they would hide it.
 */
export const usePostSignupPending = (): boolean =>
  useSyncExternalStore(subscribePostSignup, postSignupPending, () => false);
