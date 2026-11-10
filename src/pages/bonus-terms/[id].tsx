import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import apiService from '@/services/api';
import { analytics } from '@/services/analytics';
import { useTranslation } from '@/context/I18nContext';

const BonusTermsPage: FC = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : null;
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    setFailed(false);
    void apiService
      .get<{ html: string }>(`/bonuses/${id}/terms`, { locale })
      .then((res) => {
        if (!live) return;
        if (res?.success && res.data) {
          setHtml(DOMPurify.sanitize(res.data.html));
          analytics.bonus.termsViewed(id);
        } else setFailed(true);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [id, locale]);

  return (
    <PlayerLayout>
      <Seo title={t('bonus.termsTitle')} description={t('bonus.termsTitle')} />
      <div className="mx-auto max-w-[960px] pb-2">
        <Link href="/bonuses" className="text-[14px] text-white/64 hover:text-white">
          ← {t('bonus.title')}
        </Link>
        <h1 className="rl-h-section mt-3 text-[#f4fffb]">{t('bonus.termsTitle')}</h1>
        <section className="rl-glass-deep max-lg:rl-glass-clear mt-5 rounded-[24px] p-5 text-[15px] leading-6 text-white/84 lg:p-8 [&_h3]:mb-3 [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:text-white [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
          {failed ? (
            <p className="text-white/64">{t('bonus.termsLoadFailed')}</p>
          ) : html === null ? (
            <p className="text-white/64">{t('common.loading')}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </section>
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default BonusTermsPage;
