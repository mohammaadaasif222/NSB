import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { fetchFaqs, type FaqItem } from '@/services/faqs';
import chevronRight from '@/assets/lobby/faq-chevron.svg';
import chevronDown from '@/assets/lobby/faq-chevron-down.svg';

/**
 * The lobby FAQ, laid out the two ways the design draws it.
 *
 * From lg up it is a two-pane reader: the questions as pills down a clear
 * glass column, the chosen answer large in a darker pane beside it — the
 * answers are long enough that expanding one in place would push the rest
 * of the list off the screen. On a phone there is no room beside the list, so
 * it becomes the design's accordion and the answer opens under its question.
 * The same `active` index drives both, so the two never disagree.
 *
 * The questions come from the console (CRM → FAQ). The section renders nothing
 * until they have loaded, and stays hidden when it is switched off in System
 * config (CRM), when no question is shown, or when the API cannot be reached —
 * an empty "Frequently asked questions" heading is worse than none.
 */
const FaqAccordion: FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchFaqs()
      .then((data) => {
        if (!cancelled) setItems(data.enabled ? data.faqs : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-[calc(var(--u)*15)] lg:space-y-[calc(var(--u)*40)]">
      <h2 className="text-center text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-[#f4fffb]">
        {t('dash.faqTitle')}
      </h2>

      {/* --- Phone: accordion ------------------------------------------- */}
      <ul className="space-y-[calc(var(--u)*12)] lg:hidden">
        {items.map((item, i) => {
          const open = active === i;
          return (
            <li key={item.id} className="rl-liquid rounded-[calc(var(--u)*34)]">
              <button
                type="button"
                onClick={() => setActive(open ? -1 : i)}
                aria-expanded={open}
                className="flex min-h-[calc(var(--u)*72)] w-full items-center justify-between gap-[calc(var(--u)*8)] py-[calc(var(--u)*10)] pl-[calc(var(--u)*20)] pr-[calc(var(--u)*19)] text-left text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]"
              >
                <span className="min-w-0">{item.question}</span>
                <img
                  src={chevronDown.src}
                  alt=""
                  className={`h-[calc(var(--u)*28)] w-[calc(var(--u)*28)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <p className="px-[calc(var(--u)*17)] pb-[calc(var(--u)*23)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4]">
                  {item.answer}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* --- Desktop: two panes ----------------------------------------- */}
      <div className="hidden min-h-[calc(var(--u)*521)] lg:grid lg:grid-cols-[44.4fr_55.6fr]">
        <ul className="rl-liquid space-y-[calc(var(--u)*10)] rounded-l-[calc(var(--u)*34)] p-[calc(var(--u)*20)]">
          {items.map((item, i) => (
            <li key={item.id}>
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
                <span className="min-w-0">{item.question}</span>
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
            {items[Math.min(Math.max(active, 0), items.length - 1)].answer}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
