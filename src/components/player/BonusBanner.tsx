import { useState, type FC } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import bonusArt from '@/assets/bonus-art.webp';
import bonusArtMobile from '@/assets/bonus-art-mobile.webp';
import { CheckIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';

/**
 * The welcome-offer strip: copy on the left, artwork fading in from the
 * right over the design's darker glass.
 *
 * The phone and desktop layouts crop the artwork differently, so each gets
 * its own export rather than one image squeezed into both boxes. From lg up
 * the banner keeps the design's 1548×216 shape and sizes its copy in units of
 * its own width, so a narrower column gets the same banner scaled down.
 *
 * The code is the point of the banner, so it is a real control — clicking it
 * copies. `navigator.clipboard` needs a secure context and is absent over
 * plain HTTP on a LAN address, so the failure path shows the code instead of
 * silently doing nothing.
 */
const PROMO_CODE = 'WELCOME500';

/** The art's share of the banner's width, as the design lays it out. */
const ART =
  'pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[56.3%] object-cover [mask-image:linear-gradient(to_right,transparent,#000)]';

const BonusBanner: FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(t('lobby.bonus.promoCode', { code: PROMO_CODE }));
    }
  };

  return (
    <section
      className={`rl-glass-deep @container relative isolate h-[146px] overflow-hidden rounded-[34px] lg:aspect-[1548/216] lg:h-auto lg:rounded-[calc(var(--u)*34)] ${className}`}
    >
      <Image src={bonusArtMobile} alt="" sizes="60vw" className={`${ART} lg:hidden`} />
      <Image src={bonusArt} alt="" sizes="56vw" className={`${ART} hidden lg:block`} />

      <div className="relative px-[21px] pt-[14px] lg:px-[1.87cqw] lg:pt-[1.94cqw]">
        <p className="text-[10px] leading-[13px] text-[#7c8799] lg:text-[max(13px,1.03cqw)] lg:leading-[1.5]">
          {t('lobby.bonus.eyebrow')}
        </p>
        <h2 className="mt-[9px] max-w-[150px] text-[16px] font-medium leading-6 tracking-[-0.02em] text-[#f2f5f9] lg:mt-[0.9cqw] lg:max-w-none lg:text-[max(20px,2.07cqw)] lg:font-bold lg:leading-[1.25]">
          {t('dash.unlockBonus')}
        </h2>

        <button
          type="button"
          onClick={copy}
          title={t('lobby.bonus.copy', { code: PROMO_CODE })}
          className="mt-3 inline-flex h-9 items-center gap-2.5 rounded-[20px] border border-dashed border-[#ffe779] bg-[#13171f] px-[13px] text-[12px] font-medium leading-5 text-[#ffe779] transition-colors hover:bg-[#ffe779]/10 lg:mt-[1.74cqw] lg:h-[max(32px,2.91cqw)] lg:rounded-[12px] lg:px-[max(12px,1.1cqw)] lg:text-[max(12px,1.03cqw)] lg:font-normal lg:leading-[1.5]"
        >
          {copied && <CheckIcon size={14} />}
          {PROMO_CODE}
        </button>
      </div>
    </section>
  );
};

export default BonusBanner;
