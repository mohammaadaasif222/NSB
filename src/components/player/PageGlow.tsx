import type { FC } from 'react';

type Tone = 'gold' | 'white' | 'grey';

const FILL: Record<Tone, string> = {
  gold: 'radial-gradient(closest-side, #f9d028, rgba(249,208,40,0))',
  white: 'radial-gradient(closest-side, #ffffff, rgba(255,255,255,0))',
  grey: 'radial-gradient(closest-side, #d9d9d9, #07080a)',
};

interface Spot {
  x: number;
  top?: number;
  bottom?: number;
  opacity: number;
}

const CORNERS: Spot[] = [
  { x: 1386, top: -265, opacity: 0.5 },
  { x: -73, top: 385, opacity: 0.5 },
];

const SPOTS: Record<Tone, Spot[]> = {
  gold: [...CORNERS, { x: 659, bottom: -251, opacity: 0.3 }],
  white: CORNERS,
  grey: CORNERS,
};

/**
 * The design's ambient light: 837px radial ellipses under a 682px layer blur,
 * placed in design pixels so they keep their spot at any desktop width.
 * Gold on Recents, white on Favourites, grey on the Casino and Sportsbook.
 */
const PageGlow: FC<{ tone: Tone }> = ({ tone }) => (
  <div className="absolute inset-0 hidden lg:block">
    {SPOTS[tone].map(({ x, top, bottom, opacity }) => (
      <div
        key={`${x}:${top ?? bottom}`}
        className="absolute size-[calc(var(--u)*837)] rounded-full blur-[calc(var(--u)*341)]"
        style={{
          left: `calc(var(--u) * ${x})`,
          ...(bottom === undefined
            ? { top: `calc(var(--u) * ${top})` }
            : { bottom: `calc(var(--u) * ${bottom})` }),
          opacity,
          background: FILL[tone],
        }}
      />
    ))}
  </div>
);

export default PageGlow;
