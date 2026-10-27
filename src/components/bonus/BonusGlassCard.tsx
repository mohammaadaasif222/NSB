import type { FC } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { TicketIcon } from '@/components/icons';

/**
 * What sits at the foot of the card.
 *
 * `gold` and `ghost` are buttons; `status` is the design's inert pill — the
 * countdown and "deposit to unlock" states, which say what the card is waiting
 * for rather than offering anything to press.
 */
export type BonusCardAction =
  | {
      kind: 'gold' | 'ghost';
      label: string;
      busy?: boolean;
      disabled?: boolean;
      /** Left off while a card is still placeholder content with no endpoint behind it. */
      onClick?: () => void;
    }
  | { kind: 'status'; label: string };

interface Props {
  /** Campaign artwork. The design draws a plain disc where a bonus has none. */
  imageUrl?: string | null;
  title: string;
  /** Under the title: the quiet half, then the emphasised one — "Spin every 12h". */
  subtitle?: { label: string; value?: string };
  /** The band across the middle: what the bonus is worth — "Win up to 1 BTC". */
  worth: { label: string; value?: string };
  action: BonusCardAction;
}

/* The design's band behind the worth line: the stage colour washing in from
   both edges, so the figure reads against a slightly darker strip without the
   card growing a second border. */
const BAND =
  'bg-[linear-gradient(90deg,rgba(9,12,17,0)_0%,rgba(9,12,17,0.23)_31.7%,rgba(9,12,17,0.23)_68.91%,rgba(9,12,17,0)_100%)]';

const PILL =
  'mt-auto flex h-12 w-full items-center justify-center rounded-full px-3 text-center text-[15px] font-semibold leading-6 lg:mt-[calc(var(--u)*12)] lg:h-[calc(var(--u)*56)] lg:text-[length:max(12px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*24)]';

/**
 * One bonus, drawn as the design's 500×262 glass card.
 *
 * Purely presentational: it knows nothing about campaigns, awards or claiming,
 * so the same card carries a real offer for a signed-in player and the
 * explainer a visitor sees. Whoever renders it decides what the three slots
 * say and what the button does.
 *
 * Sized in `--u` from lg up — one design pixel, set by PlayerLayout — so the
 * card keeps the design's proportions on a narrower desktop instead of
 * reflowing. On a phone the column is one card wide and plain px apply.
 */
const BonusGlassCard: FC<Props> = ({ imageUrl, title, subtitle, worth, action }) => (
  <article className="rl-glass-deep max-lg:rl-glass-clear flex flex-col rounded-[24px] px-5 pb-4 pt-5 lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*24)] lg:pb-[calc(var(--u)*16)] lg:pt-[calc(var(--u)*31)]">
    <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*12)]">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#252937] text-white/30 lg:h-[calc(var(--u)*66.5)] lg:w-[calc(var(--u)*66.5)]">
        {imageUrl ? (
          // Campaign artwork is operator-uploaded and can be on any host, so
          // it stays out of next/image — that optimiser only serves hosts
          // listed in next.config, and an unlisted one throws at render.
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <TicketIcon size={22} />
        )}
      </span>

      <div className="min-w-0 lg:space-y-[calc(var(--u)*6)]">
        <h3 className="truncate text-[18px] font-semibold leading-6 text-white lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
          {title}
        </h3>
        {subtitle && (
          <p className="truncate text-[14px] leading-5 text-white/64 lg:text-[length:max(12px,calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
            {subtitle.label}
            {subtitle.value && <span className="text-white/84"> {subtitle.value}</span>}
          </p>
        )}
      </div>
    </div>

    <div
      className={`mt-3 flex min-h-[56px] items-center justify-center px-2 text-center lg:mt-[calc(var(--u)*12)] lg:min-h-[calc(var(--u)*68)] ${BAND}`}
    >
      <p className="text-[15px] leading-6 tracking-[-0.4px] text-white/72 lg:text-[length:max(12px,calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
        {worth.label}
        {worth.value && <span className="text-white"> {worth.value}</span>}
      </p>
    </div>

    {action.kind === 'status' ? (
      <p className={`${PILL} bg-white/10 text-[#f0f1f5]`}>{action.label}</p>
    ) : (
      <button
        type="button"
        onClick={action.onClick}
        disabled={action.disabled}
        className={`${PILL} ${action.kind === 'gold' ? 'rl-btn-gold' : 'rl-btn-ghost'} disabled:cursor-not-allowed`}
      >
        {action.busy ? <ButtonLoader /> : action.label}
      </button>
    )}
  </article>
);

export default BonusGlassCard;
