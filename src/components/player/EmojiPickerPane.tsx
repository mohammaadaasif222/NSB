import type { FC } from 'react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

/**
 * The picker itself, kept in its own file so that `emoji-picker-react` has
 * exactly one import site — and so that site can be loaded lazily.
 *
 * This separation is load-bearing, not tidiness. `EmojiStyle` and `Theme` are
 * runtime objects, not types, so importing them from the parent would execute
 * the package's entry module and pull the whole picker into whichever chunk
 * the parent lands in, with `next/dynamic` then lazily loading something
 * already downloaded. Everything that touches the package lives behind this
 * file's boundary.
 */

interface Props {
  onPick: (emoji: string) => void;
  /** Placeholder for the picker's own search box. */
  searchPlaceholder: string;
}

const EmojiPickerPane: FC<Props> = ({ onPick, searchPlaceholder }) => (
  <EmojiPicker
    onEmojiClick={(data) => onPick(data.emoji)}
    // NATIVE renders the viewer's own OS emoji instead of fetching sprite
    // images from the library's CDN. Two things follow: the picker makes no
    // third-party request, and what you pick is exactly what the message will
    // show — a message body is plain unicode text, so a picker drawing Apple
    // art would be previewing a font nobody gets.
    emojiStyle={EmojiStyle.NATIVE}
    theme={Theme.DARK}
    // The drawer is 23rem; the picker fills it.
    width="100%"
    height={340}
    lazyLoadEmojis
    // The preview strip doubles the chrome for no information a player needs
    // — they can already see the emoji they are hovering.
    previewConfig={{ showPreview: false }}
    searchPlaceHolder={searchPlaceholder}
  />
);

export default EmojiPickerPane;
