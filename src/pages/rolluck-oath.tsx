import type { FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import { useTranslation } from '@/context/I18nContext';
import scrollArt from '@/assets/oath/oath-scroll.webp';
import sealArt from '@/assets/oath/oath-seal.webp';
import dividerArt from '@/assets/oath/oath-divider.svg';

const Divider: FC = () => (
  <img src={dividerArt.src} alt="" aria-hidden="true" className="mx-auto block w-[46.6%]" />
);

const RolluckOathPage: FC = () => {
  const { t } = useTranslation();

  return (
    <PlayerLayout>
      <Seo title={t('oath.title')} description={t('oath.subtitle')} path="/rolluck-oath" />

      <div className="mx-auto max-w-[1548px] px-1 pb-2 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*74)]">
        <div className="mx-auto max-w-[640px] lg:w-[calc(var(--u)*1226)] lg:max-w-none">
          <article
            className="bg-[length:100%_100%] bg-no-repeat pt-[17.6%] pr-[13%] pb-[18.2%] pl-[16%] text-center lg:pt-[calc(var(--u)*216)] lg:pr-[calc(var(--u)*227)] lg:pb-[calc(var(--u)*223)] lg:pl-[calc(var(--u)*268)]"
            style={{ backgroundImage: `url(${scrollArt.src})` }}
          >
            <h1 className="font-bold text-[#07080a] uppercase">
              {t('oath.the') && (
                <span className="block text-[26px] leading-8 lg:text-[length:calc(var(--u)*54)] lg:leading-[calc(var(--u)*68)]">
                  {t('oath.the')}
                </span>
              )}
              <span className="mt-0.5 block text-[34px] leading-[38px] text-[#75461e] lg:mt-[calc(var(--u)*7)] lg:text-[length:calc(var(--u)*84)] lg:leading-[calc(var(--u)*78)]">
                {t('oath.name')}
              </span>
            </h1>

            <div className="mt-5 lg:mt-[calc(var(--u)*46)]">
              <Divider />
            </div>

            <p className="mt-6 text-[15px] leading-[26px] text-[#07080a] lg:mt-[calc(var(--u)*53)] lg:text-[length:calc(var(--u)*35)] lg:leading-[calc(var(--u)*62)]">
              {t('oath.body')}
            </p>

            <div className="mt-6 lg:mt-[calc(var(--u)*53)]">
              <Divider />
            </div>

            <img
              src={sealArt.src}
              alt=""
              aria-hidden="true"
              className="mx-auto mt-6 block w-[29.8%] lg:mt-[calc(var(--u)*52)]"
            />
          </article>
        </div>

        <div className="mt-10 lg:mt-[calc(var(--u)*112)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default RolluckOathPage;
