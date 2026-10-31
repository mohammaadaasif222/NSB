import type { FC } from 'react';
import dynamic from 'next/dynamic';

import PlayerLayout from '@/layout/PlayerLayout';
import Seo from '@/components/seo/Seo';

// Dynamic import with ssr:false — MineGame pulls in @mui/material (emotion),
// socket.io-client, react-tooltip and react-hot-toast which all expect the
// browser globals. SSRing them crashes the build; client-only mount is the
// standard Next.js escape hatch.
const MineGame = dynamic(() => import('@/components/originals/MineGame'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] grid place-items-center text-sm text-white/70">
      Loading Mines…
    </div>
  ),
});

const MinesOriginalsPage: FC = () => {
  return (
    <PlayerLayout>
      <Seo
        title="Mines — Rolluck Originals"
        description="Rolluck Originals Mines — pick the gems, avoid the bombs."
        path="/originals/mines"
      />
      <MineGame />
    </PlayerLayout>
  );
};

export default MinesOriginalsPage;
