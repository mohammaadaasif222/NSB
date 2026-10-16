/**
 * The rewards page's look, in the app's own theme — there is no design for
 * this page, so it borrows the wallet and account pages' furniture: dark glass
 * panels with the shared rim, the lobby's clear-glass cards, gold for what can
 * be claimed, and the two inks (#f0f1f5 for figures, #9da2b4 for words about
 * them). One place, so the five pieces stay in step.
 */

/** A section of the page: the wallet's dark pane. */
export const PANEL = 'rl-panel rounded-[34px] p-5 [--panel-fill:rgba(0,0,0,0.2)] sm:p-7';

/** A panel's title. */
export const PANEL_TITLE = 'text-[20px] leading-7 font-medium text-[#f0f1f5]';

/** A line under a title, and any quiet copy. */
export const MUTED = 'text-[14px] leading-5 text-[#9da2b4]';

/** A small label over a figure. */
export const LABEL = 'text-[12px] leading-5 text-[#9da2b4]';

/**
 * A card inside the page — a reward, an explainer: clear glass that reads on
 * the near-black stage — a white sheen falling from the top-start corner, a
 * hairline rim lit along the top, and the page blurred through it.
 */
export const CARD =
  'relative rounded-[34px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.08)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl';

/** A figure in a small tile. */
export const TILE =
  'rounded-[24px] border border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl';

/** A round icon well, gold when the thing in it needs the player. */
export const ICON_WELL = (lit: boolean): string =>
  `rl-circle-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
    lit ? 'text-[#ffe779]' : 'text-[#f0f1f5]'
  }`;

/** A small pill — a rate, a status. */
export const PILL =
  'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[12px] leading-5 text-[#9da2b4] tabular-nums';

/** The gold progress fill, with the home hero's glow. */
export const PROGRESS_TRACK = 'rl-liquid h-3 overflow-hidden rounded-full';
export const PROGRESS_FILL =
  'h-full rounded-full bg-[#d1ba3e] shadow-[0_2px_15px_rgba(249,208,40,0.8)] transition-[width] duration-500';

/** A table's head row and body rows. */
export const TH = 'py-3 pr-3 text-[12px] leading-5 font-normal text-[#9da2b4]';
export const TR = 'border-b border-white/[0.06] last:border-0';
export const TD = 'py-3.5 pr-3 text-[14px] leading-5 text-[#f0f1f5] tabular-nums';

/** A secondary action — Login, a pager arrow. */
export const GHOST_BUTTON =
  'rl-btn-ghost inline-flex h-10 items-center justify-center gap-1 rounded-full px-5 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40';

/** The primary action — Claim, Register. */
export const GOLD_BUTTON =
  'rl-btn-gold inline-flex h-10 items-center justify-center rounded-full px-5 text-[14px] font-medium disabled:cursor-not-allowed';
