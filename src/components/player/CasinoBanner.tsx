import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import banner from '@/assets/lobby/casino/banner.webp';

/**
 * The casino page's banner: the lobby artwork, opening the promotions page.
 *
 * One image, cropped as each design crops it. Desktop covers the 1548×416
 * frame. The phone's 388×236 frame shows a centred window 55.9% of the image
 * wide, so the image is drawn at 1/0.559 = 178.86% of the frame's width and
 * centred — the same crop at any phone width.
 */
const CasinoBanner: FC = () => (
  <Link
    href="/promotions"
    aria-label="Promotions"
    className="group relative block aspect-[388/236] overflow-hidden rounded-[34px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/10 lg:aspect-auto lg:h-[calc(var(--u)*416)] lg:rounded-[calc(var(--u)*34)]"
  >
    <Image
      src={banner}
      alt=""
      priority
      sizes="(max-width: 1023px) 180vw, 1548px"
      className="absolute left-1/2 top-1/2 h-auto w-[178.86%] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-[1.02] lg:h-full lg:w-full lg:object-cover"
    />
  </Link>
);

export default CasinoBanner;
