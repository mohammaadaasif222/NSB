import { formatRewardAmount } from '@/utils/money';
import type { TranslationKey } from '@/i18n/locales';
import type { WelcomeStage } from '@/types';

type T = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export const STAGE_LABEL_KEYS: Record<number, TranslationKey> = {
  1: 'bonus.deposit1',
  2: 'bonus.deposit2',
  3: 'bonus.deposit3',
};

/** What the stage is worth, as one line: "100%", "$50.00" or "20 spins". */
export const stageHeadline = (stage: WelcomeStage, currency: string, t: T): string =>
  stage.match_percentage !== null
    ? `${stage.match_percentage}%`
    : stage.estimated_amount && Number(stage.estimated_amount) > 0
      ? formatRewardAmount(stage.estimated_amount, currency)
      : stage.free_spins_count
        ? t('bonus.spinsCount', { count: stage.free_spins_count })
        : '—';

/** The stage's conditions, in the order a player weighs them. */
export const stageTerms = (stage: WelcomeStage, currency: string, t: T): string[] =>
  [
    Number(stage.min_deposit_amount ?? 0) > 0
      ? t('bonus.minDeposit', {
          amount: formatRewardAmount(stage.min_deposit_amount as string, currency),
        })
      : null,
    Number(stage.max_bonus_amount ?? 0) > 0
      ? t('bonus.upTo', {
          amount: formatRewardAmount(stage.max_bonus_amount as string, currency),
        })
      : null,
    stage.free_spins_count && stage.match_percentage !== null
      ? t('bonus.spinsCount', { count: stage.free_spins_count })
      : null,
    Number(stage.wagering_multiplier ?? 0) > 0
      ? t('bonus.terms.wagering', { multiplier: Number(stage.wagering_multiplier) })
      : null,
  ].filter((line): line is string => !!line);
