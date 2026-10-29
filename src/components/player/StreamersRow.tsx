import { useState, type FC, type ReactNode } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { toast } from 'react-toastify';
import pauseIcon from '@/assets/lobby/stream-pause.svg';
import linkIcon from '@/assets/lobby/stream-link.svg';
import shareIcon from '@/assets/lobby/stream-share.svg';
import { useTranslation } from '@/context/I18nContext';
import type { LiveStream } from '@/services/liveStreams';

const watchUrl = (id: string): string => `https://www.youtube.com/watch?v=${id}`;

/**
 * A round control on the card, 48px at the design's 754px card. The first one
 * wears the design's white ring.
 */
const Control: FC<{
  label: string;
  /** The design's glyph, or `children` for one drawn here. */
  icon?: StaticImageData;
  children?: ReactNode;
  onClick: () => void;
  ringed?: boolean;
}> = ({ label, icon, children, onClick, ringed }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex h-[6.37cqw] w-[6.37cqw] items-center justify-center rounded-full backdrop-blur-md transition-[filter] hover:brightness-125 ${
      ringed
        ? 'bg-white/[0.07] ring-1 ring-inset ring-[#f0f1f5]'
        : 'rl-glass-btn [--rl-btn-base:rgba(0,0,0,0.45)]'
    }`}
  >
    {icon ? <img src={icon.src} alt="" className="h-[3.18cqw] w-[3.18cqw]" /> : children}
  </button>
);

/** A play triangle for the idle card's first control. */
const PlayGlyph: FC = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="ml-[0.3cqw] h-[3.18cqw] w-[3.18cqw] fill-[#f0f1f5]"
  >
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
);

/** One stream: the thumbnail until played, then the YouTube player in its place. */
const StreamCard: FC<{ stream: LiveStream }> = ({ stream }) => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${stream.video_id}/maxresdefault.jpg`);

  const open = (): void => {
    window.open(watchUrl(stream.video_id), '_blank', 'noopener,noreferrer');
  };

  const share = async (): Promise<void> => {
    const url = watchUrl(stream.video_id);
    try {
      if (navigator.share) {
        await navigator.share({ title: stream.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t('lobby.streams.copied'));
    } catch {
      /* The player dismissed the share sheet — nothing to report. */
    }
  };

  return (
    <div className="group @container relative aspect-[754/579] w-full flex-shrink-0 snap-start overflow-hidden rounded-[calc(var(--u)*17)] bg-black lg:w-[calc(50%-20px)] lg:rounded-[calc(var(--u)*34)]">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${stream.video_id}?autoplay=1&playsinline=1&rel=0`}
          title={stream.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${t('lobby.streams.play')}: ${stream.title}`}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            // Not every video has a full-size still; YouTube always has this one.
            onError={() => setThumb(`https://i.ytimg.com/vi/${stream.video_id}/hqdefault.jpg`)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* Grounds the caption over whatever the stream shows at the foot. */}
          <span
            className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/80 to-transparent"
            aria-hidden="true"
          />
        </button>
      )}

      {/* The design's controls: play / pause, open on YouTube, share. While
          the video plays, YouTube's own controls take the foot of the card,
          so only these stay. */}
      <span className="absolute right-[2.92cqw] top-[2.92cqw] flex flex-col gap-[1.59cqw]">
        <Control
          label={playing ? t('lobby.streams.paused') : t('lobby.streams.play')}
          icon={playing ? pauseIcon : undefined}
          onClick={() => setPlaying((v) => !v)}
          ringed
        >
          <PlayGlyph />
        </Control>
        <Control label={t('lobby.streams.open')} icon={linkIcon} onClick={open} />
        <Control label={t('lobby.streams.share')} icon={shareIcon} onClick={() => void share()} />
      </span>

      {!playing && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[14.6cqw] items-center gap-[1.9cqw] px-[2.92cqw]">
          {/* The channel's initial in the design's avatar disc. */}
          <span
            aria-hidden="true"
            className="flex h-[6.9cqw] w-[6.9cqw] flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-[max(14px,2.9cqw)] font-semibold text-[#f0f1f5] backdrop-blur-md"
          >
            {stream.channel.slice(0, 1)}
          </span>
          <span className="min-w-0 text-start">
            <span className="block truncate text-[max(14px,2.65cqw)] font-medium leading-[1.4] text-[#f0f1f5] lg:font-semibold lg:tracking-[-0.02em]">
              {stream.channel}
            </span>
            <span className="block truncate text-[max(12px,2.39cqw)] leading-[1.55] text-[#f0f1f5]">
              {stream.title}
            </span>
          </span>
        </span>
      )}
    </div>
  );
};

/**
 * Two cards share the row from lg up, as the design lays them out; a phone
 * shows one at a time. Each card is laid out in `cqw` of the design's 754px
 * card — the phone design is the same card at half size — with floors on the
 * caption so it stays readable there.
 */
const StreamersRow: FC<{ streams: LiveStream[] }> = ({ streams }) => {
  const { t } = useTranslation();

  if (streams.length === 0) return null;

  return (
    <section className="space-y-[calc(var(--u)*14)] lg:space-y-[calc(var(--u)*45)]">
      <h2 className="text-center text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-[#f2f5f9]">
        {t('dash.liveStreamers')}
      </h2>

      <div className="rl-shelf flex snap-x snap-mandatory gap-[calc(var(--u)*12)] lg:gap-[calc(var(--u)*40)]">
        {streams.map((s) => (
          <StreamCard key={`${s.id}:${s.video_id}`} stream={s} />
        ))}
      </div>
    </section>
  );
};

export default StreamersRow;
