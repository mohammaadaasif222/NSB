import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ChevronDownIcon } from '@/components/icons';
import { TERMS_INTRO, TERMS_SECTIONS } from '@/components/referral/termsContent';

/**
 * The terms panel at the foot of the page.
 *
 * A real disclosure rather than the design's always-open block: the design
 * draws the chevron, and a chevron that does not fold anything is a control
 * that lies. It opens by default, so the first paint matches the design and
 * nothing is hidden from a player who does not think to click.
 *
 * `<details>` carries the open/closed state, the keyboard handling and the
 * accessible name on its own — the chevron only has to point the right way.
 */
const ReferralTerms: FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="rl-glass-edge px-5 py-5 sm:px-7 sm:py-7.5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rl-h-card text-[#f0f1f5] [&::-webkit-details-marker]:hidden">
        {t('aff.terms')}
        <ChevronDownIcon
          size={16}
          className={`shrink-0 text-white/70 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </summary>

      {/* The design sets 14px of line box on 16px text, which overlaps the
          ascenders of the line below it. Read as the intent — tightly set, not
          overlapping — and given the smallest leading that still clears them. */}
      <div className="mt-5.5 space-y-4 text-base text-[#9da2b4]">
        <p className="leading-5">{t(TERMS_INTRO)}</p>

        {TERMS_SECTIONS.map((section) => (
          <section key={section.heading} className="space-y-1">
            <h3 className="leading-5">{t(section.heading)}</h3>
            {section.points.map((point) => (
              <p key={point} className="leading-5">
                {t(point)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </details>
  );
};

export default ReferralTerms;
