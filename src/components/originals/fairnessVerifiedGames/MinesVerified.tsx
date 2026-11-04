// Ported from Win-Win-user/src/pages/Originals/fairnessVerifiedGames/MinesVerified.jsx.
// Renders the mines-grid snapshot inside the FairnessModal's "verify past round" tab.
import type { FC } from 'react';

const gemImg = '/assets/mine/gem.png';
const bombImg = '/assets/mine/bomb.png';

interface MinesVerifiedProps {
  minesVerifiedData?: number[];
}

const MinesVerified: FC<MinesVerifiedProps> = ({ minesVerifiedData = [] }) => (
  <div className="relative grid grid-cols-5 p-6 grid-rows-5 gap-2 w-full max-w-[420px] aspect-square">
    {minesVerifiedData.map((cell, idx) => (
      <div
        key={idx}
        className="bg-[#3E3564] rounded-md flex items-center justify-center"
      >
        <img
          src={cell === 1 ? gemImg : bombImg}
          alt={cell === 1 ? 'gem' : 'bomb'}
          className="w-[70%] h-[70%] object-contain"
        />
      </div>
    ))}
  </div>
);

export default MinesVerified;
