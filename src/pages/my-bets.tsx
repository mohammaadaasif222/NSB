import type { FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import SiteFooter from '@/components/player/SiteFooter';
import MyBetsView from '@/components/bets/MyBetsView';
import Seo from '@/components/seo/Seo';
import { useTranslation } from '@/context/I18nContext';

const MyBetsPage: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('nav.myBets')} />
      <ProtectedRoute>
        <PlayerLayout>
          <MyBetsView />
          <div className="mx-auto mt-[74px] max-w-[1600px] lg:mt-[calc(var(--u)*96)] lg:max-w-[calc(var(--u)*1544)]">
            <SiteFooter />
          </div>
        </PlayerLayout>
      </ProtectedRoute>
    </>
  );
};

export default MyBetsPage;
