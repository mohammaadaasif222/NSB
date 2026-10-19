import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  linkGoogleAccount,
  linkTelegramAccount,
  listLinkedAccounts,
  unlinkAccount,
} from '@/services/auth';
import { useGooglePopup } from '@/hooks/useGoogleAuth';
import { useTelegramPopup, type TelegramAuthData } from '@/hooks/useTelegramAuth';
import { translate } from '@/i18n/translate';
import type { ApiResponse, LinkedAccount, LinkedAccountData, LinkProvider } from '@/types';

const PROVIDER_LABELS: Record<LinkProvider, string> = {
  google: 'Google',
  telegram: 'Telegram',
};

interface UseLinkedAccounts {
  accounts: Partial<Record<LinkProvider, LinkedAccount>>;
  loading: boolean;
  error: string;
  busy: LinkProvider | null;
  refresh: () => Promise<void>;
  toggle: (provider: LinkProvider) => void;
}

const messageOf = (err: unknown): string | undefined => (err as { message?: string })?.message;

export const useLinkedAccounts = (): UseLinkedAccounts => {
  const [accounts, setAccounts] = useState<Partial<Record<LinkProvider, LinkedAccount>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<LinkProvider | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await listLinkedAccounts();

      if (res?.success && res.data) {
        const next: Partial<Record<LinkProvider, LinkedAccount>> = {};
        for (const account of res.data.accounts) {
          if (account.provider in PROVIDER_LABELS) {
            next[account.provider as LinkProvider] = account;
          }
        }
        setAccounts(next);
        setError('');
      } else {
        setError(res?.message || translate('profile.link.loadFailed'));
      }
    } catch (err) {
      setError(messageOf(err) || translate('profile.link.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const finishLink = useCallback(
    async (
      provider: LinkProvider,
      request: () => Promise<ApiResponse<LinkedAccountData>>
    ): Promise<void> => {
      const label = PROVIDER_LABELS[provider];
      setBusy(provider);
      try {
        const res = await request();

        if (!res?.success || !res.data) {
          toast.error(res?.message || translate('profile.link.failed', { provider: label }));
          return;
        }

        const { account } = res.data;
        setAccounts((current) => ({ ...current, [provider]: account }));
        toast.success(translate('profile.link.linked', { provider: label }));
      } catch (err) {
        toast.error(messageOf(err) || translate('profile.link.failed', { provider: label }));
      } finally {
        setBusy(null);
      }
    },
    []
  );

  const onGoogleToken = useCallback(
    (token: string): void => {
      void finishLink('google', () => linkGoogleAccount(token));
    },
    [finishLink]
  );

  const onTelegramData = useCallback(
    (data: TelegramAuthData): void => {
      void finishLink('telegram', () => linkTelegramAccount(data));
    },
    [finishLink]
  );

  const openGoogle = useGooglePopup({ onToken: onGoogleToken });
  const openTelegram = useTelegramPopup(onTelegramData);

  const unlink = useCallback(async (provider: LinkProvider): Promise<void> => {
    const label = PROVIDER_LABELS[provider];
    setBusy(provider);
    try {
      const res = await unlinkAccount(provider);

      if (!res?.success) {
        toast.error(res?.message || translate('profile.link.unlinkFailed', { provider: label }));
        return;
      }

      setAccounts((current) => {
        const next = { ...current };
        delete next[provider];
        return next;
      });
      toast.success(translate('profile.link.unlinked', { provider: label }));
    } catch (err) {
      toast.error(messageOf(err) || translate('profile.link.unlinkFailed', { provider: label }));
    } finally {
      setBusy(null);
    }
  }, []);

  const toggle = useCallback(
    (provider: LinkProvider): void => {
      if (busy) return;

      if (accounts[provider]) {
        void unlink(provider);
        return;
      }

      if (provider === 'google') {
        openGoogle();
      } else {
        openTelegram();
      }
    },
    [accounts, busy, unlink, openGoogle, openTelegram]
  );

  return { accounts, loading, error, busy, refresh, toggle };
};
