import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';

const NotFound: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
      <span className="text-xs font-extrabold tracking-[0.35em] text-slate-500">ROLLUCK</span>
      <h1 className="mt-4 text-7xl font-extrabold text-blue-500">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page not found</h2>
      <p className="text-slate-400 mt-2">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
      >
        {t('game.backToLobby')}
      </Link>
    </div>
  );
};

export default NotFound;
