import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { Dropdown, Option, SearchField } from '@/components/player/BrowseControls';
import sortIcon from '@/assets/lobby/player/tool-sort.svg';
import filterIcon from '@/assets/lobby/player/tool-filter.svg';
import leagueIcon from '@/assets/lobby/player/tool-provider.svg';
import type { TranslationKey } from '@/i18n/locales';
import type { Fixture } from '@/services/sportsbook.sample';

export type FixtureSort = 'kickoff' | 'league';
export type FixtureFilter = 'all' | 'live' | 'upcoming';

/** What the sportsbook toolbar is set to. */
export interface FixtureQuery {
  search: string;
  sort: FixtureSort;
  filter: FixtureFilter;
  /** A competition's name; empty for every one. */
  league: string;
}

export const FIXTURE_QUERY_DEFAULTS: FixtureQuery = {
  search: '',
  sort: 'kickoff',
  filter: 'all',
  league: '',
};

const SORTS: { key: FixtureSort; labelKey: TranslationKey }[] = [
  { key: 'kickoff', labelKey: 'sports.sortKickoff' },
  { key: 'league', labelKey: 'sports.sortLeague' },
];

const FILTERS: { key: FixtureFilter; labelKey: TranslationKey }[] = [
  { key: 'all', labelKey: 'sports.filterAll' },
  { key: 'live', labelKey: 'sports.filterLive' },
  { key: 'upcoming', labelKey: 'sports.filterUpcoming' },
];

/** In-play first (earliest minute first, as the design lists them), then by kick-off time. */
const byKickoff = (a: Fixture, b: Fixture): number => {
  if (a.status.live !== b.status.live) return a.status.live ? -1 : 1;
  if (a.status.live && b.status.live) return a.status.minute - b.status.minute;
  return !a.status.live && !b.status.live ? a.status.kickoff.localeCompare(b.status.kickoff) : 0;
};

/** Fixtures narrowed and ordered as the toolbar asks. */
export const queryFixtures = (fixtures: Fixture[], q: FixtureQuery): Fixture[] => {
  const term = q.search.trim().toLowerCase();
  const out = fixtures.filter(
    (f) =>
      (!term || [f.home.name, f.away.name, f.league].some((s) => s.toLowerCase().includes(term))) &&
      (q.filter === 'all' || (q.filter === 'live') === f.status.live) &&
      (!q.league || f.league === q.league)
  );
  return out.sort(q.sort === 'league' ? (a, b) => a.league.localeCompare(b.league) : byKickoff);
};

interface Props {
  query: FixtureQuery;
  onChange: (patch: Partial<FixtureQuery>) => void;
  /** Competitions to offer; omit to leave the league picker out. */
  leagues?: string[];
}

/**
 * The sportsbook's toolbar, on the catalogue's controls: search, then sort,
 * filter and — on the lobby — a league picker.
 */
const SportsToolbar: FC<Props> = ({ query, onChange, leagues }) => {
  const { t } = useTranslation();
  const label = (list: { key: string; labelKey: TranslationKey }[], key: string): string =>
    t(list.find((item) => item.key === key)?.labelKey ?? list[0].labelKey);

  return (
    <div className="flex flex-col gap-[14px] lg:flex-row lg:gap-[calc(var(--u)*20)]">
      <SearchField
        value={query.search}
        onChange={(search) => onChange({ search })}
        placeholder={t('sports.search')}
        label={t('sports.search')}
      />

      <div
        className={`grid gap-[7px] lg:flex lg:gap-[calc(var(--u)*13)] ${leagues ? 'grid-cols-[auto_auto_minmax(0,1fr)] min-[420px]:grid-cols-[1fr_1fr_1.53fr]' : 'grid-cols-[auto_auto] justify-start'}`}
      >
        <Dropdown icon={sortIcon} label={label(SORTS, query.sort)} phoneLabel={t('browse.sort')}>
          {(close) =>
            SORTS.map((s) => (
              <Option
                key={s.key}
                selected={query.sort === s.key}
                onSelect={() => {
                  onChange({ sort: s.key });
                  close();
                }}
              >
                {t(s.labelKey)}
              </Option>
            ))
          }
        </Dropdown>

        <Dropdown
          icon={filterIcon}
          label={label(FILTERS, query.filter)}
          phoneLabel={t('browse.filter')}
        >
          {(close) =>
            FILTERS.map((f) => (
              <Option
                key={f.key}
                selected={query.filter === f.key}
                onSelect={() => {
                  onChange({ filter: f.key });
                  close();
                }}
              >
                {t(f.labelKey)}
              </Option>
            ))
          }
        </Dropdown>

        {leagues && (
          <Dropdown icon={leagueIcon} label={query.league || t('sports.chooseLeague')}>
            {(close) => (
              <>
                <Option
                  selected={query.league === ''}
                  onSelect={() => {
                    onChange({ league: '' });
                    close();
                  }}
                >
                  {t('sports.allLeagues')}
                </Option>
                {leagues.map((name) => (
                  <Option
                    key={name}
                    selected={query.league === name}
                    onSelect={() => {
                      onChange({ league: name });
                      close();
                    }}
                  >
                    {name}
                  </Option>
                ))}
              </>
            )}
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default SportsToolbar;
