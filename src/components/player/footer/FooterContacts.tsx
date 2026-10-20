import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CONTACTS } from '@/components/player/footer/footerContent';

/**
 * Who to write to.
 *
 * Spread rather than gridded: the design spaces the four by their own widths,
 * so the gaps between them are even where their column starts would not be.
 * `justify-between` is the same rule, and it is what keeps the last address
 * flush with the card's right padding at any width.
 *
 * The row forms well below the width the design's own type would need — four
 * 20px addresses want about 1060px before the gaps even start, and the shell
 * leaves a 1280 laptop around 1020. Rather than break the shape there, the
 * parts shrink: a 40px disc instead of 48, and a 16px address instead of 20,
 * both of which grow to the design's sizes once there is room. A 2×2 block on
 * every laptop in use is a bigger departure than a smaller address is.
 *
 * Below the row it really is a pair, and below that a column.
 */
const FooterContacts: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="rl-panel px-6 py-7 @xl:px-8 @7xl:px-12.5 @7xl:py-12">
      {/* `gap` is only the floor here — `justify-between` spreads whatever is
        left over — so keeping it small costs nothing at the design's width and
        buys the row its last few pixels at the width where it first forms. */}
      <div className="grid gap-7 @xl:grid-cols-2 @xl:gap-x-6 @foot-wide:flex @foot-wide:justify-between @foot-wide:gap-2.5 @7xl:gap-3">
        {CONTACTS.map(({ Icon, label, email }) => (
          <a
            key={email}
            href={`mailto:${email}`}
            className="group flex min-w-0 items-start gap-2.5 @7xl:gap-3"
          >
            {/* A hair below the label's cap line, which is where the design
              lands it — not centred on the two lines it sits beside. */}
            <span className="rl-pill rl-pill-hover mt-px flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f0f1f5] @7xl:h-12 @7xl:w-12">
              <Icon />
            </span>

            <span className="flex min-w-0 flex-col gap-1.5 @7xl:gap-2.5">
              <span className="text-xs leading-4 text-[#9da2b4] @7xl:text-sm @7xl:leading-5">
                {t(label)}
              </span>
              {/* The design's 20px only once the row has room for it. Narrower
                than that, 20px runs `bugbounty@xyzlife.top` into an ellipsis,
                and half an address is worse than a small one. */}
              <span className="truncate text-base leading-6 font-semibold text-[#f0f1f5] transition-colors group-hover:text-white @7xl:text-xl @7xl:leading-7 @7xl:tracking-[-0.4px]">
                {email}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterContacts;
