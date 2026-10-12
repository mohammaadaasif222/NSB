import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import GameTile from '@/components/player/GameTile';
import { ARROW_CLASS, SHELF_TRACK } from '@/components/player/ShelfHeading';
import TournamentHero from '@/components/tournaments/TournamentHero';
import TournamentSummaryHero from '@/components/tournaments/TournamentSummaryHero';
import TournamentLeaderboard from '@/components/tournaments/TournamentLeaderboard';
import PromoTextPanel from '@/components/promotions/PromoTextPanel';
import type { Countdown } from '@/components/promotions/CountdownBar';
import { ChevronLeftIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import { fetchShelfList } from '@/services/games.server';
import type { Game } from '@/types';
import {
  LEADERBOARD,
  PODIUM,
  TOURNAMENT_SUMMARY,
  TOURNAMENT_TERMS,
  findTournament,
} from '@/constants/tournaments';

interface Props {
  title: string;
  image: StaticImageData;
  active: boolean;
  prizePool: string;
  joined: number;
  capacity: number;
  endsIn: Countdown;
  /** The Games rows — real catalogue games, fourteen as the design draws. */
  games: Game[];
}

/* The design splits the games into two rows of seven. */
const PER_ROW = 7;

/**
 * One tournament, in whichever of the design's two states it is in.
 *
 * Running, it counts down and offers the games to go and play. Ended, the
 * countdown gives way to the dates and the headcount, and the games give way
 * to the leaderboard — nobody can still enter, so there is nothing to send
 * them to.
 *
 * PLACEHOLDER, except the games. There is no tournaments table and no
 * endpoint, so the headline, the prize pool, the seat count, the countdown,
 * the terms and every leaderboard figure are the design's own, identical
 * whatever `slug` asks for. The Games rows are real: they read the catalogue
 * the lobby reads, so the shelves are never a mock even while the tournament
 * around them is.
 */
const TournamentDetailPage: FC<Props> = ({
  title,
  image,
  active,
  prizePool,
  joined,
  capacity,
  endsIn,
  games,
}) => {
  const { t } = useTranslation();

  const rows = [games.slice(0, PER_ROW), games.slice(PER_ROW)].filter((row) => row.length > 0);

  return (
    <PlayerLayout>
      <Head>
        <title>{`${title} · ROLLUCK`}</title>
      </Head>

      {/* Explicit margins rather than `space-y`: the design's gaps down this
          column are 40 / 55 / 73 running and 40 / 40 / 86 ended, and one
          `space-y` cannot be any three of them. */}
      <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0">
        <section>
          <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*19)]">
            <Link
              href="/tournaments"
              aria-label={t('tournament.back')}
              className={`${ARROW_CLASS} shrink-0 hover:bg-white/10`}
            >
              <ChevronLeftIcon size={20} />
            </Link>

            <h1 className="min-w-0 truncate text-[22px] font-semibold leading-8 tracking-[-0.02em] text-[#f4fffb] lg:text-[length:max(16px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
              {title}
            </h1>

            {/* The same pill either way — green and counting, or red and
                done. */}
            <span
              className={`rl-liquid flex h-[26px] shrink-0 items-center rounded-full px-3 text-[13px] leading-5 lg:h-[calc(var(--u)*31)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))] ${
                active
                  ? 'text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)]'
                  : 'text-[#e33827] drop-shadow-[0_0_8.5px_rgba(227,56,39,0.2)]'
              }`}
            >
              {t(active ? 'promo.live' : 'promo.expired')}
            </span>
          </div>

          <div className="mt-4 lg:mt-[calc(var(--u)*24)]">
            {active ? (
              <TournamentHero
                image={image}
                prizePool={prizePool}
                joined={joined}
                capacity={capacity}
                endsIn={endsIn}
              />
            ) : (
              <TournamentSummaryHero
                image={image}
                prizePool={prizePool}
                startDate={TOURNAMENT_SUMMARY.startDate}
                endDate={TOURNAMENT_SUMMARY.endDate}
                joined={joined}
                capacity={capacity}
                record={TOURNAMENT_SUMMARY.record}
              />
            )}
          </div>
        </section>

        {/* An ended tournament has results instead of games to go and play. */}
        {!active && (
          <div className="mt-10 lg:mt-[calc(var(--u)*40)]">
            <TournamentLeaderboard podium={PODIUM} rows={LEADERBOARD} />
          </div>
        )}

        {active && rows.length > 0 && (
          <section className="mt-10 lg:mt-[calc(var(--u)*40)]">
            {/* Not ShelfHeading: the frame draws the word on its own, with no
                "View All" and no arrow pair to hang off the other end. */}
            <h2 className="text-[22px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(16px,calc(var(--u)*32))] lg:leading-[calc(var(--u)*40)]">
              {t('tournament.games')}
            </h2>

            <div className="mt-4 space-y-4 lg:mt-[calc(var(--u)*16)] lg:space-y-[calc(var(--u)*27)]">
              {rows.map((row, i) => (
                <div key={i} className={SHELF_TRACK}>
                  {row.map((game) => (
                    <GameTile key={game.id} game={game} surface="tournament-games" />
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <div
          className={active ? 'mt-10 lg:mt-[calc(var(--u)*55)]' : 'mt-10 lg:mt-[calc(var(--u)*40)]'}
        >
          <PromoTextPanel title={t('promo.terms')} paragraphs={TOURNAMENT_TERMS} />
        </div>

        <div
          className={active ? 'mt-12 lg:mt-[calc(var(--u)*73)]' : 'mt-12 lg:mt-[calc(var(--u)*86)]'}
        >
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

/**
 * The Games rows only, and only while the tournament is running — the ended
 * frame has no games row to fill. The tournament itself has no endpoint, so
 * there is nothing else to fetch, and a failed catalogue read drops the rows
 * rather than the page.
 */
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const tournament = findTournament(String(context.params?.slug ?? ''));
  if (!tournament) {
    return { notFound: true };
  }

  const { data } = tournament.active
    ? await fetchShelfList({ category: 'SLOTS' }, 1, PER_ROW * 2)
    : { data: [] };

  return {
    props: {
      title: tournament.title,
      image: tournament.image,
      active: tournament.active,
      prizePool: tournament.prizePool,
      joined: tournament.joined,
      capacity: tournament.capacity,
      endsIn: tournament.endsIn,
      games: data,
    },
  };
};

export default TournamentDetailPage;
