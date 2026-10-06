import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import heart from '@/assets/lobby/heart.svg';
import heartHover from '@/assets/lobby/heart-hover.svg';
import heartGold from '@/assets/lobby/heart-filled.svg';
import heartRed from '@/assets/lobby/heart-filled-red.svg';

interface Props {
  liked: boolean;
  onToggle: () => void;
  /** What is being favourited, for the accessible name. */
  label: string;
  /** Gold for games, red for studios — as the design colours them. */
  tone?: 'gold' | 'red';
  /** Size and position; the heart fills whatever box this gives it. */
  className: string;
}

/**
 * The lobby's favourite toggle, drawn with the design's own heart: a grey
 * outline at rest, a gold outline under the pointer, and solid once liked.
 *
 * Local-only: there is no favourites endpoint yet, so the choice lasts for
 * the session and the tooltip says so rather than pretending it was saved.
 */
const FavouriteHeart: FC<Props> = ({ liked, onToggle, label, tone = 'gold', className }) => {
  const { t } = useTranslation();
  const filled = tone === 'red' ? heartRed : heartGold;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      title={`${t('nav.favourites')} — ${t('common.soon')}`}
      aria-label={`${label} — ${t('nav.favourites')}`}
      className={`group/heart absolute rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${className}`}
    >
      {liked ? (
        <img src={filled.src} alt="" className="h-full w-full" />
      ) : (
        <>
          <img src={heart.src} alt="" className="h-full w-full group-hover/heart:opacity-0" />
          <img
            src={heartHover.src}
            alt=""
            className="absolute inset-0 h-full w-full opacity-0 group-hover/heart:opacity-100"
          />
        </>
      )}
    </button>
  );
};

export default FavouriteHeart;
