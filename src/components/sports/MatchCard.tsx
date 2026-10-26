import type { FC } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import OddsButton from '@/components/sports/OddsButton';
import { text } from '@/components/player/typeScale';
import type { Fixture, Team } from '@/services/sportsbook.sample';

/** A crest, or the team's initial on a disc when it has none. */
const Crest: FC<{ team: Team }> = ({ team }) =>
  team.crest ? (
    <Image
      src={team.crest}
      alt=""
      className="h-[calc(var(--u)*22)] w-[calc(var(--u)*22)] flex-shrink-0 rounded-full object-contain"
    />
  ) : (
    <span
      aria-hidden="true"
      className="flex h-[calc(var(--u)*22)] w-[calc(var(--u)*22)] flex-shrink-0 items-center justify-center rounded-full bg-[#252937] text-[length:max(10px,calc(var(--u)*11))] font-semibold text-[#9da2b4]"
    >
      {team.name.charAt(0)}
    </span>
  );

/** A team's line: crest, name, and its score (a dash until there is one). */
const TeamLine: FC<{ team: Team; score: number | undefined }> = ({ team, score }) => (
  <span className="flex h-[calc(var(--u)*22)] items-center gap-[calc(var(--u)*7)]">
    <Crest team={team} />
    <span
      className={`${text(14)} min-w-0 flex-1 truncate font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}
    >
      {team.name}
    </span>
    <span
      className={`${text(14)} font-rubik font-semibold leading-[calc(var(--u)*17)] tabular-nums text-[#9da2b4]`}
    >
      {score ?? '-'}
    </span>
  </span>
);

/** "LIVE 23'" while in play, the kick-off time before it. */
export const useFixtureStatus = (fixture: Fixture): string => {
  const { t } = useTranslation();
  return fixture.status.live
    ? t('sports.live', { minute: fixture.status.minute })
    : fixture.status.kickoff;
};

/**
 * The design's 374×192 match card: competition and status, the two teams,
 * and the 1×2 prices — each a button onto the betslip.
 */
const MatchCard: FC<{ fixture: Fixture }> = ({ fixture }) => {
  const status = useFixtureStatus(fixture);

  return (
    <article className="rl-liquid flex h-[calc(var(--u)*192)] flex-col rounded-[calc(var(--u)*34)] px-[calc(var(--u)*16)] pb-[calc(var(--u)*22)] pt-[calc(var(--u)*21)]">
      <header
        className={`${text(12)} flex items-center justify-between gap-2 leading-[calc(var(--u)*20)] text-[#9da2b4]`}
      >
        <span className="truncate">{fixture.league}</span>
        <span className="flex-shrink-0 tabular-nums">{status}</span>
      </header>

      <div className="mt-[calc(var(--u)*12)] flex flex-col gap-[calc(var(--u)*10)]">
        <TeamLine team={fixture.home} score={fixture.score?.[0]} />
        <TeamLine team={fixture.away} score={fixture.score?.[1]} />
      </div>

      <div className="mt-auto border-t border-[#333849] pt-[calc(var(--u)*16)]">
        <div className="flex gap-[calc(var(--u)*8)]">
          <OddsButton fixture={fixture} outcome="home" variant="card" />
          <OddsButton fixture={fixture} outcome="draw" variant="card" />
          <OddsButton fixture={fixture} outcome="away" variant="card" />
        </div>
      </div>
    </article>
  );
};

export default MatchCard;
