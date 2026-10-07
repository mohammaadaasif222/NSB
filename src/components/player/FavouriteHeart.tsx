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
  /**
   * The choice is saved to the account (games). Without it the heart is
   * session-only (studios, which have no favourites endpoint yet) and its
   * tooltip says so.
   */
  saved?: boolean;
  /** Size and position; the heart fills whatever box this gives it. */
  className: string;
}

/**
 * The lobby's favourite toggle, drawn with the design's own heart: a grey
 * outline at rest, a gold outline under the pointer, and solid once liked.
 */
const FavouriteHeart: FC<Props> = ({
  liked,
  onToggle,
  label,
  tone = 'gold',
  saved = false,
  className,
}) => {
  const { t } = useTranslation();
  const filled = tone === 'red' ? heartRed : heartGold;
  const title = saved
    ? t(liked ? 'favourites.remove' : 'favourites.add')
    : `${t('nav.favourites')} — ${t('common.soon')}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      title={title}
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
