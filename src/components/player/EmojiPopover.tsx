import { useEffect, useRef, type FC } from 'react';
import dynamic from 'next/dynamic';

/**
 * The composer's emoji picker, and the behaviour around it.
 *
 * The picker is `emoji-picker-react`, loaded through `next/dynamic` with
 * `ssr: false` for two separate reasons: it touches `window`, so it cannot be
 * server-rendered, and it is much larger than the rest of this panel — lazy
 * loading keeps it off the wire until somebody opens it. Nothing from that
 * package is imported here; it all sits behind EmojiPickerPane, which is what
 * makes the laziness real (see that file).
 */

const Pane = dynamic(() => import('@/components/player/EmojiPickerPane'), {
  ssr: false,
  // Holds the picker's height while it loads, so opening it does not shove
  // the composer down and then settle.
  loading: () => (
    <div className="flex h-[340px] w-full items-center justify-center bg-slate-900 text-xs text-slate-500">
      …
    </div>
  ),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  /** Labels the picker and its search box in the active language. */
  label: string;
}

const EmojiPopover: FC<Props> = ({ open, onClose, onPick, label }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent): void => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      // The toggle button handles its own click; closing here as well would
      // close and immediately reopen, so it is excluded by its marker
      // attribute.
      if ((event.target as HTMLElement).closest('[data-emoji-toggle]')) return;
      onClose();
    };

    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      // Claim the key so ChatDrawer does not also act on it and close the
      // whole panel. One Escape should shut one thing — the innermost.
      event.preventDefault();
      onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      // Anchored above the composer and pinned to both of the drawer's edges,
      // so it cannot hang off the side the way a fixed-width picker would.
      className="absolute bottom-full start-0 end-0 z-10 mb-2 overflow-hidden rounded-2xl border border-slate-700 shadow-2xl"
    >
      <Pane onPick={onPick} searchPlaceholder={label} />
    </div>
  );
};

export default EmojiPopover;
