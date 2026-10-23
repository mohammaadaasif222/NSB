export type StatisticsRange = 'lifetime' | 'week' | 'month' | 'six_months' | 'year';

export interface MyStatistics {
  range: StatisticsRange;
  starts_at: string | null;
  ends_at: string;
  currency: string;
  bet_count: number;
  win_count: number;
  wagered: string;
  best_round_win: string;
  best_game_win: string;
}
