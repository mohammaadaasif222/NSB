import type { FC } from 'react';
import ScrollShelf from '@/components/player/ScrollShelf';
import ComingSoonCard from '@/components/player/ComingSoonCard';

/** A lobby row the designs ask for that has nothing behind it yet (Drops & Wins, Hot). */
const ComingSoonShelf: FC<{ title: string }> = ({ title }) => (
  <ScrollShelf title={title} empty={<ComingSoonCard />}>
    {[]}
  </ScrollShelf>
);

export default ComingSoonShelf;
