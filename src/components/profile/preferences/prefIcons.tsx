import type { FC } from 'react';

/**
 * The two marks the Preferences rows carry, traced from the Figma node.
 *
 * Both are 16 in the design. The class overrides the SVG's own width/height
 * attributes, which is what lets a fixed-size glyph come down with the row.
 */
const GLYPH = 'h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] shrink-0';

/**
 * The coin beside the selected currency — a slate disc with the symbol cut out
 * of it, over a faint green halo.
 *
 * Literal colours rather than `currentColor`: it is a three-tone mark, and the
 * row's ink is only one of those tones.
 */
export const CurrencyCoinIcon: FC = () => (
  <svg className={GLYPH} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      opacity="0.1"
      d="M0.40678 8C0.40678 3.80638 3.80638 0.40678 8 0.40678C12.1936 0.40678 15.5932 3.80638 15.5932 8C15.5932 12.1936 12.1936 15.5932 8 15.5932C3.80638 15.5932 0.40678 12.1936 0.40678 8Z"
      fill="#8ADB44"
    />
    <path
      d="M8 0.271186C12.2685 0.271186 15.7288 3.73149 15.7288 8C15.7288 12.2685 12.2685 15.7288 8 15.7288C3.73149 15.7288 0.271186 12.2685 0.271186 8C0.271186 3.73149 3.73149 0.271186 8 0.271186Z"
      fill="#6A7287"
    />
    <path
      d="M7.97641 11.7754C7.8477 11.7754 7.7619 11.6939 7.7619 11.5523V11.0289C6.65931 10.9774 5.94712 10.4669 5.7369 9.84054C5.70256 9.74183 5.68542 9.65174 5.68542 9.57022C5.68542 9.26134 5.89565 9.05112 6.24743 9.05112C6.51341 9.05112 6.69364 9.18839 6.81378 9.43723C6.95105 9.77188 7.22132 10.0164 7.7619 10.0636V8.50197L7.44439 8.42902C6.32038 8.17589 5.70685 7.67393 5.70685 6.74723C5.70685 5.7133 6.56494 5.04401 7.7619 4.98395V4.44767C7.7619 4.30609 7.8477 4.22458 7.97641 4.22458C8.10511 4.22458 8.19092 4.30609 8.19092 4.44767V4.98395C9.21199 5.05259 9.91989 5.55455 10.1258 6.21527C10.1516 6.30107 10.1687 6.38687 10.1687 6.47696C10.1687 6.76014 9.95422 6.9446 9.62815 6.9446C9.36217 6.9446 9.17771 6.82018 9.04038 6.57134C8.87306 6.21955 8.60279 6.00933 8.19092 5.95357V7.4637L8.52556 7.53665C9.7011 7.80263 10.3146 8.27455 10.3146 9.21416C10.3146 10.2996 9.4265 10.956 8.19092 11.0289V11.5523C8.19092 11.6939 8.10511 11.7754 7.97641 11.7754ZM6.90815 6.63572C6.90815 6.98321 7.16127 7.21058 7.7619 7.36504V5.94923C7.19989 6.00076 6.90815 6.28816 6.90815 6.63572ZM9.11761 9.34715C9.11761 8.96532 8.87734 8.77223 8.19092 8.60062V10.0636C8.80873 10.0164 9.11761 9.74183 9.11761 9.34715Z"
      fill="#F0F1F5"
    />
  </svg>
);

/**
 * The mark closing a value row.
 *
 * Heavier than the shared chevron — the design draws it on a 2px stroke, where
 * `ChevronRightIcon` is cut for the lobby's lighter line. Carried pre-rotated:
 * Figma composes it from its chevron-down turned a quarter anticlockwise.
 */
export const PrefChevronIcon: FC = () => (
  <svg
    className={GLYPH}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 13.3333L11.3333 8L6 2.66667" />
  </svg>
);
