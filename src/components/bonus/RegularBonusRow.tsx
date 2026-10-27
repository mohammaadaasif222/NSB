import type { FC } from 'react';

import ActiveBonusCard from '@/components/bonus/ActiveBonusCard';
import BonusOfferCard from '@/components/bonus/BonusOfferCard';
import { useTranslation } from '@/context/I18nContext';
import type { AvailableBonus, UserBonus } from '@/types';

const NOTE =
  'rl-glass-deep max-lg:rl-glass-clear rounded-[24px] px-5 py-10 text-center text-[14px] leading-5 text-white/56 lg:rounded-[calc(var(--u)*34)] lg:py-[calc(var(--u)*48)] lg:text-[length:max(11px,calc(var(--u)*16))]';

interface Props {
  offers: AvailableBonus[];
  awards: UserBonus[];
  currency: string;
  enabled: boolean;
  pending: boolean;
  failed: boolean;
  clockOffset: number;
  busyId: string | null;
  onClaim: (bonusId: string) => void;
  onForfeit: (awardId: string) => void;
  onDeposit: () => void;
}

const RegularBonusRow: FC<Props> = ({
  offers,
  awards,
  currency,
  enabled,
  pending,
  failed,
  clockOffset,
  busyId,
  onClaim,
  onForfeit,
  onDeposit,
}) => {
  const { t } = useTranslation();

  if (offers.length === 0 && awards.length === 0) {
    return (
      <p className={NOTE}>
        {pending
          ? t('common.loading')
          : failed
            ? t('bonus.loadFailed')
            : enabled
              ? t('bonus.regularEmpty')
              : t('bonus.regularOff')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-[calc(var(--u)*24)]">
      {awards.map((award) => (
        <ActiveBonusCard
          key={award.id}
          award={award}
          currency={currency}
          clockOffset={clockOffset}
          busyId={busyId}
          onForfeit={onForfeit}
        />
      ))}

      {offers.map((bonus) => (
        <BonusOfferCard
          key={bonus.id}
          bonus={bonus}
          currency={currency}
          busyId={busyId}
          onClaim={onClaim}
          onDeposit={onDeposit}
        />
      ))}
    </div>
  );
};

export default RegularBonusRow;
