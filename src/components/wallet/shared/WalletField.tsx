import type { FC, ReactNode } from 'react';

/**
 * The wallet modal's control: the design's 56px "Liquid Glass – Clear/Light"
 * pill — a 5% white wash with a 20% white hairline, 34 of radius — with 24px
 * insets. Shared by the inputs and the selects so every row lines up.
 */
export const WALLET_PILL =
  'flex h-12 items-center gap-2.5 rounded-[34px] border border-white/20 bg-white/5 px-5 sm:h-14 sm:px-6';

/** What is typed or picked inside the pill: 18px bold, the design's ink. */
export const WALLET_VALUE =
  'text-[16px] font-bold leading-6 text-[#f0f1f5] sm:text-[18px] sm:leading-6';

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
