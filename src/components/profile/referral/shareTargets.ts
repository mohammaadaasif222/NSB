import type { FC } from 'react';
import {
  FacebookMark,
  InstagramMark,
  TelegramMark,
  WhatsappMark,
  XMark,
} from '@/components/profile/referral/socialMarks';

export interface ShareTarget {
  Mark: FC;
  name: string;
  href: string;
}

/**
 * The networks the design offers, in its order, each carrying the link.
 * Instagram has no share URL, so it opens Instagram and the link is copied.
 */
export const shareTargets = (link: string, message: string): ShareTarget[] => {
  const url = encodeURIComponent(link);
  const text = encodeURIComponent(`${message} ${link}`);
  return [
    { Mark: WhatsappMark, name: 'WhatsApp', href: `https://wa.me/?text=${text}` },
    { Mark: InstagramMark, name: 'Instagram', href: 'https://instagram.com/' },
    {
      Mark: FacebookMark,
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    { Mark: XMark, name: 'X', href: `https://x.com/intent/post?text=${text}` },
    {
      Mark: TelegramMark,
      name: 'Telegram',
      href: `https://t.me/share/url?url=${url}&text=${encodeURIComponent(message)}`,
    },
  ];
};
