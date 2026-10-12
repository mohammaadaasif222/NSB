import type { FC } from 'react';

import BonusGlassCard, { type BonusCardAction } from '@/components/bonus/BonusGlassCard';
import { useTranslation } from '@/context/I18nContext';

/**
 * The six cards the design draws, with its own copy.
 *
 * PLACEHOLDER. Every value here is the design's, not the server's: the names,
 * the 12h cadence, the 1 BTC ceiling and the countdowns are all fixed strings,
 * and the gold button does nothing. The `bonuses` table is empty and
 * GET /bonuses/me returns no campaigns, so there is nothing to render from.
 *
 * To put it on real data: drop this component from the page and map
 * `summary.available` through BonusOfferCard, which already reads an
 * AvailableBonus and works out its own claim state. Nothing else on the page
 * has to change.
 *
 * `cadence` and `worth` are the emphasised halves of their lines — the design
 * sets "Spin every" quieter than "12h", and "Win up to" quieter than "1 BTC".
 */
interface Card {
  title: string;
  cadence: string;
  worth: string;
  action: BonusCardAction;
}

const useCards = (): Card[] => {
  const { t } = useTranslation();

  const spin: BonusCardAction = { kind: 'gold', label: t('bonus.spinWheel') };
  const bets: BonusCardAction = { kind: 'status', label: t('bonus.placeBets') };
  const claimIn = (days: number): BonusCardAction => ({
    kind: 'status',
    label: `${t('bonus.claimIn')} ${t('content.bonus.daysTime', { days, time: '15:37:43' })}`,
  });
  const cadence = t('content.bonus.hours', { count: 12 });
  const furyWheel = t('content.bonus.regular.furyWheel');

  return [
    { title: furyWheel, cadence, worth: '1 BTC', action: spin },
    { title: t('rewards.type.cashback'), cadence, worth: '1 BTC', action: bets },
    {
      title: t('content.bonus.regular.weeklySport'),
      cadence,
      worth: '1 BTC',
      action: claimIn(1),
    },
    { title: t('rewards.type.weekly'), cadence, worth: '1 BTC', action: claimIn(1) },
    { title: t('rewards.type.monthly'), cadence, worth: '1 BTC', action: claimIn(1) },
    { title: furyWheel, cadence, worth: '1 BTC', action: claimIn(71) },
  ];
};

/** "Regular Bonuses" — the design's six 500×262 cards, three across. */
const RegularBonusRow: FC = () => {
  const { t } = useTranslation();
  const cards = useCards();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-[calc(var(--u)*24)]">
      {cards.map((card, i) => (
        <BonusGlassCard
          key={`${card.title}-${i}`}
          title={card.title}
          subtitle={{ label: t('bonus.spinEvery'), value: card.cadence }}
          worth={{ label: t('bonus.winUpTo'), value: card.worth }}
          action={card.action}
        />
      ))}
    </div>
  );
};

export default RegularBonusRow;
