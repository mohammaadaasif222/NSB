import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import { ProviderCard } from '@/components/player/ProviderRow';
import Seo from '@/components/seo/Seo';
import { breadcrumbJsonLd } from '@/components/seo/breadcrumbs';
import { useTranslation } from '@/context/I18nContext';
import { PROVIDERS_PATH } from '@/constants/games';
import { fetchProviders } from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import type { LobbyProvider } from '@/types';

interface Props {
  providers: LobbyProvider[];
  failed: boolean;
}

const ProvidersPage: FC<Props> = ({ providers, failed }) => {
  const { t, locale } = useTranslation();
  const title = t('lobby.providers.title');

  return (
    <PlayerLayout>
      <Seo
        title={title}
        description={t('misc.meta.providers')}
        path={PROVIDERS_PATH}
        jsonLd={breadcrumbJsonLd(locale, [
          { name: t('nav.home'), path: '/' },
          { name: title, path: PROVIDERS_PATH },
        ])}
      />

      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <section className="space-y-5 lg:space-y-[calc(var(--u)*28)]">
          <header>
            <h1 className="rl-h-section">{title}</h1>
            <p className="mt-2 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
              {t('lobby.providers.intro')}
            </p>
          </header>

          {failed && (
            <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
              {t('dash.catalogueUnavailable')}
            </p>
          )}

          {providers.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-[calc(var(--u)*20)]">
              {providers.map((provider) => (
                <li key={provider.id}>
                  <ProviderCard provider={provider} />
                  <p className="mt-2 truncate text-center text-[12px] leading-4 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
                    {provider.name} · {provider.game_count}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const providers = await fetchProviders();
  if (!providers) {
    markUnavailable({ req, res });
  }
  return { props: { providers: providers ?? [], failed: !providers } };
};

export default ProvidersPage;
