import type { FC, ReactNode } from 'react';

/**
 * The wallet modal's control: the design's 56px "Liquid Glass – Clear/Light"
 * pill (on a phone too) — a 5% white wash with a 20% white hairline, 34 of radius — with 24px
 * insets. Shared by the inputs and the selects so every row lines up.
 */
export const WALLET_PILL =
  'flex h-14 items-center gap-2.5 rounded-[34px] border border-white/20 bg-white/5 px-6';

/** What is typed or picked inside the pill: 18px bold, the design's ink. */
export const WALLET_VALUE =
  'text-[16px] font-bold leading-6 text-[#f0f1f5] sm:text-[18px] sm:leading-6';

/** A quiet line in the form's glass, where a pill would otherwise sit — a
 * loading or empty state. */
export const WALLET_NOTE =
  'rounded-[24px] border border-white/10 bg-white/5 px-5 py-3.5 text-[14px] leading-5 text-[#9da2b4]';

/** A secondary action in the pill's glass — Back, Change. */
export const WALLET_GHOST_BUTTON =
  'flex h-14 w-full items-center justify-center rounded-[43px] border border-white/20 bg-white/5 text-[18px] font-medium leading-7 text-[#f0f1f5] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50';

/** A form error under its field. */
export const WALLET_ERROR = 'text-[13px] leading-5 text-[#e33827]';

/** A bare input that fills the pill — the pill draws the field. */
export const WALLET_INPUT = `h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#f0f1f5] ${WALLET_VALUE}`;

interface Props {
  /** The control's id, so the label names it. */
  htmlFor?: string;
  label: string;
  /** Right-aligned beside the label (a limit, a conversion). */
  hint?: ReactNode;
  children: ReactNode;
}

/**
 * A labelled row of the wallet modal: the 14px label (and an optional hint
 * across from it) 7px above the control.
 */
const WalletField: FC<Props> = ({ htmlFor, label, hint, children }) => (
  <div>
    <div className="mb-[7px] flex items-center justify-between gap-3 text-[14px] font-medium leading-5">
      <label htmlFor={htmlFor} className="text-[#f0f1f5]">
        {label}
      </label>
      {hint && <span className="text-[#9da2b4]">{hint}</span>}
    </div>
    {children}
  </div>
);

export default WalletField;
