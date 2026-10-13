import { useId, useState, type FC } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import OddsButton from '@/components/sports/OddsButton';
import { text } from '@/components/player/typeScale';
import { useFixtureStatus } from '@/components/sports/MatchCard';
import type { Fixture, League } from '@/services/sportsbook.sample';

/** "+45 Markets": the depth of the match's book beyond 1×2. */
const MarketsBadge: FC<{ count: number }> = ({ count }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`${text(12)} inline-flex h-[28px] flex-shrink-0 items-center rounded-full bg-white/10 px-[10px] leading-5 text-[#f0f1f5] lg:h-[calc(var(--u)*28)] lg:bg-[#1b1f29] lg:px-[calc(var(--u)*10)] lg:leading-[calc(var(--u)*20)] lg:text-[#9da2b4]`}
    >
      {t('sports.markets', { count })}
    </span>
  );
};

/**
 * One match in a league: status, the two teams, the three priced outcomes
 * and the market count. One line on desktop; on a phone the prices drop to
 * a row of their own under the teams.
 */
const MatchRow: FC<{ fixture: Fixture }> = ({ fixture }) => {
  const status = useFixtureStatus(fixture);

  return (
    <li className="grid grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-y-[15px] rounded-[24px] bg-white/5 px-3 pb-4 pt-[10px] lg:grid-cols-[calc(var(--u)*66)_calc(var(--u)*244)_calc(var(--u)*465)_minmax(0,1fr)] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*17)] lg:py-[calc(var(--u)*10)]">
      <span
        className={`${text(14)} ps-3 leading-[calc(var(--u)*20)] tabular-nums text-white lg:ps-0`}
      >
        {fixture.status.live ? `${fixture.status.minute}'` : status}
      </span>
      <span
        className={`${text(14)} flex min-w-0 flex-col gap-[calc(var(--u)*4)] font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}
      >
        <span className="truncate">{fixture.home.name}</span>
        <span className="truncate">{fixture.away.name}</span>
      </span>
      <span className="col-span-3 row-start-2 flex gap-3 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:gap-[calc(var(--u)*11)]">
        <OddsButton fixture={fixture} outcome="home" variant="row" />
        <OddsButton fixture={fixture} outcome="draw" variant="row" />
        <OddsButton fixture={fixture} outcome="away" variant="row" />
      </span>
      <span className="col-start-3 row-start-1 justify-self-end lg:col-start-4">
        <MarketsBadge count={fixture.markets} />
      </span>
    </li>
  );
};

/**
 * A league's matches in a collapsible glass block: badge, name and match
 * count in the header, a chevron to fold it away.
 */
const LeagueTable: FC<{ league: League }> = ({ league }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const listId = useId();
  const name = `${t(league.country)} - ${league.name}`;

  return (
    <section className="rl-liquid rounded-[34px] px-3 pb-4 pt-[18px] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*19)] lg:pb-[calc(var(--u)*18)] lg:pt-[calc(var(--u)*18)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('sports.toggleLeague', { league: name })}
        className="flex w-full items-center gap-[calc(var(--u)*4)] text-start"
      >
        {league.badge && (
          <Image
            src={league.badge}
            alt=""
            className="h-[calc(var(--u)*26)] w-[calc(var(--u)*26)] rounded-full object-contain"
          />
        )}
        <span
          className={`${text(16)} ms-[calc(var(--u)*4)] truncate font-medium leading-[calc(var(--u)*24)] text-[#f0f1f5]`}
        >
          {name}
        </span>
        <span className={`${text(12)} leading-[calc(var(--u)*20)] text-[#ffe779]`}>
          {league.fixtures.length}
        </span>
        <svg
          viewBox="0 0 15 15"
          fill="none"
          aria-hidden="true"
          className={`ms-auto h-[calc(var(--u)*15)] w-[calc(var(--u)*15)] flex-shrink-0 text-[#f0f1f5] transition-transform ${open ? '' : '-rotate-90'}`}
        >
          <path
            d="M3 6l4.5 4.5L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          className="mt-[calc(var(--u)*13)] flex flex-col gap-3 lg:gap-[calc(var(--u)*8)]"
        >
          {league.fixtures.map((fixture) => (
            <MatchRow key={fixture.id} fixture={fixture} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default LeagueTable;
