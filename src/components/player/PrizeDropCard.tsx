import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { gameHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import type { PrizeDrop, PrizeDropGame } from '@/services/prizeDrops';
import { formatAmount, withCurrency } from '@/utils/money';
import { until } from '@/utils/relativeTime';

const LEVEL_KEY: Record<NonNullable<PrizeDrop['level']>, TranslationKey> = {
  NETWORK: 'lobby.drops.level.NETWORK',
  BESPOKE: 'lobby.drops.level.BESPOKE',
};

const money = (value: string, currency: string): string =>
  withCurrency(formatAmount(value, 2), currency);

const GameThumb: FC<{ game: PrizeDropGame }> = ({ game }) => (
  <Link href={gameHref(game.slug)} title={game.title} className="group block min-w-0 flex-shrink-0">
    <span className="relative block aspect-[198/261] w-11 overflow-hidden rounded-lg bg-[#333333] transition-[filter] group-hover:brightness-110 lg:w-[calc(var(--u)*52)]">
      <Image
        src={game.image_url || '/images/placeholder.png'}
        alt={game.title}
        fill
        sizes="52px"
        className="object-cover"
      />
    </span>
  </Link>
);

/** PP leaves bet-multiplier and free-spin prizes out of the pool (§9.8), so it can be 0. */
const positive = (value: string | null): value is string => value !== null && Number(value) > 0;

const Fact: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2 sm:flex-col sm:items-start sm:gap-0.5">
    <dt className="text-[11px] uppercase tracking-[0.06em] text-[#9da2b4]">{label}</dt>
    <dd className="truncate text-[13px] font-semibold tabular-nums text-[#f0f1f5]">{value}</dd>
  </div>
);

/**
 * One Drops & Wins campaign: its prize pool, what it takes to qualify and how
 * long it runs. The lobby's card adds a strip of `maxGames` of its games
 * ("+N" for the rest); the Drops & Wins page lists them in its own grid.
 */
const PrizeDropCard: FC<{ drop: PrizeDrop; maxGames?: number }> = ({ drop, maxGames = 0 }) => {
  const { t, locale } = useTranslation();
  const upcoming = new Date(drop.starts_at).getTime() > Date.now();
  const games = drop.games.slice(0, maxGames);
  const extra = drop.games.length - games.length;
  const badges = [
    drop.level && t(LEVEL_KEY[drop.level]),
    drop.vertical === 'LIVE' && t('lobby.drops.live'),
  ].filter((badge): badge is string => !!badge);

  return (
    <article className="rl-glass flex flex-col gap-4 rounded-[20px] p-4 lg:gap-[calc(var(--u)*18)] lg:rounded-[calc(var(--u)*24)] lg:p-[calc(var(--u)*22)]">
      <header className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-semibold text-[#f0f1f5] lg:text-[length:max(13px,calc(var(--u)*18))]">
          {drop.name}
        </h3>
        {badges.length > 0 && (
          <span className="flex flex-shrink-0 gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] font-medium text-[#9da2b4]"
              >
                {badge}
              </span>
            ))}
          </span>
        )}
      </header>

      {positive(drop.prize_pool) && (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#f9d028] lg:text-[length:max(11px,calc(var(--u)*13))]">
            {t('lobby.drops.prizePool')}
          </p>
          <p className="text-[26px] font-bold leading-tight tabular-nums text-[#f4fffb] lg:text-[length:max(20px,calc(var(--u)*34))]">
            {money(drop.prize_pool, drop.currency)}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {drop.prizes_total !== null && (
          <Fact label={t('lobby.drops.prizes')} value={drop.prizes_total.toLocaleString(locale)} />
        )}
        {positive(drop.min_bet) && (
          <Fact label={t('lobby.drops.minBet')} value={money(drop.min_bet, drop.currency)} />
        )}
        <Fact
          label={t(upcoming ? 'lobby.drops.starts' : 'lobby.drops.ends')}
          value={until(upcoming ? drop.starts_at : drop.ends_at, locale)}
        />
      </dl>

      {games.length > 0 && (
        <div aria-label={t('lobby.drops.games')} className="mt-auto flex items-center gap-2">
          {games.map((game) => (
            <GameThumb key={game.id} game={game} />
          ))}
          {extra > 0 && <span className="text-xs text-[#9da2b4]">+{extra}</span>}
        </div>
      )}
    </article>
  );
};

export default PrizeDropCard;
