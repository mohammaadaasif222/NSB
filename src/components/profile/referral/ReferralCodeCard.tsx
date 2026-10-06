import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { REFERRAL_CODE } from '@/components/profile/referral/mockReferral';
import {
  FacebookMark,
  InstagramMark,
  TelegramMark,
  WhatsappMark,
  XMark,
} from '@/components/profile/referral/socialMarks';

/** The networks the design offers to share on, in its order. */
const SOCIALS: { Mark: FC; name: string; href: string }[] = [
  { Mark: WhatsappMark, name: 'WhatsApp', href: 'https://wa.me/?text=' },
  { Mark: InstagramMark, name: 'Instagram', href: 'https://instagram.com/' },
  { Mark: FacebookMark, name: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { Mark: XMark, name: 'X', href: 'https://x.com/intent/post?text=' },
  { Mark: TelegramMark, name: 'Telegram', href: 'https://t.me/share/url?url=' },
];

/**
 * The copy mark, traced from the design.
 *
 * Exported because the Affiliate page's code card uses the same mark — it is
 * `ci:copy` in the design on both screens, and the only difference there is a
 * 24.2667 box rather than 24, which is the icon scaled rather than redrawn.
 */
export const CopyIcon: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 9V6.2C9 5.08 9 4.52 9.218 4.092C9.41 3.715 9.715 3.41 10.092 3.218C10.52 3 11.08 3 12.2 3H17.8C18.92 3 19.48 3 19.908 3.218C20.2843 3.40974 20.5903 3.71569 20.782 4.092C21 4.52 21 5.08 21 6.2V11.8C21 12.92 21 13.48 20.782 13.908C20.5903 14.2843 20.2843 14.5903 19.908 14.782C19.48 15 18.92 15 17.803 15H15M9 9H6.2C5.08 9 4.52 9 4.092 9.218C3.71569 9.40974 3.40974 9.71569 3.218 10.092C3 10.52 3 11.08 3 12.2V17.8C3 18.92 3 19.48 3.218 19.908C3.40974 20.2843 3.71569 20.5903 4.092 20.782C4.519 21 5.079 21 6.197 21H11.804C12.921 21 13.48 21 13.908 20.782C14.2843 20.5903 14.5903 20.2843 14.782 19.908C15 19.48 15 18.921 15 17.803V15M9 9H11.8C12.92 9 13.48 9 13.908 9.218C14.2843 9.40974 14.5903 9.71569 14.782 10.092C15 10.519 15 11.079 15 12.197V15" />
  </svg>
);

/** The code, the way to copy it, and the ways to pass it on. */
const ReferralCodeCard: FC = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Clears itself so the button does not sit on "Copied" forever.
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = (): void => {
    void navigator.clipboard?.writeText(REFERRAL_CODE).then(() => setCopied(true));
  };

  return (
    <div className="rl-panel flex flex-col items-center px-6 pt-6.75 pb-5 text-center">
      <p className="text-sm leading-5 text-[#9da2b4]">{t('ref.referralCode')}</p>

      <p className="rl-h-section mt-3.75">{REFERRAL_CODE}</p>

      <button
        type="button"
        onClick={copy}
        className="rl-field-card mt-2.75 flex h-14 w-full max-w-[434px] items-center justify-center gap-1.25 rounded-[34px] text-base leading-6 font-medium text-[#f0f1f5] hover:bg-white/8"
      >
        {copied ? t('ref.copied') : t('ref.copyCode')}
        <CopyIcon />
      </button>

      <p className="mt-5.5 text-sm leading-5 text-[#9da2b4]">{t('ref.orShare')}</p>

      <div className="mt-3 flex items-center gap-3">
        {SOCIALS.map(({ Mark, name, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={t('ref.shareOn', { name })}
            className="rl-chip flex h-12 w-12 items-center justify-center"
          >
            <Mark />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ReferralCodeCard;
