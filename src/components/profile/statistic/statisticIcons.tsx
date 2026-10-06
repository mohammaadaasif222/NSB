import type { FC } from 'react';

/**
 * The Statistic section's own marks, traced from the Figma "Statistic" node.
 *
 * The shared set in `icons.tsx` has a calendar and a close cross, but both are
 * cut for the 16-24px line weight the lobby uses. These are drawn at the
 * design's sizes — a 14.33px calendar inside a 16px box, a 10.73px cross
 * inside 12 — where rescaling the shared ones would thicken their strokes
 * past what the pill can carry.
 *
 * Each carries a `--u` class alongside its width/height attributes. The class
 * wins, which is what lets a glyph drawn at a fixed size come down with the
 * row around it — see the note at the head of `SectionShell`.
 */
const U = (n: number): string => `calc(var(--u)*${n})`;

/** Request Statistics: a message bubble with the breakdown inside it. */
export const RequestStatsIcon: FC = () => (
  <svg
    style={{ width: U(42), height: U(42) }}
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeMiterlimit="10"
    aria-hidden="true"
  >
    <path d="M10 26.25H32M18.5833 26.25V14.25H13.75V26.25M23.4167 26.25V16.75H18.5834M28.25 26.25V19.25H23.4167M30.75 32.5H24.75L21 36.8375L17.25 32.5H11.25C8.48856 32.5 6.25 30.2614 6.25 27.5V13C6.25 10.2386 8.48856 8 11.25 8H30.75C33.5114 8 35.75 10.2386 35.75 13V27.5C35.75 30.2614 33.5114 32.5 30.75 32.5Z" />
  </svg>
);

/**
 * The mark closing that row.
 *
 * Solid rather than stroked, and squatter than a line chevron — the design
 * draws it as a filled wedge. Carried pre-rotated: Figma composes it from an
 * up-chevron turned a quarter clockwise, which is the same shape typed out
 * once here.
 */
export const RequestChevronIcon: FC = () => (
  <svg
    style={{ width: U(22), height: U(22) }}
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8.7992 17L15 11L8.7992 5L7 6.74092L11.4016 11L7 15.2591L8.7992 17Z" />
  </svg>
);

/** The date pill's calendar, at the 14.33px the design draws it. */
export const RangeCalendarIcon: FC = () => (
  <svg
    style={{ width: U(14.3333), height: U(14.3333) }}
    width="14.3333"
    height="14.3333"
    viewBox="0 0 14.3333 14.3333"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11.1667 1.83333H3.16667C1.69391 1.83333 0.5 3.02724 0.5 4.5V11.1667C0.5 12.6394 1.69391 13.8333 3.16667 13.8333H11.1667C12.6394 13.8333 13.8333 12.6394 13.8333 11.1667V4.5C13.8333 3.02724 12.6394 1.83333 11.1667 1.83333Z" />
    <path d="M4.5 0.5V3.16667M9.83333 0.5V3.16667M0.5 5.83333H13.8333" />
  </svg>
);

/** The cross that would clear that range. */
export const RangeCloseIcon: FC = () => (
  <svg
    style={{ width: U(10.7281), height: U(10.7279) }}
    width="10.7281"
    height="10.7279"
    viewBox="0 0 10.7281 10.7279"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M10.2281 10.2279L0.500154 0.5" />
    <path d="M0.5 10.2279L10.2279 0.5" />
  </svg>
);
