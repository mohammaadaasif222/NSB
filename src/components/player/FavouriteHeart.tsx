import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import heart from '@/assets/lobby/heart.svg';
import heartHover from '@/assets/lobby/heart-hover.svg';
import heartFilled from '@/assets/lobby/heart-filled-red.svg';

interface Props {
  liked: boolean;
  onToggle: () => void;
  /** What is being favourited, for the accessible name. */
  label: string;
  /** Size and position; the heart fills whatever box this gives it. */
  className: string;
}

/**
 * The lobby's favourite toggle, drawn with the design's own heart: a grey
 * outline at rest, a gold outline under the pointer, and solid red (#E33827)
 * once liked — games and studios alike, as the design's Select Game draws it.
 */
const FavouriteHeart: FC<Props> = ({ liked, onToggle, label, className }) => {
  const { t } = useTranslation();
  const title = t(liked ? 'favourites.remove' : 'favourites.add');

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
        <img src={heartFilled.src} alt="" className="h-full w-full" />
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
