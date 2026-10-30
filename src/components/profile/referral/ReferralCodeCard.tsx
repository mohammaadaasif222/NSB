import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { CheckIcon } from '@/components/icons';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import { shareTargets } from '@/components/profile/referral/shareTargets';
import { referralLink } from '@/services/referral';
import { analytics } from '@/services/analytics';

/**
 * The copy mark, traced from the design.
 *
 * Exported because the Referral page's link card uses the same mark — it is
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

/** The code, the way to copy its link, and the ways to pass it on. */
const ReferralCodeCard: FC<{ code: string | null }> = ({ code }) => {
  const { t } = useTranslation();
  const { copied, copy: copyText } = useCopyToClipboard();
  const link = code ? referralLink(code) : '';

  const copy = (): void => {
    void copyText(link).then((ok) => {
      if (ok) analytics.referral.linkCopied();
    });
  };

  const mark = copied ? <CheckIcon size={24} /> : <CopyIcon />;

  const shares = shareTargets(link, t('ref.shareMessage')).map(({ Mark, name, href }) => ({
    Mark,
    name,
    href: code ? href : undefined,
    onClick: () => {
      if (!code) return;
      if (name === 'Instagram') void copyText(link);
      analytics.referral.shared(name.toLowerCase());
    },
  }));

  return (
    <>
      <div className="rl-panel px-[22px] py-[22px] lg:hidden">
        <p className="text-[18px] leading-6 font-medium text-[#f0f1f5]">{t('aff.getCode')}</p>
        <p className="mt-1.5 text-[12px] leading-5 text-[#9da2b4]">{t('aff.shareBlurb')}</p>

        <button
          type="button"
          onClick={copy}
          disabled={!code}
          aria-label={copied ? t('ref.copied') : t('ref.copyLink')}
          className={`mt-[22px] flex h-14 w-full items-center gap-3 rounded-[34px] border bg-white/5 ps-[22px] pe-[18px] text-start transition-[colors,transform] active:scale-[0.98] disabled:opacity-50 ${copied ? 'border-[#03b739]/60' : 'border-white/20'}`}
        >
          <span
            className={`min-w-0 flex-1 truncate text-[14px] leading-5 ${copied ? 'text-[#03b739]' : 'text-[#9da2b4]'}`}
          >
            {copied ? t('ref.copied') : link || '—'}
          </span>
          <span className={`shrink-0 ${copied ? 'text-[#03b739]' : 'text-[#f0f1f5]'}`}>{mark}</span>
        </button>

        <Link
          href="/referral"
          className="mt-3 flex h-12 items-center justify-center rounded-[34px] bg-[#f9d028] text-[18px] leading-7 font-medium text-[#07080a]"
        >
          {t('aff.change')}
        </Link>

        <div className="mt-5 flex items-center gap-2">
          <div className="flex">
            {shares.map(({ Mark, name, href, onClick }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={t('ref.shareOn', { name })}
                aria-disabled={!code}
                onClick={onClick}
                className="rl-glass-btn relative flex h-12 w-12 items-center justify-center rounded-full [--rl-btn-base:#121317] not-first:-ms-[18px] aria-disabled:opacity-50"
              >
                <Mark />
              </a>
            ))}
          </div>
          <p className="text-[12px] leading-5 text-[#9da2b4]">{t('ref.orShare')}</p>
        </div>
      </div>

      <div className="rl-panel flex flex-col items-center px-[calc(var(--u)*24)] pt-[calc(var(--u)*27)] pb-[calc(var(--u)*20)] text-center max-lg:hidden">
        <p className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]">
          {t('ref.referralCode')}
        </p>

        <p className={`${SECTION_HEADING} mt-[calc(var(--u)*15)]`}>{code ?? '—'}</p>

        <button
          type="button"
          onClick={copy}
          disabled={!code}
          className={`rl-field-card mt-[calc(var(--u)*11)] flex h-[calc(var(--u)*56)] w-full max-w-[calc(var(--u)*434)] items-center justify-center gap-[calc(var(--u)*5)] rounded-[calc(var(--u)*34)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium transition-[colors,transform] hover:bg-white/8 active:scale-[0.98] disabled:opacity-50 ${copied ? 'text-[#03b739]' : 'text-[#f0f1f5]'}`}
        >
          {copied ? t('ref.copied') : t('ref.copyLink')}
          {mark}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? t('ref.copied') : ''}
        </span>

        <p className="mt-[calc(var(--u)*22)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]">
          {t('ref.orShare')}
        </p>

        <div className="mt-[calc(var(--u)*12)] flex items-center gap-[calc(var(--u)*12)]">
          {shares.map(({ Mark, name, href, onClick }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={t('ref.shareOn', { name })}
              aria-disabled={!code}
              onClick={onClick}
              className="rl-glass-btn flex h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] items-center justify-center rounded-full aria-disabled:opacity-50"
            >
              <Mark />
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReferralCodeCard;
