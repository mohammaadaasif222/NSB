// Stub — the real BlackJackVerified component lives in Win-Win-user and will
// be ported alongside the BlackJack game. FairnessModal imports it statically
// for every game, so the module must resolve even for games we haven't ported
// yet. Replace with the real port when BlackJack lands.
import type { FC } from 'react';

interface BlackJackVerifiedProps {
  blackJackVerifiedData?: unknown;
}

const BlackJackVerified: FC<BlackJackVerifiedProps> = () => (
  <div className="p-6 text-center text-[#94A59E] text-sm">
    BlackJack fairness viewer — not yet ported.
  </div>
);

export default BlackJackVerified;
