import type { FC } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { TicketIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import { BONUS_DESCRIPTION_KEYS, BONUS_TITLE_KEYS } from '@/constants/bonus';
import { formatRewardAmount } from '@/utils/money';
import type { AvailableBonus } from '@/types';

interface Props {
  bonus: AvailableBonus;
  currency: string;
  /** The campaign whose claim is in flight, if any — every Claim waits on it. */
  busyId: string | null;
  onClaim: (bonusId: string) => void;
}

/**
 * One campaign on offer.
 *
 * A campaign this player cannot take yet is shown with its reason rather than
 * hidden — "deposit $20 to unlock" is an offer, where a missing card is a dead
 * end and a support ticket.
 *
 * The terms are stated on the card, not behind a link. A wagering requirement
 * and a max bet are the two things that decide whether a bonus is worth taking,
 * and burying them is how a player ends up with funds they cannot withdraw.
 */
const BonusOfferCard: FC<Props> = ({ bonus, currency, busyId, onClaim }) => {
  const { t } = useTranslation();

  const busy = busyId === bonus.id;
  const anyBusy = busyId !== null;

  const headline = bonus.estimated_amount
    ? formatRewardAmount(bonus.estimated_amount, currency)
    : bonus.free_spins_count
      ? t('bonus.spinsCount', { count: bonus.free_spins_count })
      : bonus.match_percentage
        ? `${bonus.match_percentage}%`
        : '—';

  const terms: string[] = [];
  if (bonus.match_percentage && bonus.estimated_amount) {
    terms.push(t('bonus.terms.match', { percent: bonus.match_percentage }));
  }
  if (bonus.min_deposit_amount && Number(bonus.min_deposit_amount) > 0) {
    terms.push(
      t('bonus.terms.minDeposit', {
        amount: formatRewardAmount(bonus.min_deposit_amount, currency),
      })
    );
  }
  if (bonus.max_bonus_amount && Number(bonus.max_bonus_amount) > 0) {
    terms.push(
      t('bonus.terms.maxBonus', { amount: formatRewardAmount(bonus.max_bonus_amount, currency) })
    );
  }
  if (bonus.wagering_multiplier && Number(bonus.wagering_multiplier) > 0) {
    terms.push(t('bonus.terms.wagering', { multiplier: Number(bonus.wagering_multiplier) }));
  }
  if (bonus.max_bet_size && Number(bonus.max_bet_size) > 0) {
    terms.push(
      t('bonus.terms.maxBet', { amount: formatRewardAmount(bonus.max_bet_size, currency) })
    );
  }
  if (bonus.free_spins_count) {
    terms.push(t('bonus.terms.spins', { count: bonus.free_spins_count }));
  }

  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 ${
        bonus.claimable
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-900'
          : 'border-slate-800 bg-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            bonus.claimable ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-600/15 text-blue-300'
          }`}
          aria-hidden="true"
        >
          <TicketIcon size={20} />
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {t(BONUS_TITLE_KEYS[bonus.type])}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold text-white">{bonus.name}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {bonus.description || t(BONUS_DESCRIPTION_KEYS[bonus.type])}
      </p>

      <p className="mt-3 text-2xl font-extrabold text-white">{headline}</p>
      {bonus.estimated_amount && bonus.needs_deposit === false && (
        <p className="text-[11px] text-slate-500">{t('bonus.basedOnDeposit')}</p>
      )}

      {terms.length > 0 && (
        <ul className="mt-3 space-y-1">
          {terms.map((term) => (
            <li key={term} className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <span
                className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-600"
                aria-hidden="true"
              />
              {term}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4">
        {bonus.claimable ? (
          <button
            type="button"
            onClick={() => onClaim(bonus.id)}
            disabled={anyBusy}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-amber-500 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <ButtonLoader /> : t('bonus.claim')}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="flex h-10 w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-500"
            >
              {bonus.needs_deposit ? t('bonus.needsDeposit') : t('bonus.unavailable')}
            </button>
            {bonus.reason && (
              <p className="mt-1.5 text-center text-[11px] text-slate-500">{bonus.reason}</p>
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default BonusOfferCard;
