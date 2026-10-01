import { useState, type FC } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import bonusArt from '@/assets/bonus-home-bg.png';
import { CheckIcon } from '@/components/icons';

/**
 * The welcome-offer strip: copy on the left, artwork bleeding in from the
 * right.
 *
 * The code is the point of the banner, so it is a real control — clicking it
 * copies. `navigator.clipboard` needs a secure context and is absent over
 * plain HTTP on a LAN address, so the failure path selects the text instead of
 * silently doing nothing.
 */
const PROMO_CODE = 'WELCOME500';

const BonusBanner: FC = () => {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(`Promo code: ${PROMO_CODE}`);
    }
  };

  return (
    <section className="rl-glass relative isolate flex min-h-[118px] items-center overflow-hidden rounded-2xl">
      <Image
        src={bonusArt}
        alt=""
        aria-hidden="true"
        sizes="(max-width: 640px) 100vw, 60vw"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[62%] object-cover object-center [mask-image:linear-gradient(to_right,transparent,#000_58%)] sm:w-[52%]"
      />

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-[11px] text-white/45">Limited-time offer</p>
        <h2 className="mt-1 text-[19px] font-semibold text-white sm:text-[22px]">
          Unlock your welcome bonus
        </h2>

        <button
          type="button"
          onClick={copy}
          title={`Copy ${PROMO_CODE}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#fcd535]/55 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.06em] text-[#fcd535] transition-colors hover:border-[#fcd535] hover:bg-[#fcd535]/10"
        >
          {copied && <CheckIcon size={12} />}
          {PROMO_CODE}
        </button>
      </div>
    </section>
  );
};

export default BonusBanner;
