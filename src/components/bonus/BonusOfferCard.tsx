import type { FC } from 'react';
import Link from 'next/link';

import BonusGlassCard, { type BonusCardAction } from '@/components/bonus/BonusGlassCard';
import { useTranslation } from '@/context/I18nContext';
import { BONUS_TITLE_KEYS } from '@/constants/bonus';
import { formatRewardAmount as formatMoney } from '@/utils/money';
import type { AvailableBonus } from '@/types';

const formatRewardAmount = (amount: string, currency: string): string =>
  formatMoney(amount, currency, 'bonus.awards');

interface Props {
  bonus: AvailableBonus;
  currency: string;
  /** The campaign whose claim is in flight, if any — every Claim waits on it. */
  busyId: string | null;
  onClaim: (bonusId: string) => void;
  onDeposit?: () => void;
  onOptIn?: (bonusId: string) => void;
}

/**
 * One campaign on offer, in the design's glass card.
 *
 * A campaign this player cannot take yet is shown with its reason in place of
 * the Claim button rather than hidden — "deposit $20 to unlock" is an offer,
 * where a missing card is a dead end and a support ticket. That is also what
 * the design draws: the foot of the card either acts or says what it is
 * waiting for.
 *
 * The wagering multiplier rides on the subtitle line. It is the one term that
 * decides whether a bonus is worth taking, and the card has a single line to
 * spend — so it gets it, rather than the list of every term that the design
 * leaves no room for.
 */
const BonusOfferCard: FC<Props> = ({ bonus, currency, busyId, onClaim, onDeposit, onOptIn }) => {
  const { t } = useTranslation();

  const wagering = Number(bonus.wagering_multiplier ?? 0);

  // The cap is the honest "up to"; without one, the estimate is what this
  // player would actually be given, and spins and percentages are neither.
  const cap = Number(bonus.max_bonus_amount ?? 0) > 0 ? bonus.max_bonus_amount : null;
  const worth = cap
    ? { label: t('bonus.winUpTo'), value: formatRewardAmount(cap, currency) }
    : bonus.estimated_amount
      ? { label: t('bonus.winUpTo'), value: formatRewardAmount(bonus.estimated_amount, currency) }
      : bonus.free_spins_count
        ? {
            label: t('bonus.youGet'),
            value: t('bonus.spinsCount', { count: bonus.free_spins_count }),
          }
        : bonus.match_percentage
          ? { label: t('bonus.youGet'), value: `${bonus.match_percentage}%` }
          : { label: t('bonus.youGet'), value: '—' };

  const optedIn = bonus.opt_in?.status === 'OPTED_IN';
  const optInAction: BonusCardAction | null =
    bonus.claim_mode === 'OPT_IN' && onOptIn
      ? optedIn
        ? { kind: 'status', label: t('bonus.optedIn') }
        : {
            kind: 'gold',
            label: t('bonus.optIn'),
            busy: busyId === bonus.id,
            disabled: busyId !== null,
            onClick: () => onOptIn(bonus.id),
          }
      : null;
  const blocked = (bonus.blocked_products ?? [])
    .map((product) => t(`bonus.product.${product}`))
    .join(', ');
  const footnote = (
    <>
      {blocked && <span>{t('bonus.blockedProducts', { products: blocked })} · </span>}
      {(bonus.provider_shares ?? []).length > 0 && <span>{t('bonus.providerShares')} · </span>}
      <Link
        href={`/bonus-terms/${bonus.id}`}
        className="underline underline-offset-2 hover:text-white"
      >
        {t('bonus.termsLink')}
      </Link>
    </>
  );

  const action: BonusCardAction =
    optInAction ??
    (bonus.claimable
      ? {
          kind: 'gold',
          label: t('bonus.claim'),
          busy: busyId === bonus.id,
          disabled: busyId !== null,
          onClick: () => onClaim(bonus.id),
        }
      : bonus.needs_deposit && onDeposit
        ? { kind: 'ghost', label: t('bonus.needsDeposit'), onClick: onDeposit }
        : {
            kind: 'status',
            label: bonus.needs_deposit
              ? t('bonus.needsDeposit')
              : (bonus.reason ?? t('bonus.unavailable')),
          });

  return (
    <BonusGlassCard
      imageUrl={bonus.image_url}
      title={bonus.name}
      subtitle={{
        label: t(BONUS_TITLE_KEYS[bonus.type]),
        ...(wagering > 0 && { value: `· ${t('bonus.terms.wagering', { multiplier: wagering })}` }),
      }}
      worth={worth}
      action={action}
      footnote={footnote}
    />
  );
};

export default BonusOfferCard;
