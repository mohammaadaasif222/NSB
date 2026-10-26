import type { FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

const PROMISES: { title: TranslationKey; body: TranslationKey }[] = [
  { title: 'oath.fair.title', body: 'oath.fair.body' },
  { title: 'oath.players.title', body: 'oath.players.body' },
  { title: 'oath.transparent.title', body: 'oath.transparent.body' },
  { title: 'oath.protect.title', body: 'oath.protect.body' },
  { title: 'oath.excitement.title', body: 'oath.excitement.body' },
  { title: 'oath.enough.title', body: 'oath.enough.body' },
];

const Divider: FC = () => (
  <span aria-hidden="true" className="flex items-center gap-1">
    <span className="h-1 w-1 rounded-full bg-white/20" />
    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
    <span className="h-1 w-1 rounded-full bg-white/20" />
  </span>
);

const RolluckOathPage: FC = () => {
  const { t } = useTranslation();

  return (
    <PlayerLayout>
      <Seo title={t('oath.title')} description={t('oath.subtitle')} path="/rolluck-oath" />

      <div className="mx-auto max-w-[1548px] px-1 pb-2 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
        <header className="flex flex-col items-center text-center">
          <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.08em] text-[#9da2b4] lg:text-[length:max(10px,calc(var(--u)*11))]">
            {t('oath.eyebrow')}
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight text-[#f0f1f5] lg:text-[length:max(32px,calc(var(--u)*44))]">
            {t('oath.title')}
          </h1>
          <p className="mt-3 max-w-[440px] text-[14px] leading-5 text-[#9da2b4]">
            {t('oath.subtitle')}
          </p>
        </header>

        <section className="mt-8 rounded-[24px] border border-white/[0.06] bg-[#16171b] px-5 py-10 sm:px-10 sm:py-14 lg:mt-[calc(var(--u)*40)]">
          <ol className="mx-auto flex max-w-[720px] flex-col items-center gap-8 text-center sm:gap-10">
            {PROMISES.map(({ title, body }, i) => (
              <li key={title} className="flex flex-col items-center gap-8 sm:gap-10">
                {i > 0 && <Divider />}
                <div>
                  <h2 className="text-[22px] font-semibold leading-tight text-[#f0f1f5] sm:text-[28px]">
                    {t(title)}
                  </h2>
                  <p className="mx-auto mt-3 max-w-[520px] text-[13px] leading-5 text-[#9da2b4] sm:text-[14px]">
                    {t(body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 lg:mt-[calc(var(--u)*96)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default RolluckOathPage;
