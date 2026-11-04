import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { compactCount, fetchTotalRegistrations } from '@/services/stats';

export const useTotalRegistrationsLabel = (initial: number | null = null): string | undefined => {
  const { t } = useTranslation();
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (initial !== null) {
      return;
    }
    let active = true;
    void fetchTotalRegistrations().then((value) => {
      if (active && value !== null) {
        setCount(value);
      }
    });
    return () => {
      active = false;
    };
  }, [initial]);

  return count === null
    ? undefined
    : t('registerModal.totalRegistrations', { count: compactCount(count) });
};
