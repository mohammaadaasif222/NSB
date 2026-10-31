// Stub — replace when the Dice game is ported. See BlackJackVerified for context.
import type { FC } from 'react';

interface DiceVerifiedProps {
  diceVerifiedData?: number;
}

const DiceVerified: FC<DiceVerifiedProps> = ({ diceVerifiedData = 0 }) => (
  <div className="p-6 text-center text-[#94A59E] text-sm">
    Dice fairness viewer — not yet ported. Rolled number: {diceVerifiedData}
  </div>
);

export default DiceVerified;
