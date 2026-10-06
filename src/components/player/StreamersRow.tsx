import type { FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import liveOne from '@/assets/live_1.png';
import liveTwo from '@/assets/live_2.png';
import avatarJohn from '@/assets/lobby/avatar-john.webp';
import avatarTony from '@/assets/lobby/avatar-tony.webp';
import pauseIcon from '@/assets/lobby/stream-pause.svg';
import linkIcon from '@/assets/lobby/stream-link.svg';
import shareIcon from '@/assets/lobby/stream-share.svg';
import { useTranslation } from '@/context/I18nContext';
import { categoryHref } from '@/constants/games';

/**
 * Illustrative "loved by live streamers" row.
 *
 * Each card is a still from a stream, supplied with the design, rather than a
 * live embed — there is no streaming integration behind it yet, so the
 * player controls on the card are drawn but inert. The names are the design's
 * placeholders; swap them together with the stills when real partner content
 * arrives.
 */
const STREAMS: {
  name: string;
  game: string;
  blurb: string;
  still: StaticImageData;
  avatar: StaticImageData;
}[] = [
  {
    name: 'John Mathew',
    game: 'Wild Falls',
    blurb: 'Free spins on Wild Falls at $50 a spin.',
    still: liveOne,
    avatar: avatarJohn,
  },
  {
    name: 'Tony Stark',
    game: 'Return of the Dead',
    blurb: 'Auto-spinning Return of the Dead at $25 a spin.',
    still: liveTwo,
    avatar: avatarTony,
  },
];

/**
 * A round control on the still, 48px at the design's 754px card. Inert: there
 * is no player behind it. The first one wears the design's white ring.
 */
const Control: FC<{ label: string; icon: StaticImageData; ringed?: boolean }> = ({
  label,
  icon,
  ringed,
}) => (
  <span
    role="img"
    aria-label={label}
    title={label}
    className={`flex h-[6.37cqw] w-[6.37cqw] items-center justify-center rounded-full backdrop-blur-md ${
      ringed ? 'bg-white/[0.07] ring-1 ring-inset ring-[#f0f1f5]' : 'bg-black/45'
    }`}
  >
    <img src={icon.src} alt="" className="h-[3.18cqw] w-[3.18cqw]" />
  </span>
);

/**
 * Two cards share the row from lg up, as the design lays them out; a phone
 * shows one at a time. Each card is laid out in `cqw` of the design's 754px
 * card — the phone design is the same card at half size — with floors on the
 * caption so it stays readable there.
 */
const StreamersRow: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-[calc(var(--u)*14)] lg:space-y-[calc(var(--u)*45)]">
      <h2 className="text-center text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-[#f2f5f9]">
        {t('dash.liveStreamers')}
      </h2>

      <div className="rl-shelf flex snap-x snap-mandatory gap-[calc(var(--u)*12)] lg:gap-[calc(var(--u)*40)]">
        {STREAMS.map((s) => (
          <Link
            key={s.name}
            href={categoryHref('featured')}
            title={`${s.name} — ${s.game}`}
            className="group @container relative aspect-[754/579] w-full flex-shrink-0 snap-start overflow-hidden rounded-[calc(var(--u)*17)] lg:w-[calc(50%-20px)] lg:rounded-[calc(var(--u)*34)]"
          >
            <Image
              src={s.still}
              alt={`${s.name} streaming ${s.game}`}
              fill
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Grounds the caption over whatever the stream shows at the foot. */}
            <span
              className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/80 to-transparent"
              aria-hidden="true"
            />

            <span className="absolute right-[2.92cqw] top-[2.92cqw] flex flex-col gap-[1.59cqw]">
              <Control label="Paused" icon={pauseIcon} ringed />
              <Control label="Open stream" icon={linkIcon} />
              <Control label="Share" icon={shareIcon} />
            </span>

            <span className="absolute inset-x-0 bottom-0 flex h-[14.6cqw] items-center gap-[1.9cqw] px-[2.92cqw]">
              <Image
                src={s.avatar}
                alt=""
                className="h-[6.9cqw] w-[6.9cqw] flex-shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-[max(14px,2.65cqw)] font-medium leading-[1.4] text-[#f0f1f5] lg:font-semibold lg:tracking-[-0.02em]">
                  {s.name}
                </span>
                <span className="block truncate text-[max(12px,2.39cqw)] leading-[1.55] text-[#f0f1f5]">
                  {s.blurb}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default StreamersRow;
