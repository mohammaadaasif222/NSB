import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import GameTile from '@/components/player/GameTile';
import ScrollShelf from '@/components/player/ScrollShelf';
import { ARROW_CLASS, SHELF_TRACK } from '@/components/player/ShelfHeading';
import TournamentHero from '@/components/tournaments/TournamentHero';
import TournamentSummaryHero from '@/components/tournaments/TournamentSummaryHero';
import TournamentLeaderboard from '@/components/tournaments/TournamentLeaderboard';
import PromoTextPanel from '@/components/promotions/PromoTextPanel';
import type { Countdown } from '@/components/promotions/CountdownBar';
import { ChevronLeftIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import { fetchShelfList } from '@/services/games.server';
import type { Game } from '@/types';
import Seo from '@/components/seo/Seo';
import {
  LEADERBOARD,
  PODIUM,
  TOURNAMENT_SUMMARY,
  TOURNAMENT_TERMS,
  findTournament,
} from '@/constants/tournaments';

interface Props {
  /** An i18n key while the copy is the design's placeholder. */
  title: TranslationKey;
  image: StaticImageData;
  active: boolean;
  prizePool: string;
  joined: number;
  capacity: number;
  endsIn: Countdown;
  /** When an ended one ran, as ISO dates. */
  startDate: string;
  endDate: string;
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
  startDate,
  endDate,
  games,
}) => {
  const { t, locale } = useTranslation();
  const heading = t(title);

  const day = (iso: string): string =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });

  const rows = [games.slice(0, PER_ROW), games.slice(PER_ROW)].filter((row) => row.length > 0);

  return (
    <PlayerLayout>
      <Seo title={heading} />

      {/* Explicit margins rather than `space-y`: the design's gaps down this
          column are 40 / 55 / 73 running and 40 / 40 / 86 ended, and one
          `space-y` cannot be any three of them. On a phone they are 46 / 26
          running and 20 / 20 ended, and 108 over the footer. */}
      <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
        <section>
          <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*19)]">
            <Link
              href="/tournaments"
              aria-label={t('tournament.back')}
              className={`${ARROW_CLASS} shrink-0 hover:bg-white/10`}
            >
              <ChevronLeftIcon size={20} />
            </Link>

            <h1 className="min-w-0 truncate text-[24px] font-medium leading-8 text-[#f0f1f5] lg:text-[length:max(16px,calc(var(--u)*44))] lg:font-semibold lg:leading-[calc(var(--u)*52)] lg:tracking-[-0.02em] lg:text-[#f4fffb]">
              {heading}
            </h1>

            {/* The same pill either way — green and counting, or red and
                done. The phone's ended frame draws none. */}
            <span
              className={`rl-liquid flex h-6 shrink-0 items-center rounded-full px-2 text-[12px] leading-5 lg:h-[calc(var(--u)*31)] lg:px-[calc(var(--u)*12)] lg:text-[max(11px,calc(var(--u)*14))] ${
                active
                  ? 'text-[#03b739] drop-shadow-[0_0_8.5px_rgba(3,183,57,0.2)]'
                  : 'text-[#e33827] drop-shadow-[0_0_8.5px_rgba(227,56,39,0.2)] max-lg:hidden'
              }`}
            >
              {t(active ? 'promo.live' : 'promo.expired')}
            </span>
          </div>

          <div className="mt-5 lg:mt-[calc(var(--u)*24)]">
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
                startDate={day(startDate)}
                endDate={day(endDate)}
                joined={joined}
                capacity={capacity}
                record={TOURNAMENT_SUMMARY.record}
              />
            )}
          </div>
        </section>

        {/* An ended tournament has results instead of games to go and play. */}
        {!active && (
          <div className="mt-5 lg:mt-[calc(var(--u)*40)]">
            <TournamentLeaderboard podium={PODIUM} rows={LEADERBOARD} />
          </div>
        )}

        {/* A phone runs the games as one lobby shelf — heading, View All and
            arrows — rather than the desktop's two plain rows. */}
        {active && games.length > 0 && (
          <div className="mt-[46px] lg:hidden">
            <ScrollShelf title={t('tournament.games')} href="/casino">
              {games.map((game) => (
                <GameTile key={game.id} game={game} surface="tournament-games" />
              ))}
            </ScrollShelf>
          </div>
        )}

        {active && rows.length > 0 && (
          <section className="mt-10 hidden lg:mt-[calc(var(--u)*40)] lg:block">
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
          id="terms"
          className={`scroll-mt-24 ${active ? 'mt-[26px] lg:mt-[calc(var(--u)*55)]' : 'mt-5 lg:mt-[calc(var(--u)*40)]'}`}
        >
          <PromoTextPanel title={t('promo.terms')} paragraphs={TOURNAMENT_TERMS} />
        </div>

        <div
          className={
            active ? 'mt-[108px] lg:mt-[calc(var(--u)*73)]' : 'mt-[108px] lg:mt-[calc(var(--u)*86)]'
          }
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
      startDate: tournament.startDate ?? TOURNAMENT_SUMMARY.startDate,
      endDate: tournament.endDate ?? TOURNAMENT_SUMMARY.endDate,
      games: data,
    },
  };
};

export default TournamentDetailPage;
