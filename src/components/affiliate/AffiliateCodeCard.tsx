import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CopyIcon } from '@/components/profile/referral/ReferralCodeCard';
import {
  FacebookMark,
  InstagramMark,
  TelegramMark,
  WhatsappMark,
  XMark,
} from '@/components/profile/referral/socialMarks';
import { AFFILIATE_LINK } from '@/components/affiliate/mockAffiliate';

/** The networks the design offers to share on, in its order. */
const SOCIALS: { Mark: FC; name: string; href: string }[] = [
  { Mark: WhatsappMark, name: 'WhatsApp', href: 'https://wa.me/?text=' },
  { Mark: InstagramMark, name: 'Instagram', href: 'https://instagram.com/' },
  { Mark: FacebookMark, name: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { Mark: XMark, name: 'X', href: 'https://x.com/intent/post?text=' },
  { Mark: TelegramMark, name: 'Telegram', href: 'https://t.me/share/url?url=' },
];

/**
 * The affiliate link, the way to copy it, and the ways to pass it on.
 *
 * Sibling of the account area's ReferralCodeCard and deliberately not the same
 * component: that one is a centred card built around the code itself, this one
 * is a left-aligned row built around a URL with a Change button beside it. They
 * share the parts that really are shared — the copy mark and the social marks.
 *
 * The share links carry no link yet. Every href below is the network's bare
 * share endpoint, because appending a made-up affiliate link would post a dead
 * URL to a real timeline; they take `AFFILIATE_LINK` once it is a real one.
 */
const AffiliateCodeCard: FC = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Clears itself so the control does not sit on "Copied" forever.
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = (): void => {
    void navigator.clipboard?.writeText(AFFILIATE_LINK).then(() => setCopied(true));
  };

  // 22 of top inset, then 28/5/20 of heading and strap, 28 down to the field,
  // 18 to the marks and 26 under them — the design's 251 tall exactly.
  return (
    <section className="rl-glass-edge @container flex flex-col px-5 pt-5.5 pb-6.5 sm:px-6.5 2xl:px-8">
      <h2 className="rl-h-card text-[#f0f1f5]">{t('aff.getCode')}</h2>

      <p className="mt-1.25 text-sm leading-5 text-[#9da2b4]">{t('aff.shareBlurb')}</p>

      {/* 549 of field, 21 of gap and 130 of button is the design's 700 between
          the card's 32px insets. The button keeps its width and the field takes
          what is left, so the row holds its shape at any panel width. */}
      <div className="mt-7 flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:gap-5.25">
        <div className="rl-field-card flex h-14 min-w-0 flex-1 items-center gap-2 rounded-[34px] border border-white/20 ps-5.5 pe-6">
          <span className="min-w-0 flex-1 truncate text-sm leading-5 text-[#9da2b4]">
            {AFFILIATE_LINK}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? t('aff.copied') : t('aff.copyLink')}
            title={copied ? t('aff.copied') : t('aff.copyLink')}
            className="shrink-0 text-[#f0f1f5] transition-opacity hover:opacity-70"
          >
            <CopyIcon />
          </button>
        </div>

        <button
          type="button"
          className="rl-btn-gold h-12 shrink-0 rounded-[34px] px-4 text-[18px] leading-7 font-medium @sm:w-32.5 @sm:px-2"
        >
          {t('aff.change')}
        </button>
      </div>

      {/* The design overlaps these: 48px marks advancing 30px each, so every
          one covers 18px of the mark before it. That is drawn, not a slip of
          the export — the rims visibly cross in Figma's own render — so it is
          reproduced. Each mark still keeps a 30px-wide strip of its own to be
          clicked on, and the last one is whole. */}
      {/* Centred in the card, not aligned to its text. The design puts the row
          at x225 of a 764 card and runs it to x542 — dead centre — so it sits
          under the middle of the field rather than under the label above it. */}
      <div className="mt-4.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-3">
        <div className="flex items-center">
          {SOCIALS.map(({ Mark, name, href }, i) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={t('ref.shareOn', { name })}
              className="rl-chip relative flex h-12 w-12 shrink-0 items-center justify-center -ms-4.5 first:ms-0 hover:z-10"
              style={{ zIndex: i }}
            >
              <Mark />
            </a>
          ))}
        </div>

        <p className="text-xs leading-5 text-[#9da2b4]">{t('aff.orShare')}</p>
      </div>
    </section>
  );
};

export default AffiliateCodeCard;
