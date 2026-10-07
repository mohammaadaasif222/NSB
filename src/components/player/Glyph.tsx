import type { CSSProperties, FC } from 'react';

interface Props {
  src: string;
  /** Square size in design pixels (`--u`, see PlayerLayout). */
  size?: number;
  /** Sizing classes instead of `size` — for a glyph that differs by breakpoint. */
  className?: string;
}

/**
 * An icon drawn through a mask so it takes the text colour around it. The
 * design's glyphs are fixed-colour files; this is what lets an active chip or
 * row tint its icon with its label from one asset.
 */
const Glyph: FC<Props> = ({ src, size, className = '' }) => {
  const style: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    ...(size !== undefined
      ? { width: `calc(var(--u)*${size})`, height: `calc(var(--u)*${size})` }
      : {}),
  };

  return (
    <span
      aria-hidden="true"
      className={`block flex-shrink-0 bg-current ${className}`}
      style={style}
    />
  );
};

export default Glyph;
