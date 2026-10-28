import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { CheckIcon } from '@/components/icons';
import { CopyIcon } from '@/components/profile/referral/ReferralCodeCard';
import { shareTargets } from '@/components/profile/referral/shareTargets';
import { referralLink } from '@/services/referral';
import { analytics } from '@/services/analytics';

interface Props {
  /** The code being shared; null while loading or signed out. */
  code: string | null;
  signedIn: boolean;
  onChange: () => void;
  onSignIn: () => void;
}

/**
 * The referral link, the way to copy it, and the ways to pass it on.
 *
 * Sibling of the account area's ReferralCodeCard and deliberately not the same
 * component: that one is a centred card built around the code itself, this one
 * is a left-aligned row built around a URL with a Change button beside it. They
 * share the parts that really are shared — the copy mark and the social marks.
 *
 * "Change" opens the player's campaigns, where they pick another code or make one.
 */
const ReferralLinkCard: FC<Props> = ({ code, signedIn, onChange, onSignIn }) => {
  const { t } = useTranslation();
  const { copied, copy: copyText } = useCopyToClipboard();
  const link = code ? referralLink(code) : '';

  const copy = (): void => {
    void copyText(link).then((ok) => {
      if (ok) analytics.referral.linkCopied();
    });
  };

  // 22 of top inset, then 28/5/20 of heading and strap, 28 down to the field,
  // 18 to the marks and 26 under them — the design's 251 tall exactly.
  return (
    <section className="rl-glass-edge @container flex h-full flex-col justify-center px-5 pt-5.5 pb-6.5 sm:px-6.5 2xl:px-8">
      <h2 className="rl-h-card text-[#f0f1f5]">{t('aff.getCode')}</h2>

      <p className="mt-1.25 text-sm leading-5 text-[#9da2b4]">{t('aff.shareBlurb')}</p>

      {/* 549 of field, 21 of gap and 130 of button is the design's 700 between
          the card's 32px insets. The button keeps its width and the field takes
          what is left, so the row holds its shape at any panel width. */}
      <div className="mt-7 flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:gap-5.25">
        <div
          className={`rl-field-card flex h-14 min-w-0 flex-1 items-center gap-2 rounded-[34px] border ps-5.5 pe-6 transition-colors ${copied ? 'border-[#03b739]/60' : 'border-white/20'}`}
        >
          <span
            className={`min-w-0 flex-1 truncate text-sm leading-5 transition-colors ${copied ? 'text-[#03b739]' : 'text-[#9da2b4]'}`}
          >
            {copied ? t('aff.copied') : link || (signedIn ? '…' : t('aff.signInForLink'))}
          </span>
          <button
            type="button"
            onClick={copy}
            disabled={!link}
            aria-label={copied ? t('aff.copied') : t('aff.copyLink')}
            title={copied ? t('aff.copied') : t('aff.copyLink')}
            className={`shrink-0 transition-[opacity,transform] hover:opacity-70 active:scale-90 ${copied ? 'text-[#03b739]' : 'text-[#f0f1f5]'}`}
          >
            {copied ? <CheckIcon size={24} /> : <CopyIcon />}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? t('aff.copied') : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={signedIn ? onChange : onSignIn}
          className="rl-btn-gold h-12 shrink-0 rounded-[34px] px-4 text-[18px] leading-7 font-medium @sm:w-32.5 @sm:px-2"
        >
          {signedIn ? t('aff.change') : t('aff.signIn')}
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
          {shareTargets(link, t('ref.shareMessage')).map(({ Mark, name, href }, i) => (
            <a
              key={name}
              href={link ? href : undefined}
              target="_blank"
              rel="noreferrer"
              aria-label={t('ref.shareOn', { name })}
              aria-disabled={!link}
              onClick={() => {
                if (!link) return;
                if (name === 'Instagram') void copyText(link);
                analytics.referral.shared(name.toLowerCase());
              }}
              className="rl-glass-btn relative flex h-12 w-12 rounded-full [--rl-btn-base:#121317] shrink-0 items-center justify-center -ms-4.5 first:ms-0 hover:z-10 aria-disabled:opacity-50"
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

export default ReferralLinkCard;
