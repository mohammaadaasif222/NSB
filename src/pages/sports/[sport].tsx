import { useMemo, useState, type FC } from 'react';
import type { GetServerSideProps } from 'next';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import Betslip from '@/components/sports/Betslip';
import LeagueTable from '@/components/sports/LeagueTable';
import MatchShelf from '@/components/sports/MatchShelf';
import { MatchTracker, OfferBanner, SafePlayCard } from '@/components/sports/SidePanels';
import SportsToolbar, {
  FIXTURE_QUERY_DEFAULTS,
  queryFixtures,
  type FixtureQuery,
} from '@/components/sports/SportsToolbar';
import { useTranslation } from '@/context/I18nContext';
import {
  fixtureSportOf,
  isSportPageKey,
  sportPageLabel,
  type SportPageKey,
} from '@/constants/sportsbook';
import { ALL_FIXTURES, SPORT_SECTIONS } from '@/services/sportsbook.sample';
import Seo from '@/components/seo/Seo';

interface Props {
  sport: SportPageKey;
}

/**
 * A sport's page: the offer, Featured Matches, Live & Upcoming Leagues, then
 * every league's matches beside the betslip, the live tracker and the
 * responsible-play card. Sample fixtures (services/sportsbook.sample): the
 * design's football content on football, the sample's own match elsewhere.
 */
const SportPage: FC<Props> = ({ sport }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<FixtureQuery>(FIXTURE_QUERY_DEFAULTS);
  const labelKey = sportPageLabel(sport);
  const label = labelKey ? t(labelKey) : '';

  const view = useMemo(() => {
    const ofSport = <T extends { sport: string }>(list: T[]): T[] =>
      list.filter((f) => f.sport === fixtureSportOf(sport));
    const football = sport === 'football';
    const others = ofSport(ALL_FIXTURES);
    return {
      featured: queryFixtures(football ? SPORT_SECTIONS.featured : others, query),
      liveLeagues: queryFixtures(
        football ? SPORT_SECTIONS.liveLeagues : others.filter((f) => f.status.live),
        query
      ),
      leagues: (football ? SPORT_SECTIONS.leagues : [])
        .map((league) => ({ ...league, fixtures: queryFixtures(league.fixtures, query) }))
        .filter((league) => league.fixtures.length > 0),
    };
  }, [sport, query]);

  return (
    <PlayerLayout>
      <Seo title={`${label} — ${t('nav.sports')}`} />

      <div className="mx-auto max-w-[1548px] px-1 pt-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*7)]">
        <SportsToolbar query={query} onChange={(patch) => setQuery((q) => ({ ...q, ...patch }))} />

        <div className="mt-[30px] lg:mt-[calc(var(--u)*28)]">
          <OfferBanner />
        </div>

        {view.featured.length > 0 && (
          <div className="mt-[30px] lg:mt-[calc(var(--u)*40)]">
            <MatchShelf
              title={t('sports.featuredMatches')}
              fixtures={view.featured}
              viewAll={`/sports/${sport}`}
            />
          </div>
        )}

        {view.liveLeagues.length > 0 && (
          <div className="mt-10 lg:mt-[calc(var(--u)*84)]">
            {/* Desktop draws this heading bare; a phone keeps "View All" and the arrows. */}
            <MatchShelf
              title={t('sports.liveLeagues')}
              fixtures={view.liveLeagues}
              viewAll={`/sports/${sport}`}
              endClassName="lg:hidden"
            />
          </div>
        )}

        <div className="mt-[30px] grid gap-5 lg:mt-[calc(var(--u)*71)] lg:grid-cols-[minmax(0,1fr)_calc(var(--u)*374)] lg:items-start lg:gap-[calc(var(--u)*17)]">
          <div className="flex flex-col gap-5 lg:gap-[calc(var(--u)*20)]">
            {view.leagues.length > 0 ? (
              view.leagues.map((league) => <LeagueTable key={league.id} league={league} />)
            ) : (
              <p className="rl-liquid rounded-[24px] px-4 py-10 text-center text-sm text-[#9da2b4] lg:rounded-[calc(var(--u)*34)]">
                {t('sports.noMatches')}
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-5 lg:gap-[calc(var(--u)*20)]">
            <Betslip />
            <MatchTracker />
            <SafePlayCard />
          </aside>
        </div>

        <div className="mt-10 lg:mt-[calc(var(--u)*142)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

/** Unknown sports are a 404, not an empty page. */
export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) =>
  isSportPageKey(params?.sport) ? { props: { sport: params.sport } } : { notFound: true };

export default SportPage;
