import type { RewardUnlock } from '@/types/rewards';
import type { TranslationKey } from '@/i18n/locales';
import { formatRewardAmount } from '@/utils/money';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const unlockText = (t: Translate, unlock: RewardUnlock, currency: string): string => {
  const left = Math.max(0, Number(unlock.required) - Number(unlock.done)).toFixed(2);
  const amount = formatRewardAmount(left, currency);
  return unlock.activity === 'DEPOSIT'
    ? t('rewards.unlockDeposit', { amount })
    : t('rewards.unlockWager', { amount });
};
