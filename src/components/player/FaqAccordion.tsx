import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import chevronRight from '@/assets/lobby/faq-chevron.svg';
import chevronDown from '@/assets/lobby/faq-chevron-down.svg';

/**
 * Sample copy, illustrative pending real support and policy pages — the
 * amounts, timings and audit claims below are placeholders and should be
 * replaced with whatever compliance signs off on before launch.
 */
const FAQ_ITEMS: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'lobby.faq.q1', a: 'lobby.faq.a1' },
  { q: 'lobby.faq.q2', a: 'lobby.faq.a2' },
  { q: 'lobby.faq.q3', a: 'lobby.faq.a3' },
  { q: 'lobby.faq.q4', a: 'lobby.faq.a4' },
  { q: 'lobby.faq.q5', a: 'lobby.faq.a5' },
  { q: 'lobby.faq.q6', a: 'lobby.faq.a6' },
];

/**
 * The lobby FAQ, laid out the two ways the design draws it.
 *
 * From lg up it is a two-pane reader: the questions as pills down a clear
 * glass column, the chosen answer large in a darker pane beside it — the
 * answers are long enough that expanding one in place would push the rest
 * of the list off the screen. On a phone there is no room beside the list, so
 * it becomes the design's accordion and the answer opens under its question.
 * The same `active` index drives both, so the two never disagree.
 */
const FaqAccordion: FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  return (
    <section className="space-y-[calc(var(--u)*15)] lg:space-y-[calc(var(--u)*40)]">
      <h2 className="text-center text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-[#f4fffb]">
        {t('dash.faqTitle')}
      </h2>

      {/* --- Phone: accordion ------------------------------------------- */}
      <ul className="space-y-[calc(var(--u)*12)] lg:hidden">
        {FAQ_ITEMS.map((item, i) => {
          const open = active === i;
          return (
            <li key={item.q} className="rl-liquid rounded-[calc(var(--u)*34)]">
              <button
                type="button"
                onClick={() => setActive(open ? -1 : i)}
                aria-expanded={open}
                className="flex min-h-[calc(var(--u)*72)] w-full items-center justify-between gap-[calc(var(--u)*8)] py-[calc(var(--u)*10)] pl-[calc(var(--u)*20)] pr-[calc(var(--u)*19)] text-left text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]"
              >
                <span className="min-w-0">{t(item.q)}</span>
                <img
                  src={chevronDown.src}
                  alt=""
                  className={`h-[calc(var(--u)*28)] w-[calc(var(--u)*28)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <p className="px-[calc(var(--u)*17)] pb-[calc(var(--u)*23)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4]">
                  {t(item.a)}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* --- Desktop: two panes ----------------------------------------- */}
      <div className="hidden min-h-[calc(var(--u)*521)] lg:grid lg:grid-cols-[44.4fr_55.6fr]">
        <ul className="rl-liquid space-y-[calc(var(--u)*10)] rounded-l-[calc(var(--u)*34)] p-[calc(var(--u)*20)]">
          {FAQ_ITEMS.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={active === i}
                className={`flex min-h-[calc(var(--u)*72)] w-full items-center justify-between gap-[calc(var(--u)*12)] rounded-[calc(var(--u)*34)] py-[calc(var(--u)*12)] pl-[calc(var(--u)*25)] pr-[calc(var(--u)*30)] text-left transition-colors ${
                  active === i
                    ? 'rl-liquid text-[length:max(min(11px,18px),calc(var(--u)*18))] font-semibold leading-[calc(var(--u)*24)] text-[#f0f1f5]'
                    : 'text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#9da2b4] hover:bg-white/[0.04] hover:text-[#f0f1f5]'
                }`}
              >
                <span className="min-w-0">{t(item.q)}</span>
                <img
                  src={chevronRight.src}
                  alt=""
                  className="h-[calc(var(--u)*14)] w-[calc(var(--u)*14)] flex-shrink-0"
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="rl-glass-deep rounded-r-[calc(var(--u)*34)] px-[calc(var(--u)*36)] py-[calc(var(--u)*24)]">
          <p className="text-[length:max(min(11px,24px),calc(var(--u)*24))] font-medium leading-[calc(var(--u)*42)] tracking-[-0.02em] text-[#c8ccd8]">
            {t(FAQ_ITEMS[Math.max(active, 0)].a)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
