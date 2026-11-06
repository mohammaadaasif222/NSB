import { useEffect, useState, type FC } from 'react';

import GlassDialog from '@/components/ui/GlassDialog';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { useWelcomeOffer } from '@/hooks/useWelcomeOffer';
import { realtimeService } from '@/services/realtimeService';
import { formatRewardAmount } from '@/utils/money';

const SEEN_KEY = 'rl_welcome_complete_seen';
const NOTIFICATION_EVENT = 'notification.new';
const RECENT_MS = 14 * 24 * 60 * 60 * 1000;

const readSeen = (): string | null => {
  try {
    return window.localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

const WelcomeCompletePopup: FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { summary } = useWallet();
  const { offer, refresh } = useWelcomeOffer();
  const [seen, setSeen] = useState<string | null>(null);

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    const onNew = (): void => void refresh();
    realtimeService.on(NOTIFICATION_EVENT, onNew);
    return () => realtimeService.off(NOTIFICATION_EVENT, onNew);
  }, [token, refresh]);

  const award = offer?.award;
  const completedAt = award?.completed_at ? new Date(award.completed_at).getTime() : 0;
  const show =
    !!token &&
    award?.status === 'COMPLETED' &&
    Date.now() - completedAt < RECENT_MS &&
    seen !== award.id;

  if (!show || !award) return null;

  const currency = offer?.currency ?? 'USD';
  const money = (amount: string | null | undefined): string =>
    formatRewardAmount(amount ?? '0', currency, 'bonus.awards');
  const captured = Number(award.captured_usd ?? 0);

  const close = (): void => {
    setSeen(award.id);
    try {
      window.localStorage.setItem(SEEN_KEY, award.id);
    } catch {
      return;
    }
  };

  return (
    <GlassDialog
      open
      onClose={close}
      titleId="welcome-complete-title"
      title={t('welcome.doneTitle')}
      titleVariant="title"
      phoneSheet="fit"
      className="w-full p-6 sm:w-[min(440px,92vw)] sm:p-8"
    >
      <div className="mt-4 space-y-4 text-center">
        <p className="text-[40px] font-semibold leading-[48px] tracking-[-0.02em] text-[#3ad07a]">
          +{money(award.released_usd)}
        </p>
        <p className="text-[15px] leading-6 text-[#f0f1f5]">{t('welcome.doneBody')}</p>
        <dl className="space-y-1.5 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-[13px] leading-5">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9da2b4]">{t('welcome.doneReal')}</dt>
            <dd className="font-semibold text-[#3ad07a]">{money(summary?.balance?.real_amount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9da2b4]">{t('welcome.doneBonus')}</dt>
            <dd className="font-semibold text-[#f0f1f5]">
              {money(summary?.balance?.bonus_amount)}
            </dd>
          </div>
          {captured > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#9da2b4]">{t('welcome.doneCaptured')}</dt>
              <dd className="font-semibold text-[#f0f1f5]">{money(award.captured_usd)}</dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          onClick={close}
          className="rl-btn-gold flex h-12 w-full items-center justify-center rounded-full text-[16px] font-semibold"
        >
          {t('welcome.doneKeepPlaying')}
        </button>
      </div>
    </GlassDialog>
  );
};

export default WelcomeCompletePopup;
