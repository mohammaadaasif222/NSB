import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import chevronLeft from '@/assets/lobby/chevron-left.svg';
import chevronRight from '@/assets/lobby/chevron-right.svg';

/**
 * The round arrow at the end of a shelf heading: the design's 40px dark glass
 * disc on phones, its 48px clear glass disc on desktop.
 */
export const ARROW_CLASS =
  'flex h-[calc(var(--u)*40)] w-[calc(var(--u)*40)] items-center justify-center rl-glass-btn rl-glass-rim rounded-full lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] lg:shadow-[0_8px_40px_rgba(0,0,0,0.2)]';

export const ArrowGlyph: FC<{ dir: 'prev' | 'next' }> = ({ dir }) => (
  <img
    src={(dir === 'prev' ? chevronLeft : chevronRight).src}
    alt=""
    className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)] lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
  />
);

interface HeadingProps {
  title: string;
  /** Omit to render the heading without a "View all" link. */
  href?: string;
  /** The arrow pair, or whatever stands in for it. */
  controls?: ReactNode;
  className?: string;
  /** Classes for the end cluster ("View All" and the controls) — to hide it at a breakpoint. */
  endClassName?: string;
}

/**
 * The heading every shelf on the lobby shares: the title, "View All", and a
 * pair of round arrows at the end.
 *
 * Its own module because the game shelves, the slider they are built on and
 * the rows that are not catalogue games (providers, sports, live games) all
 * use it and must line up with each other to the pixel.
 */
export const ShelfHeading: FC<HeadingProps> = ({
  title,
  href,
  controls,
  className = '',
  endClassName = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between gap-[calc(var(--u)*12)] ${className}`}>
      <h2 className="min-w-0 truncate text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)]">
        {title}
      </h2>

      <div
        className={`flex flex-shrink-0 items-center gap-[calc(var(--u)*15)] lg:gap-[calc(var(--u)*27)] ${endClassName}`}
      >
        {href && (
          <Link
            href={href}
            className="whitespace-nowrap text-[length:max(min(11px,14px),calc(var(--u)*14))] font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5] transition-colors hover:text-[#f9d028] lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:font-normal lg:leading-[calc(var(--u)*28)]"
          >
            {t('dash.viewAll')}
          </Link>
        )}
        {controls}
      </div>
    </div>
  );
};

/**
 * The shelf's track: a scroller that shows a whole number of tiles — three on
 * a phone, seven at the design's 1548px — with the design's gutter between
 * them. Each child is sized from `--cols` and `--gap`, so a tile is exactly
 * 198px wide where the design measures it and scales with the column below.
 */
export const SHELF_TRACK =
  'rl-shelf rl-track flex [--cols:3] [--gap:calc(var(--u)*11)] sm:[--cols:4] md:[--cols:5] lg:[--cols:7] lg:[--gap:calc(var(--u)*27)]';
