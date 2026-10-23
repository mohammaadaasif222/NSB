import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import GlassDialog from '@/components/ui/GlassDialog';
import { useTranslation } from '@/context/I18nContext';
import { SIGNED_IN_EVENT } from '@/constants/events';
import {
  fetchLoginPopup,
  recordLoginPopupClick,
  type LoginPopup as Popup,
} from '@/services/loginPopups';

/** Long enough for the sign-in dialog to close before this one opens. */
const AFTER_SIGN_IN_MS = 700;

/**
 * The pop-up after each sign-in (Casino Manager, 22 Oct): one per sign-in,
 * chosen and rotated by the server, in the player's language. Its button
 * opens a page on the site, or an https link in a new tab.
 */
const LoginPopup: FC = () => {
  const { locale } = useTranslation();
  const router = useRouter();
  const [popup, setPopup] = useState<Popup | null>(null);

  useEffect(() => {
    let timer = 0;
    const onSignedIn = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        fetchLoginPopup(locale)
          .then(setPopup)
          .catch(() => setPopup(null));
      }, AFTER_SIGN_IN_MS);
    };
    window.addEventListener(SIGNED_IN_EVENT, onSignedIn);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(SIGNED_IN_EVENT, onSignedIn);
    };
  }, [locale]);

  if (!popup) return null;

  const close = (): void => setPopup(null);
  const follow = (): void => {
    recordLoginPopupClick(popup.id);
    close();
    const url = popup.cta_url;
    if (!url) return;
    if (url.startsWith('/')) void router.push(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <GlassDialog
      open
      onClose={close}
      titleId="login-popup-title"
      title={popup.title}
      titleVariant="title"
      phoneSheet="fit"
      className="w-full p-6 sm:w-[min(560px,92vw)] sm:p-8"
    >
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="mt-5 space-y-5 text-center">
        {popup.image_url && (
          <img
            src={popup.image_url}
            alt=""
            className="mx-auto max-h-[300px] w-full rounded-2xl object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {popup.body && (
          <p className="whitespace-pre-line text-[16px] leading-7 text-[#c3c7d4]">{popup.body}</p>
        )}
        {popup.cta_label && popup.cta_url && (
          <button
            type="button"
            onClick={follow}
            className="rl-btn-gold h-12 w-full rounded-full px-8 text-[16px] font-semibold"
          >
            {popup.cta_label}
          </button>
        )}
      </div>
    </GlassDialog>
  );
};

export default LoginPopup;
