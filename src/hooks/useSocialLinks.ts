import { useEffect, useState } from 'react';
import type { StaticImageData } from 'next/image';
import whatsapp from '@/assets/lobby/footer/social-whatsapp.svg';
import instagram from '@/assets/lobby/footer/social-instagram.svg';
import facebook from '@/assets/lobby/footer/social-facebook.svg';
import xSocial from '@/assets/lobby/footer/social-x.svg';
import telegram from '@/assets/lobby/footer/social-telegram.svg';
import { fetchSocialLinks, type SocialPlatform } from '@/services/socialLinks';

export interface SocialLinkView {
  platform: SocialPlatform;
  label: string;
  icon: StaticImageData;
  href: string;
}

const PLATFORMS: Record<SocialPlatform, { label: string; icon: StaticImageData }> = {
  whatsapp: { label: 'WhatsApp', icon: whatsapp },
  instagram: { label: 'Instagram', icon: instagram },
  facebook: { label: 'Facebook', icon: facebook },
  x: { label: 'X', icon: xSocial },
  telegram: { label: 'Telegram', icon: telegram },
};

export const useSocialLinks = (): SocialLinkView[] => {
  const [links, setLinks] = useState<SocialLinkView[]>([]);

  useEffect(() => {
    let active = true;
    void fetchSocialLinks().then((rows) => {
      if (!active) return;
      setLinks(
        rows
          .filter((row) => PLATFORMS[row.platform])
          .map((row) => ({ platform: row.platform, href: row.url, ...PLATFORMS[row.platform] }))
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return links;
};
