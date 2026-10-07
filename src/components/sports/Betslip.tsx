import type { FC, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useBetslip, type Pick } from '@/context/BetslipContext';
import { text } from '@/components/player/typeScale';

const usd = (amount: number): string =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "Arsenal to Win" / "Draw", with its match underneath and the price. */
const PickCard: FC<{ pick: Pick }> = ({ pick }) => {
  const { t } = useTranslation();
  const { remove } = useBetslip();
  const { fixture, outcome } = pick;
  const name =
    outcome === 'draw'
      ? t('sports.draw')
      : t('sports.toWin', { team: (outcome === 'home' ? fixture.home : fixture.away).name });

  return (
    <li className="relative rounded-[calc(var(--u)*22)] bg-white/5 px-[calc(var(--u)*12)] py-[calc(var(--u)*12)]">
      <span
        className={`${text(14)} flex items-center justify-between gap-2 font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5]`}
      >
        <span className="truncate">{name}</span>
        <span className="tabular-nums">{fixture.odds[outcome].toFixed(2)}</span>
      </span>
      <span
        className={`${text(12)} mt-[calc(var(--u)*8)] flex items-end justify-between gap-2 leading-[calc(var(--u)*20)] text-[#9da2b4]`}
      >
        <span className="truncate">
          {t('sports.matchOf', { home: fixture.home.name, away: fixture.away.name })}
        </span>
        <button
          type="button"
          onClick={() => remove(fixture.id)}
          aria-label={t('sports.removePick', { pick: name })}
          className={`${text(14)} -me-1 px-1 font-semibold leading-none text-[#9da2b4] hover:text-white`}
        >
          -
        </button>
      </span>
    </li>
  );
};

const SummaryRow: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div
    className={`${text(14)} flex items-center justify-between gap-3 leading-[calc(var(--u)*20)]`}
  >
    <span className="text-[#9da2b4]">{label}</span>
    <span className="font-medium tabular-nums text-[#f0f1f5]">{children}</span>
  </div>
);

/**
 * The betslip: the picked outcomes, their combined odds, the stake and what
 * it would return. Placing needs a sportsbook backend that does not exist
 * yet, so the button says so rather than pretending a bet was taken.
 */
const Betslip: FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { openLogin } = useAuthModal();
  const { picks, stake, setStake, totalOdds, potentialReturn } = useBetslip();

  const place = (): void => {
    if (!token) {
      openLogin();
      return;
    }
    toast.info(t('sports.betsSoon'));
  };

  return (
    <section
      aria-label={t('sports.betslip')}
      className="rl-liquid rounded-[34px] px-4 pb-[22px] pt-[25px] lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*16)] lg:pb-[calc(var(--u)*22)] lg:pt-[calc(var(--u)*25)]"
    >
      <header className="flex items-center justify-between">
        <h2 className={`${text(16)} font-medium leading-[calc(var(--u)*24)] text-[#f0f1f5]`}>
          {t('sports.betslip')}
        </h2>
        <span
          className={`${text(12)} inline-flex h-[calc(var(--u)*24)] min-w-[calc(var(--u)*35)] items-center justify-center rounded-full bg-[#f0f1f5] px-2 font-medium leading-[calc(var(--u)*20)] text-[#07080a]`}
        >
          {picks.length}
        </span>
      </header>

      {picks.length > 0 ? (
        <ul className="mt-[calc(var(--u)*10)] flex flex-col gap-[calc(var(--u)*10)]">
          {picks.map((pick) => (
            <PickCard key={pick.fixture.id} pick={pick} />
          ))}
        </ul>
      ) : (
        <p
          className={`${text(12)} mt-[calc(var(--u)*10)] rounded-[calc(var(--u)*22)] bg-white/5 px-[calc(var(--u)*12)] py-[calc(var(--u)*16)] leading-[calc(var(--u)*20)] text-[#9da2b4]`}
        >
          {t('sports.betslipEmpty')}
        </p>
      )}

      <div className="mt-[calc(var(--u)*13)] flex flex-col gap-[calc(var(--u)*8)] border-t border-[#2a2e35] pt-[calc(var(--u)*16)]">
        <SummaryRow label={t('sports.totalOdds')}>
          {totalOdds ? totalOdds.toFixed(2) : '-'}
        </SummaryRow>
        <SummaryRow label={t('sports.stake')}>
          <label className="inline-flex items-center">
            $
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              aria-label={t('sports.stake')}
              className="w-[calc(var(--u)*64)] bg-transparent text-end tabular-nums outline-none [appearance:textfield] focus:text-[#ffe779] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        </SummaryRow>
        <SummaryRow label={t('sports.potentialReturn')}>{usd(potentialReturn)}</SummaryRow>
      </div>

      <button
        type="button"
        onClick={place}
        disabled={picks.length === 0}
        className={`${text(16)} mt-[calc(var(--u)*21)] flex h-[calc(var(--u)*56)] w-full items-center justify-center rounded-full bg-[#f9d028] font-medium leading-[calc(var(--u)*24)] text-[#07080a] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {t('sports.placeBet')}
      </button>
    </section>
  );
};

export default Betslip;
