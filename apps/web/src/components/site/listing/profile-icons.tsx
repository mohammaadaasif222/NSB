/** Icons of the Meet your artist section (Makeup-Vendor-Page.html), cycling by position. */

const HIGHLIGHT_PATHS = [
  "M3 8l4 3 5-6 5 6 4-3-2 11H5z",
  "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16v4M17 18h4",
  "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
];
const TRAINING_PATHS = [
  "M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5",
  "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14 7 21l5-3 5 3-1.5-7",
  "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7M8 11h5",
];

function Glyph({ d, size, stroke }: { d: string; size: number; stroke: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** White on the blue tile of a highlight. */
export const HighlightIcon = ({ index, stroke = "#fff" }: { index: number; stroke?: string }) => (
  <Glyph d={HIGHLIGHT_PATHS[index % HIGHLIGHT_PATHS.length]!} size={19} stroke={stroke} />
);

/** Red, in the circle of a training step. */
export const TrainingIcon = ({ index }: { index: number }) => <Glyph d={TRAINING_PATHS[index % TRAINING_PATHS.length]!} size={17} stroke="#E3171B" />;
