import { useEffect, useState } from 'react';
import {
  fetchSocialLoginProviders,
  peekSocialLoginProviders,
  type SocialLoginProvider,
} from '@/services/socialLoginProviders';

export interface SocialLoginProviders {
  /** Switched-on providers in the admin's order; empty until the first answer. */
  order: SocialLoginProvider[];
  isEnabled: (provider: SocialLoginProvider) => boolean;
}

/**
 * Which social sign-in providers to offer, as set in the admin console's
 * CRM → Social login page.
 *
 * Until the first answer arrives, Google counts as on (its big button would
 * otherwise jump in a moment later and shove the form down) and the icon row
 * stays empty (better than an icon that vanishes). After that, every mount
 * reads the remembered answer straight away.
 */
export const useSocialLoginProviders = (): SocialLoginProviders => {
  const [order, setOrder] = useState<SocialLoginProvider[] | null>(peekSocialLoginProviders);

  useEffect(() => {
    let active = true;
    void fetchSocialLoginProviders().then((next) => {
      if (active) setOrder(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    order: order ?? [],
    isEnabled: (provider) => (order ? order.includes(provider) : provider === 'google'),
  };
};

export type { SocialLoginProvider };
