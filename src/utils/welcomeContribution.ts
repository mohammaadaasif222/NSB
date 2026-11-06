import type { Game, WelcomeContributions } from '@/types';

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

export const welcomeContribution = (
  contributions: WelcomeContributions,
  game: Pick<Game, 'id' | 'category' | 'provider' | 'rtp'>
): number => {
  const { rules, max_rtp: maxRtp } = contributions;

  const byGame = rules.find((rule) => rule.game_id === game.id);
  if (byGame) return clamp(byGame.contribution);

  if (maxRtp !== null && game.rtp !== null && game.rtp > maxRtp) return 0;

  const byCategory = game.category
    ? rules.find((rule) => !rule.game_id && !rule.provider && rule.category === game.category)
    : undefined;
  if (byCategory) return clamp(byCategory.contribution);

  const byProvider = rules.find(
    (rule) => !rule.game_id && !rule.category && rule.provider === game.provider
  );
  if (byProvider) return clamp(byProvider.contribution);

  return 100;
};
