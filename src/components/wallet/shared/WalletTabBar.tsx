import { useEffect, useRef } from 'react';
/*
 * The chips wear the wallet dialog's own glass: the pane nearly clear (2%
 * white) with the same depth inside it — shaded top and start, lit bottom and
 * end — and its rim, a half-pixel whitish hairline on the diagonal, clear
 * round the top-end and bottom-start corners (`rl-diag-rim`, its radius the
 * pill's 24). The chosen chip adds a gold wash and the design's 17.6px gold
 * glow.
 */
const CHIP_GLASS =
  'rl-diag-rim relative [--rim-radius:24px] [--rim-clear:48px] [--rim-fade:96px] border border-transparent backdrop-blur-md transition-colors';
const CHIP_IDLE = `${CHIP_GLASS} bg-white/[0.02] text-[#9da2b4] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.04)] hover:bg-white/[0.08] hover:text-[#f0f1f5]`;
const CHIP_PICKED = `${CHIP_GLASS} bg-[#ffe779]/[0.16] font-rubik font-medium text-[#ffe779] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.04),0_0_17.6px_rgba(255,231,121,0.2)]`;

/**
 * The wallet's Crypto / Local currency track in the same glass as the chips:
 * the dialog's near-clear pane and depth in place of the shared track's, and
 * the diagonal rim at the 56px track's radius.
 */
export const WALLET_TRACK =
  'rl-diag-rim [--rim-radius:28px] [--rim-clear:56px] [--rim-fade:112px] lg:[--rim-radius:calc(var(--u)*28)] !bg-white/[0.02] [--tw-inset-shadow:inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.04)]!';

export interface WalletTabItem<K extends string> {
  id: K;
  label: string;
}

interface Props<K extends string> {
  tabs: readonly WalletTabItem<K>[];
  active: K;
  onChange: (id: K) => void;
  /** Names the tab list for assistive tech. */
  label: string;
}

/**
 * The wallet modal's sections as the design's chips: a glass pill, 48px with 16px type, gold and glowing when on. On desktop they share
 * the modal's width out from their labels (about the design's 20px insets in
 * any language); on a phone they keep their size and scroll, bringing the
 * chosen one into view.
 */
const WalletTabBar = <K extends string>({ tabs, active, onChange, label }: Props<K>) => {
  const rowRef = useRef<HTMLDivElement>(null);

  // Scrolls the row alone — scrollIntoView would also move the dialog.
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!row || !chip) return;
    const inset = 16;
    const start = chip.offsetLeft - inset;
    const end = chip.offsetLeft + chip.offsetWidth + inset - row.clientWidth;
    if (start < row.scrollLeft) row.scrollLeft = start;
    else if (end > row.scrollLeft) row.scrollLeft = end;
  }, [active]);

  return (
    <div
      ref={rowRef}
      role="tablist"
      aria-label={label}
      className="no-scrollbar relative -mx-4 flex gap-1.5 overflow-x-auto px-4 py-3 -my-3 sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-5 text-[16px] leading-6 sm:min-w-0 sm:flex-auto sm:px-3 ${
              on ? CHIP_PICKED : CHIP_IDLE
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default WalletTabBar;
