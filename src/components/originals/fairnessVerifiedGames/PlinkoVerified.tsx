// Stub — replace when the Plinko game is ported. See BlackJackVerified for context.
import type { FC } from 'react';

interface PlinkoVerifiedProps {
  plinkoVerifiedData?: number;
}

const PlinkoVerified: FC<PlinkoVerifiedProps> = ({ plinkoVerifiedData = 0 }) => (
  <div className="p-6 text-center text-[#94A59E] text-sm">
    Plinko fairness viewer — not yet ported. Final multiplier: {plinkoVerifiedData}x
  </div>
);

export default PlinkoVerified;
