import type { FC } from 'react';
import type { StaticImageData } from 'next/image';
import { toast } from 'react-toastify';
import telegramIcon from '@/assets/lobby/telegram.svg';
import facebookIcon from '@/assets/lobby/footer/social-facebook.svg';
import whatsappIcon from '@/assets/lobby/footer/social-whatsapp.svg';
import { FacebookMark, GmailMark, SteamMark, TelegramMark, WhatsappMark } from '@/components/brand';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import type { SocialLoginProvider } from '@/services/socialLoginProviders';

/** Click handlers for whichever providers the screen has wired up. */
export type SocialLoginActions = Partial<Record<SocialLoginProvider, () => void>>;

/**
 * How each social provider is drawn wherever the auth screens list them.
 * `colour` is a text-colour class — the marks draw in currentColor.
 * `icon` is the design's exported artwork, used for the round discs; `Mark`
 * is the fallback for a provider the design has no export for (Steam).
 * `buttonOnly` providers are shown (when the admin has them on) but have no
 * sign-in behind them yet: a click says "coming soon".
 */
export const SOCIAL_PROVIDER_UI: Record<
  SocialLoginProvider,
  {
    label: TranslationKey;
    colour: string;
    Mark: FC<{ size?: number }>;
    icon?: StaticImageData;
    buttonOnly?: true;
  }
> = {
  google: { label: 'auth.methodGmail', colour: '', Mark: GmailMark },
  telegram: {
    label: 'auth.methodTelegram',
    colour: 'text-[#2aabee]',
    Mark: TelegramMark,
    icon: telegramIcon,
  },
  facebook: {
    label: 'auth.methodFacebook',
    colour: 'text-[#1877f2]',
    Mark: FacebookMark,
    icon: facebookIcon,
    buttonOnly: true,
  },
  whatsapp: {
    label: 'auth.methodWhatsapp',
    colour: 'text-[#25d366]',
    Mark: WhatsappMark,
    icon: whatsappIcon,
    buttonOnly: true,
  },
  steam: { label: 'auth.methodSteam', colour: 'text-white', Mark: SteamMark },
};

/**
 * A provider's mark inside a round disc: the design's export where there is
 * one, otherwise the drawn mark in the brand colour. `className` sets the size.
 */
export const DiscMark: FC<{ provider: SocialLoginProvider; className: string }> = ({
  provider,
  className,
}) => {
  const { icon, colour, Mark } = SOCIAL_PROVIDER_UI[provider];
  if (icon) return <img src={icon.src} alt="" className={className} />;
  return (
    <span
      className={`flex items-center justify-center ${colour} ${className} [&>svg]:h-full [&>svg]:w-full`}
    >
      <Mark />
    </span>
  );
};

/**
 * The click handler for a provider: the screen's own if it has one, the
 * "coming soon" notice for a button-only provider, otherwise none (and the
 * provider is not drawn).
 */
export const useSocialProviderClick = (
  actions: SocialLoginActions
): ((provider: SocialLoginProvider) => (() => void) | undefined) => {
  const { t } = useTranslation();
  return (provider) => {
    const own = actions[provider];
    if (own) return own;
    const ui = SOCIAL_PROVIDER_UI[provider];
    if (!ui.buttonOnly) return undefined;
    return () => {
      toast.info(t('auth.methodSoon', { method: t(ui.label) }));
    };
  };
};
