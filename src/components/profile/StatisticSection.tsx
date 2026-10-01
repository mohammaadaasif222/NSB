import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SectionPlaceholder } from '@/components/profile/SectionShell';
import { ChartIcon } from '@/components/icons';

/**
 * Play statistics.
 *
 * The backend records balances but not a bet history, so there is nothing to
 * total up yet — the tiles below would each need a wagering endpoint behind
 * them. Shown as a placeholder rather than a grid of zeros, which would read
 * as "you have never played" instead of "this is not built".
 */
const StatisticSection: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.statistic')}>
        <SectionPlaceholder icon={<ChartIcon size={26} />} />
      </FieldGroup>
    </div>
  );
};

export default StatisticSection;
