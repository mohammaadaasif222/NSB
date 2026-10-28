import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import apiService from '@/services/api';

export interface PlatformFeatures {
  bonuses: boolean;
  rewards: boolean;
  vip_tiers: boolean;
  /** Master switch: the referral programme. */
  referrals: boolean;
  promotions: boolean;
  /** System config, CRM: whether the Terms and conditions page is shown. */
  terms_page: boolean;
  /** System config, Security: two-factor login is on, so the profile offers 2FA. */
  two_factor: boolean;
  /** System config, Signup OTP: Email OTP is on, so mobile-only accounts can add & verify an email. */
  email_verification: boolean;
  email_verify_modal: boolean;
  phone_verification: boolean;
  phone_verify_modal: boolean;
  /** System config, Help Center: the profile's Help Centre tab. */
  help_center: boolean;
  /** System config, Help Center: the Responsible Gambling pages and links to them. */
  responsible_gambling: boolean;
  promotion_filters: { live: boolean; expired: boolean; casino: boolean; sports: boolean };
  /**
   * True once the API has answered (or failed). Until then every flag is the
   * optimistic default, so a route that must NOT render while its feature is
   * off waits for this rather than trusting `true`.
   */
  loaded: boolean;
}


const ALL_ON: PlatformFeatures = {
  bonuses: true,
  rewards: true,
  vip_tiers: true,
  referrals: true,
  promotions: true,
  terms_page: true,
  // Off until the API says otherwise: a 2FA switch shown while the platform
  // ignores it would promise protection that is not there.
  two_factor: false,
  // Off until the API says otherwise, like 2FA: no button for a code that will not be sent.
  email_verification: false,
  email_verify_modal: false,
  phone_verification: false,
  phone_verify_modal: false,
  help_center: true,
  responsible_gambling: true,
  promotion_filters: { live: true, expired: true, casino: true, sports: true },
  loaded: false,
};

const PlatformFeaturesContext = createContext<PlatformFeatures>(ALL_ON);

export const PlatformFeaturesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<PlatformFeatures>(ALL_ON);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const res = await apiService.get<PlatformFeatures>('/platform/features');
        if (!cancelled && res?.success && res.data) {
          setFeatures({
            ...ALL_ON,
            ...res.data,
            promotion_filters: { ...ALL_ON.promotion_filters, ...res.data.promotion_filters },
            loaded: true,
          });
          return;
        }
      } catch {
        // Fall through: keep what is shown, but stop reporting "not loaded".
      }
      if (!cancelled) setFeatures((prev) => ({ ...prev, loaded: true }));
    };

    void load();

    // An operator can switch a feature off while a tab sits open. Re-reading
    // when the tab comes back keeps the navigation, and the routes that guard
    // themselves on these flags, from running on a stale answer.
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const value = useMemo<PlatformFeatures>(() => features, [features]);

  return (
    <PlatformFeaturesContext.Provider value={value}>{children}</PlatformFeaturesContext.Provider>
  );
};

export const usePlatformFeatures = (): PlatformFeatures => useContext(PlatformFeaturesContext);
