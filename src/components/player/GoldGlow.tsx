import type { FC } from 'react';

/**
 * The player pages' ambient light (Recents, Favourites): three soft gold
 * pools — top right, left, and low centre — under everything, desktop only
 * as the design draws it. Placed in vw so they keep their spot at any
 * desktop width; strengths are the design's, measured off its render.
 */
const GoldGlow: FC = () => (
  <div
    className="absolute inset-x-0 top-0 hidden h-[120vw] lg:block"
    style={{
      background: [
        'radial-gradient(circle 40vw at 94vw 8vw, rgba(249,208,40,0.11), rgba(249,208,40,0.05) 45%, transparent 75%)',
        'radial-gradient(circle 47vw at 18vw 41.8vw, rgba(249,208,40,0.12), rgba(249,208,40,0.05) 45%, transparent 75%)',
        'radial-gradient(circle 47vw at 56vw 107.5vw, rgba(249,208,40,0.08), rgba(249,208,40,0.03) 45%, transparent 75%)',
      ].join(', '),
    }}
  />
);

export default GoldGlow;
