// Stub placeholder for the Win-Win Home page's "Latest Bets" table that
// MineGame renders at the bottom of its layout. The real table lives on
// the main lobby and will be wired here once that page is ported.
import type { FC } from 'react';

const LatestBetTable: FC = () => {
  return (
    <div className="w-full bg-[#161534] rounded-lg p-4 mt-4 text-center text-[#94A59E] text-sm">
      Latest bets feed — coming soon.
    </div>
  );
};

export default LatestBetTable;
