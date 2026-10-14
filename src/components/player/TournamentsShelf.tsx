import { Fragment, useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import ScrollShelf from '@/components/player/ScrollShelf';
import { text } from '@/components/player/typeScale';
import { useTranslation } from '@/context/I18nContext';
import raceArt from '@/assets/lobby/casino/tournament-race.webp';
import trophyArt from '@/assets/lobby/casino/tournament-trophy.webp';

/**
 * Illustrative tournaments row.
 *
 * There is no tournaments API yet, so these are the design's sample races —
 * names, pools and seats are placeholders, not real events — and "View
 * Detail" opens the tournaments page. The countdowns tick from the design's
 * figures so the row looks alive; they end nothing.
 */
interface Tournament {
  id: string;
  /** The studio the race runs on; the name is built around it. */
  provider: string;
  prizePool: string;
  seats: string;
  /** Seconds left when the page loads — the design shows 05d 12h 50m 24s. */
  endsIn: number;
  art: StaticImageData;
}

const SAMPLE: Tournament[] = [
  {
    id: 't1',
    provider: 'Endorphina',
    prizePool: '$40 000',
    seats: '15/50',
    endsIn: 478_224,
    art: raceArt,
  },
  {
    id: 't2',
    provider: 'Endorphina',
    prizePool: '$40 000',
    seats: '15/50',
    endsIn: 478_224,
    art: trophyArt,
  },
  {
    id: 't3',
    provider: 'Endorphina',
    prizePool: '$40 000',
    seats: '15/50',
    endsIn: 478_224,
    art: raceArt,
  },
  {
    id: 't4',
    provider: 'Endorphina',
    prizePool: '$40 000',
    seats: '15/50',
    endsIn: 478_224,
    art: raceArt,
  },
];

/** Cards per row: one on a phone, two on a tablet, three and a half on desktop. */
const TRACK =
  'rl-shelf rl-track flex [--cols:1] [--gap:calc(var(--u)*11)] md:[--cols:2] lg:[--cols:3.5] lg:[--gap:calc(var(--u)*26)]';

/**
 * Seconds left, ticking down once a second from mount — the same on the
 * server and the first paint, which a countdown to a timestamp (see
 * hooks/useCountdown, for when a tournaments API supplies end times) is not.
 */
const useSecondsLeft = (seconds: number): number => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      setLeft(Math.max(0, seconds - Math.floor((Date.now() - started) / 1000)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return left;
};

/** Day : Hr : Min : Sec on the design's glass strip, its end cells rounded. */
const Countdown: FC<{ seconds: number }> = ({ seconds }) => {
  const { t } = useTranslation();
  const left = useSecondsLeft(seconds);
  const parts = [
    { value: Math.floor(left / 86_400), label: t('tournament.day') },
    { value: Math.floor((left % 86_400) / 3600), label: t('tournament.hr') },
    { value: Math.floor((left % 3600) / 60), label: t('tournament.min') },
    { value: left % 60, label: t('tournament.sec') },
  ];

  return (
    <div
      className="rl-liquid flex h-[calc(var(--u)*70)] items-center rounded-[calc(var(--u)*22)] px-[calc(var(--u)*5)]"
      role="timer"
      aria-label={parts.map((p) => `${p.value} ${p.label}`).join(' ')}
    >
      {parts.map((part, i) => (
        <Fragment key={part.label}>
          {i > 0 && (
            <span
              className={`${text(28)} w-[calc(var(--u)*11)] flex-shrink-0 text-center font-light leading-[calc(var(--u)*36)] text-[#f0f1f5]`}
              aria-hidden="true"
            >
              :
            </span>
          )}
          <span
            className={`flex h-[calc(var(--u)*60)] min-w-0 flex-1 flex-col items-center justify-center bg-white/[0.07] ${
              i === 0 ? 'rounded-l-[calc(var(--u)*22)]' : ''
            } ${i === parts.length - 1 ? 'rounded-r-[calc(var(--u)*22)]' : ''}`}
            aria-hidden="true"
          >
            <span
              className={`${text(28)} font-medium leading-[calc(var(--u)*36)] tabular-nums text-[#f0f1f5]`}
            >
              {String(part.value).padStart(2, '0')}
            </span>
            <span
              className={`${text(12)} -mt-[calc(var(--u)*4)] font-light leading-[calc(var(--u)*20)] text-[#9da2b4]`}
            >
              {part.label}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
};

/** The design's 424×495 tournament card. */
const TournamentCard: FC<{ tournament: Tournament }> = ({ tournament }) => {
  const { t } = useTranslation();

  return (
    <article className="rl-liquid relative flex h-[calc(var(--u)*495)] flex-col overflow-hidden rounded-[calc(var(--u)*34)]">
      <div className="relative h-[calc(var(--u)*222)] flex-shrink-0 overflow-hidden rounded-t-[calc(var(--u)*34)]">
        <Image
          src={tournament.art}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 424px"
          className="object-cover object-left lg:object-center"
        />
        <span
          className={`${text(14)} absolute left-[calc(var(--u)*20)] top-[calc(var(--u)*20)] inline-flex h-[calc(var(--u)*31)] items-center rounded-full bg-white/[0.07] px-[calc(var(--u)*12)] leading-[calc(var(--u)*20)] text-[#03b739] shadow-[0_0_17px_rgba(3,183,57,0.2)] backdrop-blur-md`}
        >
          {t('tournament.active')}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-[calc(var(--u)*20)] pb-[calc(var(--u)*15)] pt-[calc(var(--u)*14)]">
        <h3
          className={`${text(24)} truncate font-semibold leading-[calc(var(--u)*32)] text-[#f0f1f5]`}
        >
          {t('lobby.tournaments.wagerRace', { provider: tournament.provider })}
        </h3>

        <div className="mt-[calc(var(--u)*14)] flex items-start justify-between gap-[calc(var(--u)*12)]">
          <span className="flex flex-col">
            <span className={`${text(14)} leading-[calc(var(--u)*20)] text-[#9da2b4]`}>
              {t('tournament.prizePool')}
            </span>
            <span className={`${text(24)} font-bold leading-[calc(var(--u)*32)] text-[#f0f1f5]`}>
              {tournament.prizePool}
            </span>
          </span>
          <span
            className={`${text(16)} inline-flex items-center gap-[calc(var(--u)*4)] font-medium leading-[calc(var(--u)*24)] text-[#f0f1f5]`}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)]"
              aria-hidden="true"
            >
              <circle cx="10" cy="6" r="4" />
              <path d="M2.5 17v-1.5a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5V17z" />
            </svg>
            {tournament.seats}
          </span>
        </div>

        <div className="mt-[calc(var(--u)*14)]">
          <Countdown seconds={tournament.endsIn} />
        </div>

        <Link
          href="/tournaments"
          className={`${text(18)} mt-auto flex h-[calc(var(--u)*48)] items-center justify-center rounded-full bg-[#07080a] font-medium leading-[calc(var(--u)*28)] text-[#f0f1f5] transition-colors hover:bg-white/15 lg:bg-white/10`}
        >
          {t('tournament.viewDetail')}
        </Link>
      </div>
    </article>
  );
};

/** The casino page's Tournaments shelf. */
const TournamentsShelf: FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollShelf id="tournaments" title={t('nav.tournaments')} href="/tournaments" track={TRACK}>
      {SAMPLE.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </ScrollShelf>
  );
};

export default TournamentsShelf;
