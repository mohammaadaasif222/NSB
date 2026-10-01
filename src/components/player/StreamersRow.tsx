import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import liveOne from '@/assets/live_1.png';
import liveTwo from '@/assets/live_2.png';
import { useTranslation } from '@/context/I18nContext';
import { categoryHref } from '@/constants/games';
import { LinkIcon, PauseIcon, ShareIcon } from '@/components/icons';

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
}[] = [
  {
    name: 'John Mathew',
    game: 'Wild Falls',
    blurb: 'Free spins on Wild Falls at $50 a spin.',
    still: liveOne,
  },
  {
    name: 'Tony Stark',
    game: 'Return of the Dead',
    blurb: 'Auto-spinning Return of the Dead at $25 a spin.',
    still: liveTwo,
  },
];

/** A small round control on the still. Inert: there is no player behind it. */
const Control: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <span
    role="img"
    aria-label={label}
    title={label}
    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 backdrop-blur-sm"
  >
    {children}
  </span>
);

/**
 * Two cards share the row from `sm` up, which is how the design lays them out;
 * on a phone each takes most of the width and the next one peeks in from the
 * edge, so the row still reads as scrollable. The stills are 754×579, and the
 * cards keep that ratio so nothing is cropped out of the frame.
 */
const StreamersRow: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <h2 className="text-center text-[17px] font-semibold text-white sm:text-[19px]">
        {t('dash.liveStreamers')}
      </h2>

      <div className="rl-shelf -mx-1 gap-3 px-1 pb-1">
        {STREAMS.map((s) => (
          <Link
            key={s.name}
            href={categoryHref('featured')}
            title={`${s.name} — ${s.game}`}
            className="group relative aspect-[754/579] w-[86%] flex-shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] sm:w-[calc(50%-6px)]"
          >
            <Image
              src={s.still}
              alt={`${s.name} streaming ${s.game}`}
              fill
              placeholder="blur"
              sizes="(max-width: 640px) 86vw, (max-width: 1600px) 42vw, 680px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Grounds the caption over whatever the stream shows at the foot. */}
            <span
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent"
              aria-hidden="true"
            />

            <span className="absolute right-3 top-3 flex flex-col items-center gap-2">
              <Control label="Paused">
                <PauseIcon size={12} />
              </Control>
              <Control label="Open stream">
                <LinkIcon size={12} />
              </Control>
              <Control label="Share">
                <ShareIcon size={12} />
              </Control>
            </span>

            <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/15 text-[12px] font-semibold text-white backdrop-blur-sm"
                aria-hidden="true"
              >
                {s.name
                  .split(' ')
                  .map((part) => part.charAt(0))
                  .join('')}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-white">
                  {s.name}
                </span>
                <span className="block truncate text-[12px] text-white/60">{s.blurb}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default StreamersRow;
