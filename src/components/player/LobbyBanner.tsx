import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { LOBBY_BANNER } from '@/constants/cdn';

/**
 * The casino and sportsbook pages' banner: the lobby artwork, opening the
 * promotions page.
 *
 * One image centred and covering both frames — the design's 1548×416 on
 * desktop, 388×236 on a phone. The art is already cropped tight to the tiles,
 * so covering shows the grid at either shape; the phone used to take a hand
 * measured window out of a much wider export, which only held for that one
 * file.
 */
const LobbyBanner: FC = () => {
  const { t } = useTranslation();
  const { promotions: promotionsOn } = usePlatformFeatures();

  // The banner only opens the promotions page; with promotions off it goes too.
  if (!promotionsOn) {
    return null;
  }

  return (
    <Link
      href="/promotions"
      aria-label={t('menu.promotions')}
      className="group relative block aspect-[388/236] overflow-hidden rounded-[34px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/10 lg:aspect-auto lg:h-[calc(var(--u)*416)] lg:rounded-[calc(var(--u)*34)]"
    >
      <Image
        src={LOBBY_BANNER}
        alt={t('menu.promotions')}
        priority
        sizes="(max-width: 1023px) 100vw, 1548px"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </Link>
  );
};

export default LobbyBanner;
