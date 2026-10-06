import { useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';
import { gameHref } from '@/constants/games';
import { SHELF_TRACK } from '@/components/player/GameRow';
import avatar from '@/assets/lobby/winner-avatar.webp';

/**
 * Illustrative "Recent Winners" row.
 *
 * There is no bets feed yet, so the winners are the design's sample rows,
 * paired with real games from the lobby's own shelves so each card opens a
 * game that exists. The tabs switch state but filter nothing until a feed
 * lands. English-only copy on purpose, like the other illustrative rows.
 */
const SAMPLE: { id: string; user: string; multiplier: string; payout: string }[] = [
  { id: 'w1', user: 'Crimson Raiders', multiplier: '2.01x', payout: '0.47390026 SOL' },
  { id: 'w2', user: 'Crimson Raiders', multiplier: '2.01x', payout: '0.47390026 SOL' },
  { id: 'w3', user: 'Azure Sentinels', multiplier: '2.02x', payout: '0.52130045 SOL' },
  { id: 'w4', user: 'Golden Valkyries', multiplier: '1.98x', payout: '0.46210000 SOL' },
  { id: 'w5', user: 'Shadow Legion', multiplier: '2.10x', payout: '0.49890012 SOL' },
  { id: 'w6', user: 'Emerald Enforcers', multiplier: '1.95x', payout: '0.45075000 SOL' },
  { id: 'w7', user: 'Obsidian Wolves', multiplier: '2.05x', payout: '0.48500000 SOL' },
];

/** Each design's tab set: the landing page's, and the signed-in lobby's. */
export const WINNER_TABS = {
  landing: ['Active wins', 'All Bets', 'Casino Wins'],
  player: ['All bets', 'Casino Bets', 'Sports Bets'],
} as const;

/** The pulsing green "Live Bets" badge. */
const LiveBadge: FC = () => (
  <span className="inline-flex h-[calc(var(--u)*36)] flex-shrink-0 items-center gap-[calc(var(--u)*3)] rounded-[calc(var(--u)*34)] bg-[#038f2d]/10 px-[calc(var(--u)*12)] text-[length:max(min(11px,12px),calc(var(--u)*12))] font-medium leading-[calc(var(--u)*20)] text-[#03b739]">
    <span
      className="relative flex h-[calc(var(--u)*15)] w-[calc(var(--u)*15)] items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#03b739]/50" />
      <span className="absolute inset-0 rounded-full bg-[#03b739]/50" />
      <span className="h-[calc(var(--u)*7.5)] w-[calc(var(--u)*7.5)] rounded-full bg-[#03b739]" />
    </span>
    Live Bets
  </span>
);

/*
 * The card is laid out in `cqw` of the design's 198px card, like the game
 * tiles, so the phone's 122px card is the same card scaled — with floors on
 * the text so it stays readable there.
 */
const WinnerCard: FC<{ game: Game; win: (typeof SAMPLE)[number] }> = ({ game, win }) => (
  <div className="@container">
    <Link
      href={gameHref(game.slug)}
      title={`${win.user} won ${win.payout} on ${game.title}`}
      className="group relative block aspect-[198/261] overflow-hidden rounded-[11.1cqw] bg-[#333333]"
    >
      <Image
        src={game.image_url || '/images/placeholder.png'}
        alt={game.title}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 200px"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
      />

      <span className="rl-glass-deep absolute inset-x-0 bottom-0 flex h-[31.8%] flex-col justify-between rounded-b-[11.1cqw] px-[6.57cqw] pb-[6.57cqw] pt-[5.56cqw]">
        <span className="flex min-w-0 items-center gap-[4.04cqw]">
          <Image
            src={avatar}
            alt=""
            className="h-[18.2cqw] w-[18.2cqw] flex-shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-[max(10px,7.07cqw)] font-medium leading-[1.43] text-[#f0f1f5]">
            {win.user}
          </span>
        </span>
        <span className="flex items-center justify-between gap-[calc(var(--u)*4)] text-[max(10px,7.07cqw)] leading-[1.43] tabular-nums">
          <span className="font-medium text-[#f4fffb]">{win.multiplier}</span>
          <span className="truncate font-medium text-[#f0f1f5]">{win.payout}</span>
        </span>
      </span>
    </Link>
  </div>
);

interface Props {
  /** Games to pair the sample winners with — any of the lobby's shelves. */
  games: Game[];
  /** Which design's tabs to show. */
  tabs?: keyof typeof WINNER_TABS;
}

const RecentWinners: FC<Props> = ({ games, tabs = 'landing' }) => {
  const labels: readonly string[] = WINNER_TABS[tabs];
  const [tab, setTab] = useState(0);

  if (games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-[calc(var(--u)*17)] lg:space-y-[calc(var(--u)*20)]">
      <div className="flex flex-wrap items-center justify-between gap-y-[calc(var(--u)*11)] lg:flex-nowrap">
        <div className="flex w-full items-center justify-between gap-[calc(var(--u)*20)] lg:w-auto lg:justify-start">
          <h2 className="text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-white">
            Recent Winners
          </h2>
          <LiveBadge />
        </div>

        <div className="flex w-full justify-center gap-[calc(var(--u)*6)] lg:w-auto" role="tablist">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`h-[calc(var(--u)*36)] rounded-[calc(var(--u)*24)] px-[calc(var(--u)*16)] text-[length:max(min(11px,12px),calc(var(--u)*12))] font-medium leading-[calc(var(--u)*20)] transition-colors ${
                tab === i
                  ? 'bg-[#f0f1f5] text-[#07080a]'
                  : 'border border-[#333849] text-[#f0f1f5] hover:border-[#4a5068]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={SHELF_TRACK}>
        {SAMPLE.map((win, i) => (
          <WinnerCard key={win.id} game={games[i % games.length]} win={win} />
        ))}
      </div>
    </section>
  );
};

export default RecentWinners;
