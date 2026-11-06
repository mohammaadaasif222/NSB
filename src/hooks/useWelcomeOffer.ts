import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { BONUS_REFRESH_EVENT, WALLET_REFRESH_EVENT } from '@/constants/events';
import type { ApiError, WelcomeOffer } from '@/types';

export interface UseWelcomeOffer {
  offer: WelcomeOffer | null;
  loading: boolean;
  saving: boolean;
  signedIn: boolean;
  choose: (bonusId: string | null) => Promise<boolean>;
  cancel: (awardId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const showsWelcomeOffer = (offer: WelcomeOffer | null): offer is WelcomeOffer =>
  !!offer?.enabled && offer.eligible && offer.options.length > 0;

export const useWelcomeOffer = (): UseWelcomeOffer => {
  const { token, hydrated } = useAuth();
  const { bonuses: bonusesOn } = usePlatformFeatures();
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;

  const [offer, setOffer] = useState<WelcomeOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const ticket = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (!hydrated || !bonusesOn) {
      return;
    }
    const mine = (ticket.current += 1);
    setLoading(true);
    try {
      const res = await apiService.get<WelcomeOffer>(
        token ? '/bonuses/welcome-offer/me' : '/bonuses/welcome-offer'
      );
      if (ticket.current === mine) {
        setOffer(res?.success && res.data ? res.data : null);
      }
    } catch {
      if (ticket.current === mine) {
        setOffer(null);
      }
    } finally {
      if (ticket.current === mine) {
        setLoading(false);
      }
    }
  }, [token, hydrated, bonusesOn]);

  useEffect(() => {
    void refresh();
    const onChanged = (): void => void refresh();
    window.addEventListener(WALLET_REFRESH_EVENT, onChanged);
    window.addEventListener(BONUS_REFRESH_EVENT, onChanged);
    return () => {
      ticket.current += 1;
      window.removeEventListener(WALLET_REFRESH_EVENT, onChanged);
      window.removeEventListener(BONUS_REFRESH_EVENT, onChanged);
    };
  }, [refresh]);

  const choose = useCallback(async (bonusId: string | null): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await apiService.post<WelcomeOffer>('/bonuses/welcome-offer/choose', {
        bonus_id: bonusId,
      });
      if (res?.success && res.data) {
        ticket.current += 1;
        setOffer(res.data);
        return true;
      }
      toast.error(res?.message || tRef.current('welcome.saveFailed'));
      return false;
    } catch (err) {
      toast.error((err as ApiError)?.message || tRef.current('welcome.saveFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const cancel = useCallback(async (awardId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await apiService.post(`/bonuses/${awardId}/forfeit`);
      if (res?.success) {
        toast.success(tRef.current('welcome.cancelled'));
        window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
        window.dispatchEvent(new Event(BONUS_REFRESH_EVENT));
        return true;
      }
      toast.error(res?.message || tRef.current('welcome.cancelFailed'));
      return false;
    } catch (err) {
      toast.error((err as ApiError)?.message || tRef.current('welcome.cancelFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { offer, loading, saving, signedIn: !!token, choose, cancel, refresh };
};
