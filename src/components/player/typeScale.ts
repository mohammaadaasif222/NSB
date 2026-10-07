/**
 * Font sizes in design pixels: the design's size on desktop, scaled with the
 * page (`--u`, see PlayerLayout), never below 11px.
 *
 * Written out in full on purpose. Tailwind generates only class names it
 * finds verbatim in the source, so a helper that assembles them at runtime
 * (`text-[…${n}px…]`) silently loses every size no other file spells out.
 */
export const TEXT = {
  12: 'text-[length:max(min(11px,12px),calc(var(--u)*12))]',
  13: 'text-[length:max(min(11px,13px),calc(var(--u)*13))]',
  14: 'text-[length:max(min(11px,14px),calc(var(--u)*14))]',
  16: 'text-[length:max(min(11px,16px),calc(var(--u)*16))]',
  18: 'text-[length:max(min(11px,18px),calc(var(--u)*18))]',
  24: 'text-[length:max(min(11px,24px),calc(var(--u)*24))]',
  28: 'text-[length:max(min(11px,28px),calc(var(--u)*28))]',
  32: 'text-[length:max(min(11px,32px),calc(var(--u)*32))]',
} as const;

export type TextSize = keyof typeof TEXT;

/** The class for a design font size. */
export const text = (size: TextSize): string => TEXT[size];
