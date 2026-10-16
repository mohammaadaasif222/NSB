import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { RG_FAQS } from '@/components/responsible/rgContent';
import { ChevronDownIcon } from '@/components/icons';
import type { HelpItem } from '@/components/responsible/helpContent';

/**
 * The questions, on native `<details>`.
 *
 * No JavaScript behind the accordion: it is keyboard operable, reads correctly
 * to a screen reader, and works before hydration — which matters more here
 * than anywhere else in the app, because someone reaching this page on a bad
 * connection is likely to be looking for the part about getting help.
 *
 * The first row is open on arrival, as the design draws it, so the panel does
 * not open as twelve identical closed bars with nothing to read.
 *
 * Background is written as plain utilities rather than `rl-field-card` even
 * though the resting value is identical to it. The open row has to win over
 * the resting one, and a custom utility against a variant utility is a bet on
 * which order Tailwind happens to emit them in; two plain utilities are not.
 */
/**
 * `items` are the FAQs written in the console (question as title, answer as
 * text). With none, the built-in copy is used.
 */
const FaqSection: FC<{ items?: readonly HelpItem[] }> = ({ items }) => {
  const { t } = useTranslation();

  const faqs: { key: string; question: string; answer: string }[] =
    items && items.length > 0
      ? items.map((i) => ({ key: i.id, question: i.title, answer: i.content }))
      : RG_FAQS.map((faq) => ({
          key: faq.question,
          question: t(faq.question),
          answer: t(faq.answer),
        }));

  return (
    <div>
      <h2 className="hidden sm:block sm:rl-h-section">{t('rgc.faqsTitle')}</h2>

      {/* 60 tall closed, 16 apart, 34 of radius — the design's own row. */}
      <div className="space-y-4 sm:mt-6">
        {faqs.map((faq, i) => (
          <details
            key={faq.key}
            open={i === 0}
            className="group overflow-hidden rounded-[34px] bg-white/5 open:bg-white/10"
          >
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 sm:h-15 sm:min-h-0 sm:px-6 sm:py-0 [&::-webkit-details-marker]:hidden">
              {/* No hover ink. The design gives this one colour in every state
                  it draws, and a question that turns yellow under the cursor
                  was an invention of the first pass. */}
              <h3 className="min-w-0 text-[16px] leading-6 font-normal text-[#f0f1f5] sm:rl-h-card sm:tracking-normal">
                {faq.question}
              </h3>
              <ChevronDownIcon
                size={22}
                className="shrink-0 text-[#cccccc] transition-transform duration-200 group-open:rotate-180"
              />
            </summary>

            {/* The answer starts 2px under the 60px band and closes 25 above
                the card's foot — the design's 170 for a three-line answer. */}
            <div className="px-4 pt-0.5 pb-5 sm:px-6 sm:pb-6.25">
              <p className="pe-1 text-[12px] leading-5 whitespace-pre-line text-[#9da2b4] sm:text-base sm:leading-7 sm:font-medium 2xl:text-[18px]">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
