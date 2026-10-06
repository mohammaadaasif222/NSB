import type { CSSProperties, FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

import faqsIcon from '@/assets/responsible/nav-faqs.svg';
import assessmentIcon from '@/assets/responsible/nav-assessment.svg';
import limitsIcon from '@/assets/responsible/nav-limits.svg';
import exclusionIcon from '@/assets/responsible/nav-exclusion.svg';
import budgetIcon from '@/assets/responsible/nav-budget.svg';

/**
 * The Responsible Gambling rail.
 *
 * Same pill as the account rail — 228 wide, 48 tall, 24 of inset, a 10px gap to
 * the label — so a player arriving here from Profile does not feel they have
 * left the shell.
 *
 * The five glyphs are the design's own exports: a speech bubble, an open book,
 * a casino chip, a figure and a money bag. They were shared icons from
 * `icons.tsx` until the Figma node for this rail turned up, and none of those
 * five was the right picture.
 *
 * They are painted as masks rather than dropped in as images. Figma bakes a
 * colour into each export — and it bakes the *state* it happened to be drawn
 * in, so `nav-faqs.svg` arrives yellow because FAQ's is the selected tab in the
 * frame. A mask takes only the alpha, so one file serves both inks and the
 * artwork is used exactly as exported rather than edited to recolour it.
 */

/** Each glyph at the size the design exports it, inside the pill's 24px box. */
export const RESPONSIBLE_SECTIONS = [
  { key: 'faqs', labelKey: 'rg.navFaqs', icon: faqsIcon, w: 19.5504, h: 19.5504 },
  { key: 'assessment', labelKey: 'rg.navAssessment', icon: assessmentIcon, w: 21.0833, h: 16 },
  { key: 'limits', labelKey: 'rg.navLimits', icon: limitsIcon, w: 23, h: 23 },
  // 24 rather than the 19.55 the others carry: this one exports as the whole
  // icon frame. Figma served the FAQ bubble for this slot from every asset URL
  // on the rail and the button node; the real glyph only came back from the
  // icon node's own path.
  { key: 'exclusion', labelKey: 'rg.navExclusion', icon: exclusionIcon, w: 24, h: 24 },
  { key: 'budget', labelKey: 'rg.navBudget', icon: budgetIcon, w: 17.8167, h: 20.8438 },
] as const satisfies readonly {
  key: string;
  labelKey: TranslationKey;
  icon: { src: string };
  w: number;
  h: number;
}[];

/** The glyph, inked from the pill's own `color`. */
const NavGlyph: FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => (
  <span
    aria-hidden="true"
    className="block shrink-0 bg-current"
    style={
      {
        width: `${w}px`,
        height: `${h}px`,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      } as CSSProperties
    }
  />
);

export type ResponsibleSection = (typeof RESPONSIBLE_SECTIONS)[number]['key'];

export const isResponsibleSection = (value: unknown): value is ResponsibleSection =>
  typeof value === 'string' && RESPONSIBLE_SECTIONS.some((s) => s.key === value);

/* Matches `AccountNav`'s row at full width — 48px tall, 24px of side padding, a
   10px gap to the label, and the icon drawn at its full 24.

   Below 1536 it keeps the same 180px rail as the account one but buys the room
   out of itself. These labels are longer than that rail's: measured, "Budget
   Calculator" wants 204px of pill and has 180, and "Self-Assessment" and
   "Gambling Limits" overrun too. Tightening the insets to 12, the gap to 8 and
   the label to 15 brings the longest back to 178, so the rail stays the width
   it is everywhere else rather than this one page widening its own chrome.
   (14 of inset was measured first and left "Budget Calculator" 2px over.) */
const PILL =
  'relative flex w-full items-center gap-2 whitespace-nowrap px-3 text-[15px] leading-6 2xl:gap-2.5 2xl:px-6 2xl:text-base';

const INK_RESTING = 'text-[#9da2b4]';
const INK_SELECTED = 'text-[#ffe779]';

interface Props {
  active: ResponsibleSection;
  onSelect: (section: ResponsibleSection) => void;
}

const ResponsibleNav: FC<Props> = ({ active, onSelect }) => {
  const { t } = useTranslation();

  // `min-w-0` is load-bearing under `lg` for the same reason it is in
  // AccountNav: without it the grid column grows to the full width of every
  // tab and the page scrolls sideways instead of the strip scrolling itself.
  return (
    <nav className="flex min-w-0 flex-col gap-[14px] lg:h-full" aria-label={t('rg.title')}>
      {/* Onest Regular 20/28 in Gray 4 — the design's own, not the white/80 at
          18 this carried before.

          `nowrap` and 16 below 1536: "Responsible Gambling" is two words that
          do not fit the 180 rail a laptop gets, and it was silently wrapping to
          two lines there while the design keeps it on one. */}
      <h2 className="hidden px-1 text-[16px] leading-6 font-normal whitespace-nowrap text-[#9da2b4] lg:block 2xl:text-[20px] 2xl:leading-7">
        {t('rg.title')}
      </h2>

      {/* 12 between pills — the design stacks them on a 60px pitch at 48 tall. */}
      <ul className="scrollbar-none flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {RESPONSIBLE_SECTIONS.map(({ key, labelKey, icon, w, h }) => {
          const selected = key === active;
          return (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-current={selected ? 'page' : undefined}
                className={`${PILL} h-12 ${
                  selected
                    ? `rl-rail-row-active rl-rail-glow font-medium font-['Rubik','Onest',sans-serif] ${INK_SELECTED}`
                    : `rl-rail-row hover:rl-rail-row-active font-normal ${INK_RESTING} hover:font-medium hover:text-[#ffe779]`
                }`}
              >
                <NavGlyph src={icon.src} w={w} h={h} />
                {t(labelKey)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ResponsibleNav;
