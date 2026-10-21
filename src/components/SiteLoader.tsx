import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

const LETTERS = ['R', 'O', 'L', 'L', 'U', 'C', 'K'] as const;

/**
 * Full-screen loading overlay: the wordmark, letter by letter.
 *
 * Each letter runs the same keyframes offset by 0.15s, which reads as a pulse
 * travelling left-to-right rather than three letters blinking together. The
 * animation is CSS-only (see index.css) so it keeps running while the main
 * thread is busy parsing the incoming page — a JS-driven spinner would stutter
 * at exactly the moment it needs to look smooth.
 *
 * `prefers-reduced-motion` drops the pulse to a static dim state; the overlay
 * still appears, so the page is never silently blank.
 */
const SiteLoader: FC<{ label?: string }> = ({ label }) => {
  const { t } = useTranslation();
  const text = label ?? t('common.loading');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={text}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950"
    >
      <div className="flex items-center gap-1" aria-hidden="true">
        {LETTERS.map((letter, index) => (
          // Keyed by position, not by the letter: ROLLUCK has two Ls, and the
          // duplicate key had React warning on every first load.
          <span
            key={`${letter}-${index}`}
            className="rolluck-loader-letter text-4xl sm:text-5xl font-extrabold tracking-[0.2em] text-white"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="h-0.5 w-28 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
        <div className="rolluck-loader-bar h-full w-1/3 rounded-full bg-blue-500" />
      </div>

      <span className="sr-only">{text}</span>
    </div>
  );
};

export default SiteLoader;
