import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import Seo from '@/components/seo/Seo';

const Unauthorized: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
      <Seo title={t('misc.unauthorized.title')} />
      <span className="text-xs font-extrabold tracking-[0.35em] text-slate-500">ROLLUCK</span>
      <h1 className="mt-4 text-6xl font-extrabold text-red-500">401</h1>
      <h2 className="text-2xl font-semibold mt-4">{t('misc.unauthorized.title')}</h2>
      <p className="text-slate-400 mt-2">{t('misc.unauthorized.body')}</p>
      <Link
        href="/auth/login"
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
      >
        {t('account.login')}
      </Link>
    </div>
  );
};

export default Unauthorized;
