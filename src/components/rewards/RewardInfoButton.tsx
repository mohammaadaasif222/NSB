import type { FC } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  /** The reward's name, for the button's label. */
  reward: string;
  open: boolean;
  onClick: () => void;
}

/**
 * Opens a reward's detail dialog.
 *
 * Shared by both faces of the rewards page — the signed-in card and the
 * signed-out explainer — so the two rows read as the same object. The standing
 * copy lives behind it in either state; see RewardDetailModal.
 */
const RewardInfoButton: FC<Props> = ({ reward, open, onClick }) => {
  const { t } = useTranslation();
  const label = t('rewards.about', { reward });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#9da2b4] transition-colors hover:bg-white/10 hover:text-[#f0f1f5]"
    >
      <Info size={14} aria-hidden="true" />
    </button>
  );
};

export default RewardInfoButton;
