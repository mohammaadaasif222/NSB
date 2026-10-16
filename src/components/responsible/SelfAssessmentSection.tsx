import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  ASSESSMENT_INTRO,
  ASSESSMENT_PROMPT,
  ASSESSMENT_REMINDER,
  ASSESSMENT_SCREEN,
} from '@/components/responsible/assessmentCopy';
import { blocksOf, type HelpEntry } from '@/components/responsible/helpContent';

/**
 * Self-assessment.
 *
 * A read, not a quiz. The design sets the whole section as one column of 20/28
 * body copy: an explanation, the ten screening questions put to the reader, and
 * a line telling them what to do if any of them land.
 *
 * It replaced an interactive version — a modal, a score and a banded result —
 * that is not in the design. Nothing scores anything here now, which also means
 * nothing records a player's answers to a set of questions about their own
 * gambling, and that is the better of the two defaults to hold.
 */
const SelfAssessmentSection: FC<{ entry?: HelpEntry }> = ({ entry }) => {
  const { t } = useTranslation();
  const blocks = entry ? blocksOf(entry.content) : null;

  return (
    <div>
      <h2 className="text-[16px] leading-6 font-medium text-[#f0f1f5] sm:rl-h-section">
        {entry ? entry.title : t('rgc.assessmentTitle')}
      </h2>

      {/* Onest Regular 20/28 in Gray 4 throughout, stepping to 18 on a laptop
          with the rest of the page's type. The questions are lines, not a list:
          the design gives them no markers and no indent, and numbering them
          would read as a score sheet, which is what this page is not. */}
      <div className="mt-3 space-y-0 text-[12px] leading-5 text-[#9da2b4] sm:mt-5 sm:text-[18px] sm:leading-7 2xl:text-[20px]">
        {blocks ? (
          // Written in the console: a block is a group of lines, each its own
          // paragraph, with the design's 28 between groups.
          blocks.map((lines, i) => (
            <div key={i} className={i === 0 ? undefined : 'pt-5 sm:pt-7'}>
              {lines.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          ))
        ) : (
          <>
            <p>{t(ASSESSMENT_INTRO)}</p>

            <p className="pt-5 sm:pt-7">{t(ASSESSMENT_PROMPT)}</p>

            {ASSESSMENT_SCREEN.map((question) => (
              <p key={question}>{t(question)}</p>
            ))}

            <p>{t(ASSESSMENT_REMINDER)}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SelfAssessmentSection;
