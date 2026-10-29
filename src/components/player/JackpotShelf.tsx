import { useEffect, useRef, useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { ShelfHeading } from '@/components/player/ShelfHeading';
import { gameHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { useJackpots } from '@/hooks/useJackpots';
import type { TranslationKey } from '@/i18n/locales';
import type { Jackpot, JackpotGame, JackpotTierLabel, JackpotWinner } from '@/services/jackpots';
import { formatAmount, withCurrency } from '@/utils/money';
import { ago } from '@/utils/relativeTime';

const TIER_KEY: Record<JackpotTierLabel, TranslationKey> = {
  MINI: 'lobby.jackpots.tier.MINI',
  MINOR: 'lobby.jackpots.tier.MINOR',
  MAJOR: 'lobby.jackpots.tier.MAJOR',
  GRAND: 'lobby.jackpots.tier.GRAND',
};

/** Games shown on a jackpot card before "+N". */
const CARD_GAMES = 4;
const COUNT_UP_MS = 1200;

const useTierName = (): ((label: JackpotTierLabel | null, tier: number) => string) => {
  const { t } = useTranslation();
  return (label, tier) => (label ? t(TIER_KEY[label]) : t('lobby.jackpots.tierN', { n: tier + 1 }));
};

const money = (value: number | string, currency: string): string =>
  withCurrency(formatAmount(String(value)), currency);

/** Providers name jackpots like identifiers ("Brand_JackpotPlay_Test"); show them as words. */
const jackpotName = (name: string): string => name.replace(/_+/g, ' ').trim();

/**
 * An amount that counts up to each new value the feed brings, rather than
 * jumping — the pots grow with every bet. Still for anyone who asks the
 * system for reduced motion, and on the first paint (the server renders the
 * figure as it is).
 */
const CountUp: FC<{ amount: string; currency: string }> = ({ amount, currency }) => {
  const target = Number(amount);
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    from.current = target;
    if (
      start === target ||
      !Number.isFinite(start) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(target);
      return undefined;
    }
    let frame = 0;
    const began = performance.now();
    const step = (now: number): void => {
      const p = Math.min(1, (now - began) / COUNT_UP_MS);
      const eased = 1 - (1 - p) ** 3;
      setShown(start + (target - start) * eased);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{money(shown.toFixed(2), currency)}</>;
};

const GameThumb: FC<{ game: JackpotGame; className: string }> = ({ game, className }) => (
  <Link
    href={gameHref(game.slug)}
    title={game.title}
    className={`relative block flex-shrink-0 overflow-hidden bg-[#333333] transition-[filter] hover:brightness-110 ${className}`}
  >
    <Image
      src={game.image_url || '/images/placeholder.png'}
      alt={game.title}
      fill
      sizes="64px"
      className="object-cover"
    />
  </Link>
);

const JackpotCard: FC<{ jackpot: Jackpot }> = ({ jackpot }) => {
  const { t } = useTranslation();
  const tierName = useTierName();
  const paused = jackpot.status === 'PAUSED';
  // The top tier is the headline; the rest are listed under it, highest first.
  const tiers = [...jackpot.tiers].reverse();
  const [top, ...rest] = tiers;
  const extra = jackpot.games.length - CARD_GAMES;

  return (
    <article
      className={`rl-glass flex flex-col gap-4 rounded-[20px] p-4 lg:gap-[calc(var(--u)*18)] lg:rounded-[calc(var(--u)*24)] lg:p-[calc(var(--u)*22)] ${
        paused ? 'opacity-60' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-semibold text-[#f0f1f5] lg:text-[length:max(13px,calc(var(--u)*18))]">
          {jackpotName(jackpot.name)}
        </h3>
        {paused && (
          <span className="flex-shrink-0 rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] font-medium text-[#9da2b4]">
            {t('lobby.jackpots.paused')}
          </span>
        )}
      </header>

      {top ? (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#f9d028] lg:text-[length:max(11px,calc(var(--u)*13))]">
            {tierName(top.label, top.tier)}
          </p>
          <p
            className="text-[26px] font-bold leading-tight tabular-nums text-[#f4fffb] lg:text-[length:max(20px,calc(var(--u)*34))]"
            aria-live="off"
          >
            <CountUp amount={top.amount} currency={jackpot.currency} />
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#9da2b4]">{t('lobby.jackpots.noOpenTier')}</p>
      )}

      {rest.length > 0 && (
        <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {rest.map((tier) => (
            <div
              key={tier.tier}
              className="flex items-baseline justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2 sm:flex-col sm:items-start sm:gap-0.5"
            >
              <dt className="text-[11px] uppercase tracking-[0.06em] text-[#9da2b4]">
                {tierName(tier.label, tier.tier)}
              </dt>
              <dd className="truncate text-[13px] font-semibold tabular-nums text-[#f0f1f5]">
                <CountUp amount={tier.amount} currency={jackpot.currency} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {jackpot.games.length > 0 && (
        <div className="mt-auto flex items-center gap-2" aria-label={t('lobby.jackpots.games')}>
          {jackpot.games.slice(0, CARD_GAMES).map((game) => (
            <GameThumb
              key={game.id}
              game={game}
              className="aspect-[198/261] w-11 rounded-lg lg:w-[calc(var(--u)*52)]"
            />
          ))}
          {extra > 0 && <span className="text-xs text-[#9da2b4]">+{extra}</span>}
        </div>
      )}
    </article>
  );
};

const WinnerRow: FC<{ winner: JackpotWinner }> = ({ winner }) => {
  const { t, locale } = useTranslation();
  const tierName = useTierName();
  const what = winner.jackpot
    ? `${jackpotName(winner.jackpot.name)} · ${tierName(winner.jackpot.label, winner.jackpot.tier)}`
    : t('lobby.jackpots.badge');

  return (
    <li className="flex items-center gap-3">
      {winner.game ? (
        <GameThumb game={winner.game} className="aspect-square w-10 rounded-[10px]" />
      ) : (
        <span
          aria-hidden="true"
          className="flex aspect-square w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#f9d028]/10 text-[#f9d028]"
        >
          ★
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-[#f0f1f5]">
          {t('lobby.jackpots.won', {
            player: winner.player,
            amount: money(winner.amount, winner.currency),
          })}
        </p>
        <p className="truncate text-[11px] text-[#9da2b4]">
          {what}
          {winner.win_type === 'COMMUNITY' && ` · ${t('lobby.jackpots.community')}`}
        </p>
      </div>
      <time dateTime={winner.won_at} className="flex-shrink-0 text-[11px] text-[#9da2b4]">
        {ago(winner.won_at, locale)}
      </time>
    </li>
  );
};

const Placeholder: FC<{ className: string }> = ({ className }) => (
  <div aria-hidden="true" className={`rl-glass animate-pulse rounded-[20px] ${className}`} />
);

/**
 * The lobby's jackpot row: every provider jackpot that is running — its top
 * pot counting up, the other tiers under it, the games that feed it — and
 * the latest jackpot wins beside it. Both lists come from our own API (the
 * backend reads the providers' feeds), refreshed once a minute, and each
 * says so plainly when it is empty. Paused jackpots stay listed, dimmed.
 */
const JackpotShelf: FC = () => {
  const { t } = useTranslation();
  const { jackpots, winners, loaded } = useJackpots();

  return (
    <section aria-label={t('lobby.jackpots.title')} id="jackpots">
      <ShelfHeading title={t('lobby.jackpots.title')} />

      <div className="mt-4 grid gap-4 lg:mt-[calc(var(--u)*20)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-[calc(var(--u)*20)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-[calc(var(--u)*20)]">
          {!loaded ? (
            <>
              <Placeholder className="h-48" />
              <Placeholder className="hidden h-48 sm:block" />
            </>
          ) : jackpots.length === 0 ? (
            <p className="rl-glass rounded-[20px] px-4 py-6 text-sm text-[#9da2b4] sm:col-span-2">
              {t('lobby.jackpots.empty')}
            </p>
          ) : (
            jackpots.map((jackpot) => <JackpotCard key={jackpot.id} jackpot={jackpot} />)
          )}
        </div>

        <aside
          aria-label={t('lobby.jackpots.winnersTitle')}
          className="rl-glass rounded-[20px] p-4 lg:rounded-[calc(var(--u)*24)] lg:p-[calc(var(--u)*22)]"
        >
          <h3 className="mb-3 text-[15px] font-semibold text-[#f0f1f5] lg:text-[length:max(13px,calc(var(--u)*18))]">
            {t('lobby.jackpots.winnersTitle')}
          </h3>
          {!loaded ? (
            <Placeholder className="h-32" />
          ) : winners.length === 0 ? (
            <p className="text-sm text-[#9da2b4]">{t('lobby.jackpots.winnersEmpty')}</p>
          ) : (
            <ul className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pe-1">
              {winners.map((winner) => (
                <WinnerRow key={winner.id} winner={winner} />
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
};

export default JackpotShelf;
