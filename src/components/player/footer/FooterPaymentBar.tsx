import { useEffect, useState, type FC, type ReactElement } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { PAYMENT_MARK } from '@/constants/cdn';
import visa from '@/assets/footer/pay-visa.png';
import applePay from '@/assets/footer/pay-applepay.svg';
import googlePay from '@/assets/footer/pay-googlepay.svg';
import eighteenPlus from '@/assets/footer/18plus.svg';
import { useTranslation } from '@/context/I18nContext';
import { fetchFooterPaymentMethods, type FooterPaymentMethod } from '@/services/footerPayments';

/**
 * The band across the foot of the sitemap card.
 *
 * The marks are the issuers' own artwork, exported from the design rather than
 * drawn here: each is a trademark, and a hand-approximated Visa is both wrong
 * and not ours to invent. Every one carries the width and height the design
 * gives it — they are not a uniform set, and scaling them to a common box would
 * stretch Google's and squash Apple's.
 */
const MARKS: Record<
  FooterPaymentMethod,
  { src: StaticImageData; label: string; w: number; h: number }
> = {
  visa: { src: visa, label: 'Visa', w: 50, h: 31 },
  applepay: { src: applePay, label: 'Apple Pay', w: 50, h: 21 },
  googlepay: { src: googlePay, label: 'Google Pay', w: 56, h: 23 },
  paypal: { src: PAYMENT_MARK.paypal, label: 'PayPal', w: 50, h: 31 },
  ebay: { src: PAYMENT_MARK.ebay, label: 'eBay', w: 50, h: 31 },
  mastercard: { src: PAYMENT_MARK.mastercard, label: 'Mastercard', w: 50, h: 31 },
  cirrus: { src: PAYMENT_MARK.cirrus, label: 'Cirrus', w: 50, h: 31 },
};

const useFooterPaymentMethods = (): FooterPaymentMethod[] => {
  const [methods, setMethods] = useState<FooterPaymentMethod[]>([]);

  useEffect(() => {
    let active = true;
    void fetchFooterPaymentMethods().then((rows) => {
      if (active) setMethods(rows.filter((method) => MARKS[method]));
    });
    return () => {
      active = false;
    };
  }, []);

  return methods;
};

/** A title over its caption — used at both ends of the band. */
const Note: FC<{ title: string; caption: string }> = ({ title, caption }) => (
  <span className="flex flex-col">
    <span className="text-sm leading-5 font-medium text-[#f0f1f5] @7xl:text-base @7xl:leading-6">
      {title}
    </span>
    <span className="text-xs leading-4 text-[#9da2b4] @7xl:text-sm @7xl:leading-5">{caption}</span>
  </span>
);

/** The hairline between zones. Dropped once the band stops being one row. */
const Rule = (): ReactElement => (
  <span className="hidden h-[29px] w-px shrink-0 bg-[#6a7287] @foot:block" aria-hidden="true" />
);

/**
 * The band across the foot of the sitemap card.
 *
 * One row from `@foot` up, which is well below the width it would take to hold
 * the design's own spacing — the shell leaves a 1280 laptop about 1020px here,
 * and the design's zones and 24px plate gaps want 1225. What gives is the
 * spacing, not the shape: the gaps close to 10 and the zone type drops a step,
 * and the plates themselves stay 76 × 54 the whole way. A payment mark that has
 * been scaled down to fit is a payment mark nobody recognises, so if anything
 * has to go it is the air around them.
 */
const FooterPaymentBar: FC = () => {
  const { t } = useTranslation();
  const methods = useFooterPaymentMethods();

  return (
    <div className="flex flex-col items-center gap-6 bg-white/[0.07] px-6 py-7 @foot:h-22.5 @foot:flex-row @foot:justify-between @foot:gap-0 @foot:px-6 @foot:py-0 @7xl:pe-10 @7xl:ps-12.5">
      <Note title={t('lobby.footer.securePayments')} caption={t('lobby.footer.securityPriority')} />

      {methods.length > 0 && (
        <>
          <Rule />

          <div className="flex flex-wrap items-center justify-center gap-3 @foot:flex-nowrap @foot:gap-2.5 @7xl:gap-6">
            {methods.map((method) => {
              const { src, label, w, h } = MARKS[method];
              return (
                <span
                  key={method}
                  role="img"
                  aria-label={label}
                  title={label}
                  className="rl-pill flex h-[54px] w-[76px] shrink-0 items-center justify-center rounded-[14px]"
                >
                  <Image src={src} alt="" width={w} height={h} unoptimized />
                </span>
              );
            })}
          </div>
        </>
      )}

      <Rule />

      <div className="flex items-center gap-3 @7xl:gap-5.25">
        <Image
          src={eighteenPlus}
          alt=""
          width={36}
          height={36}
          unoptimized
          className="shrink-0"
          aria-hidden="true"
        />
        <Note
          title={t('lobby.footer.playResponsibly')}
          caption={t('auth.ageRequirement', { min: 18 })}
        />
      </div>
    </div>
  );
};

export default FooterPaymentBar;
