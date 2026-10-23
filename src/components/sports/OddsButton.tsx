import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useBetslip } from '@/context/BetslipContext';
import type { Fixture, Outcome } from '@/services/sportsbook.sample';
import { text } from '@/components/player/typeScale';

const LABEL: Record<Outcome, 'sports.home' | 'sports.draw' | 'sports.away'> = {
  home: 'sports.home',
  draw: 'sports.draw',
  away: 'sports.away',
};

interface Props {
  fixture: Fixture;
  outcome: Outcome;
  /**
   * `card` — the match cards' price-only box. `row` — the league tables'
   * pill with the outcome named on the left.
   */
  variant: 'card' | 'row';
}

/**
 * One price, and the way to pick it: adds the outcome to the betslip, or
 * takes it off when already picked. Gold when picked.
 */
const OddsButton: FC<Props> = ({ fixture, outcome, variant }) => {
  const { t } = useTranslation();
  const { pickOf, toggle } = useBetslip();
  const picked = pickOf(fixture.id) === outcome;
  const price = fixture.odds[outcome].toFixed(2);
  const label = t(LABEL[outcome]);

  const state = picked
    ? 'border-[#f9d028] bg-[#f9d028]/15 text-[#ffe779]'
    : 'border-white/20 bg-white/5 hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={() => toggle(fixture, outcome)}
      aria-pressed={picked}
      aria-label={`${fixture.home.name} – ${fixture.away.name}: ${label} ${price}`}
      className={
        variant === 'card'
          ? `flex h-[calc(var(--u)*32)] min-w-0 flex-1 items-center justify-center rounded-[calc(var(--u)*8)] border font-rubik ${text(13)} font-medium leading-[calc(var(--u)*15)] tabular-nums transition-colors ${picked ? state : `${state} text-[#cccccc]`}`
          : `flex h-[calc(var(--u)*35)] min-w-0 flex-1 items-center justify-between gap-[calc(var(--u)*6)] rounded-full border px-[calc(var(--u)*12)] font-rubik transition-colors ${state}`
      }
    >
      {variant === 'card' ? (
        price
      ) : (
        <>
          <span
            className={`${text(12)} truncate font-medium leading-[calc(var(--u)*14)] ${picked ? '' : 'text-[#b3bec1]'}`}
          >
            {label}
          </span>
          <span
            className={`${text(13)} font-semibold leading-[calc(var(--u)*15)] tabular-nums ${picked ? '' : 'text-white'}`}
          >
            {price}
          </span>
        </>
      )}
    </button>
  );
};

export default OddsButton;
