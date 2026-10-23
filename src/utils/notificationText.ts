import type { TranslationKey } from '@/i18n/locales';
import type { PlayerNotification } from '@/services/notifications';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;
type FormatMoney = (amount: string) => string;

export interface NoticeText {
  title: string;
  body: string | null;
}

const REWARD_KEYS: Record<string, TranslationKey> = {
  RAKEBACK: 'rewards.type.rakeback',
  CASHBACK: 'rewards.type.cashback',
  DAILY: 'rewards.type.daily',
  WEEKLY: 'rewards.type.weekly',
  MONTHLY: 'rewards.type.monthly',
};

const GRANTED_KEYS: Record<string, TranslationKey> = {
  free_bet: 'notif.bonusGranted.freeBet',
  cash_wagering: 'notif.bonusGranted.cashWagering',
  cash: 'notif.bonusGranted.cash',
  spins: 'notif.bonusGranted.spins',
  plain: 'notif.bonusGranted.plain',
};

const FORFEITED_KEYS: Record<string, TranslationKey> = {
  player: 'notif.bonusForfeited.player',
  max_bet: 'notif.bonusForfeited.maxBet',
  system: 'notif.bonusForfeited.system',
};

const text = (value: unknown): string =>
  typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);

export const personalNoticeText = (
  item: PlayerNotification,
  t: Translate,
  money: FormatMoney
): NoticeText => {
  const fallback = { title: item.title, body: item.body };
  const data = item.data;
  if (!data) return fallback;

  const bonus = text(data.bonus);
  const amount = (key: string): string => money(text(data[key]) || '0');
  const reward = (): string | null => {
    const key = REWARD_KEYS[text(data.reward)];
    return key ? t(key) : null;
  };

  switch (item.kind) {
    case 'BONUS_GRANTED': {
      const key = GRANTED_KEYS[text(data.variant)];
      if (!key) return fallback;
      return {
        title: t('notif.bonusGranted.title'),
        body: t(key, {
          bonus,
          amount: amount('amount'),
          wagering: amount('wagering'),
          spins: text(data.free_spins),
        }),
      };
    }
    case 'BONUS_CREDITED':
      return {
        title: t('notif.bonusCredited.title'),
        body: t('notif.bonusCredited.body', { bonus, amount: amount('amount') }),
      };
    case 'BONUS_COMPLETED':
      return {
        title: t('notif.bonusCompleted.title'),
        body: t('notif.bonusCompleted.body', { bonus }),
      };
    case 'BONUS_EXPIRED':
      return {
        title: t('notif.bonusExpired.title'),
        body: t('notif.bonusExpired.body', { bonus }),
      };
    case 'BONUS_FORFEITED': {
      const key = FORFEITED_KEYS[text(data.variant)];
      if (!key) return fallback;
      return {
        title: t('notif.bonusForfeited.title'),
        body: t(key, { bonus, maxBet: amount('max_bet') }),
      };
    }
    case 'BONUS_CANCELLED':
      return {
        title: t('notif.bonusCancelled.title'),
        body: t('notif.bonusCancelled.body', { bonus, reason: text(data.reason) }),
      };
    case 'REWARD_CLAIMABLE': {
      const name = reward();
      if (!name) return fallback;
      return {
        title: t('notif.rewardClaimable.title', { reward: name }),
        body: t('notif.rewardClaimable.body', { reward: name, amount: amount('amount') }),
      };
    }
    case 'REWARD_CLAIMED': {
      const name = reward();
      if (!name) return fallback;
      return {
        title: t('notif.rewardClaimed.title', { reward: name }),
        body: t('notif.rewardClaimed.body', { amount: amount('amount') }),
      };
    }
    case 'ROLLOVER_STARTED':
      return {
        title: t('notif.rolloverStarted.title'),
        body: t('notif.rolloverStarted.body', {
          required: amount('required'),
          deposit: amount('deposit'),
        }),
      };
    case 'ROLLOVER_COMPLETED':
      return {
        title: t('notif.rolloverCompleted.title'),
        body: t('notif.rolloverCompleted.body', { deposit: amount('deposit') }),
      };
    default:
      return fallback;
  }
};

export const personalNoticeHref = (item: PlayerNotification): string | null => {
  const ref = item.ref_type ?? '';
  if (ref === 'bonus_award') return '/bonuses';
  if (ref.startsWith('reward_')) return '/rewards';
  if (ref === 'rollover') return '/profile?section=rollover';
  return null;
};

export const isInternalLink = (href: string): boolean =>
  href.startsWith('/') && !href.startsWith('//');
