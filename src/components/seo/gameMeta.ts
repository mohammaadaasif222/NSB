import type { TranslationKey } from '@/i18n/locales';
import type { Game } from '@/types';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export const gameDescription = (t: Translate, game: Game): string =>
  game.rtp
    ? t('misc.meta.gameRtp', { title: game.title, provider: game.provider, rtp: game.rtp })
    : t('misc.meta.game', { title: game.title, provider: game.provider });
