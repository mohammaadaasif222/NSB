import { useMemo, useState, type FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import LobbyBanner from '@/components/player/LobbyBanner';
import SiteFooter from '@/components/player/SiteFooter';
import { SportsShelf } from '@/components/player/SportsRow';
import { ChipButton, CHIP_ROW } from '@/components/player/BrowseControls';
import MatchShelf from '@/components/sports/MatchShelf';
import SportsToolbar, {
  FIXTURE_QUERY_DEFAULTS,
  queryFixtures,
  type FixtureQuery,
} from '@/components/sports/SportsToolbar';
import { useTranslation } from '@/context/I18nContext';
import { SPORT_CHIPS, isSportKey, sportHref, type FixtureSport } from '@/constants/sportsbook';
import { ALL_FIXTURES, LOBBY_SECTIONS } from '@/services/sportsbook.sample';
import Seo from '@/components/seo/Seo';

/** Every competition in the sample, for the league picker. */
const LEAGUES = [...new Set(ALL_FIXTURES.map((f) => f.league))].sort();

/**
 * The sportsbook lobby, as the design lays it out: the banner, the toolbar,
 * the lobby's Sports shelf (a 3D tile per sport), then Highlights, Top Sports (with its sport chips), Top
 * Events and Upcoming. Fixtures are sample data until a feed exists — see
 * services/sportsbook.sample. The toolbar narrows every section at once.
 */
const Sports: FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<FixtureQuery>(FIXTURE_QUERY_DEFAULTS);
  const [chip, setChip] = useState<FixtureSport | 'all'>('all');

  const sections = useMemo(() => {
    const topSports = LOBBY_SECTIONS.topSports.filter((f) => chip === 'all' || f.sport === chip);
    return {
      highlights: queryFixtures(LOBBY_SECTIONS.highlights, query),
      topSports: queryFixtures(topSports, query),
      topEvents: queryFixtures(LOBBY_SECTIONS.topEvents, query),
      upcoming: queryFixtures(LOBBY_SECTIONS.upcoming, query),
    };
  }, [query, chip]);

  const allSports = sportHref('football');
  const chipHref = isSportKey(chip) ? sportHref(chip) : allSports;
  const empty = Object.values(sections).every((list) => list.length === 0);

  return (
    <PlayerLayout>
      <Seo title={t('nav.sports')} />

      <div className="mx-auto max-w-[1548px] px-1 pt-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*4)]">
        <LobbyBanner />

        <div className="mt-[30px] lg:mt-[calc(var(--u)*26)]">
          <SportsToolbar
            query={query}
            onChange={(patch) => setQuery((q) => ({ ...q, ...patch }))}
            leagues={LEAGUES}
          />
        </div>

        <div className="mt-5 lg:mt-[calc(var(--u)*30)]">
          <SportsShelf paged={false} />
        </div>

        <div className="mt-10 space-y-10 lg:mt-[calc(var(--u)*80)] lg:space-y-[calc(var(--u)*80)]">
          {empty && (
            <p className="rl-liquid rounded-[24px] px-4 py-10 text-center text-sm text-[#9da2b4]">
              {t('sports.noMatches')}
            </p>
          )}
          {sections.highlights.length > 0 && (
            <MatchShelf
              title={t('sports.highlights')}
              fixtures={sections.highlights}
              viewAll={allSports}
            />
          )}
          <MatchShelf
            title={t('sports.topSports')}
            fixtures={sections.topSports}
            viewAll={chipHref}
            toolbar={
              <div className={`${CHIP_ROW} lg:pb-[calc(var(--u)*22)] lg:pt-[calc(var(--u)*16)]`}>
                {SPORT_CHIPS.map((c) => (
                  <ChipButton key={c.key} active={chip === c.key} onClick={() => setChip(c.key)}>
                    {c.label ? t(c.label) : t('sports.allSports')}
                  </ChipButton>
                ))}
              </div>
            }
          />
          {sections.topEvents.length > 0 && (
            <MatchShelf
              title={t('sports.topEvents')}
              fixtures={sections.topEvents}
              rows={2}
              viewAll={allSports}
            />
          )}
          {sections.upcoming.length > 0 && (
            <MatchShelf
              title={t('sports.upcoming')}
              fixtures={sections.upcoming}
              rows={2}
              viewAll={allSports}
            />
          )}
        </div>

        <div className="mt-10 lg:mt-[calc(var(--u)*80)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default Sports;
