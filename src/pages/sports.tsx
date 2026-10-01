import type { FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import SportsRow from '@/components/player/SportsRow';
import SiteFooter from '@/components/player/SiteFooter';
import { useTranslation } from '@/context/I18nContext';

/**
 * The sportsbook: the disciplines and the live fixtures, on their own.
 *
 * The same two sections the lobby shows as a teaser, rendered standalone so
 * their "View all" links do not point back at this page. Both are sample data
 * until a fixtures and odds feed exists — see SportsRow.
 */
const Sports: FC = () => {
  const { t } = useTranslation();

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('nav.sports')} — ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-[1600px] space-y-5 pt-1 sm:space-y-7">
        <SportsRow standalone />
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default Sports;
