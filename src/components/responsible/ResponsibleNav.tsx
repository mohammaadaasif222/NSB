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
  { key: 'faqs', labelKey: 'rgc.navFaqs', icon: faqsIcon, w: 19.5504, h: 19.5504 },
  { key: 'assessment', labelKey: 'rgc.navAssessment', icon: assessmentIcon, w: 21.0833, h: 16 },
  { key: 'limits', labelKey: 'rgc.navLimits', icon: limitsIcon, w: 23, h: 23 },
  // 24 rather than the 19.55 the others carry: this one exports as the whole
  // icon frame. Figma served the FAQ bubble for this slot from every asset URL
  // on the rail and the button node; the real glyph only came back from the
  // icon node's own path.
  { key: 'exclusion', labelKey: 'rgc.navExclusion', icon: exclusionIcon, w: 24, h: 24 },
  { key: 'budget', labelKey: 'rgc.navBudget', icon: budgetIcon, w: 17.8167, h: 20.8438 },
] as const satisfies readonly {
  key: string;
  labelKey: TranslationKey;
  icon: { src: string };
  w: number;
  h: number;
}[];

/** The glyph, inked from the pill's own `color`. */
const NavGlyph: FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => (
  // In em of the pill's 16px type, so it scales with the label.
  <span
    aria-hidden="true"
    className="block shrink-0 bg-current"
    style={
      {
        width: `${w / 16}em`,
        height: `${h / 16}em`,
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

/* The design's pill — 48 tall, 24 of inset, a 10px gap, the glyph in a 24 box
   and 16px type — in the page's unit like the account rail, but measured off
   its own text: the inset, gap and glyph are in `em`, and the label is the
   page's 16 or the type floor, whichever is larger. Where the floor wins on a
   scaled-down window the whole pill grows with it in proportion, and the
   rail's column grows to match (`RAIL_COLUMN`), so a long label like "Budget
   Calculator" never runs out of its pill. */
const PILL =
  'relative flex h-[3em] w-full items-center gap-[0.625em] whitespace-nowrap px-[1.5em] text-[length:max(var(--tf,11px),calc(var(--u)*16))] leading-[1.5]';

/** The rail's column on desktop: the design's 228, or the pill's own size at the type floor. */
export const RAIL_COLUMN =
  'lg:grid-cols-[max(calc(var(--u)*228),calc(var(--tf,11px)*14.25))_minmax(0,1fr)]';

const INK_RESTING = 'text-[#9da2b4]';
const INK_SELECTED = 'text-[#ffe779]';

interface Props {
  active: ResponsibleSection;
  onSelect: (section: ResponsibleSection) => void;
  /** The sections the player may see (System config → Help Center). All when omitted. */
  visible?: readonly ResponsibleSection[];
}

const ResponsibleNav: FC<Props> = ({ active, onSelect, visible }) => {
  const { t } = useTranslation();

  // `min-w-0` is load-bearing under `lg` for the same reason it is in
  // AccountNav: without it the grid column grows to the full width of every
  // tab and the page scrolls sideways instead of the strip scrolling itself.
  return (
    <nav
      className="flex min-w-0 flex-col gap-[14px] lg:h-full lg:gap-[calc(var(--u)*20)]"
      aria-label={t('rgc.title')}
    >
      {/* Onest Regular 20/28 in Gray 4 — the design's own, not the white/80 at
          18 this carried before.

          On one line, as drawn, sized with the rail. */}
      <h2 className="hidden text-[length:max(calc(var(--tf,11px)*1.25),calc(var(--u)*20))] leading-[1.4] font-normal whitespace-nowrap text-[#9da2b4] lg:block">
        {t('rgc.title')}
      </h2>

      {/* 12 between pills — the design stacks them on a 60px pitch at 48 tall. */}
      <ul className="scrollbar-none flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-[calc(var(--u)*12)] lg:overflow-visible lg:pb-0">
        {RESPONSIBLE_SECTIONS.filter(({ key }) => !visible || visible.includes(key)).map(
          ({ key, labelKey, icon, w, h }) => {
            const selected = key === active;
            return (
              <li key={key} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-current={selected ? 'page' : undefined}
                  className={`${PILL} ${
                    selected
                      ? `rl-rail-row-active rl-rail-glow font-rubik font-medium ${INK_SELECTED}`
                      : `rl-rail-row hover:rl-rail-row-active font-normal ${INK_RESTING} hover:font-rubik hover:font-medium hover:text-[#ffe779]`
                  }`}
                >
                  <NavGlyph src={icon.src} w={w} h={h} />
                  {t(labelKey)}
                </button>
              </li>
            );
          }
        )}
      </ul>
    </nav>
  );
};

export default ResponsibleNav;
