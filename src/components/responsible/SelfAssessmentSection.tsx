import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  ASSESSMENT_INTRO,
  ASSESSMENT_PROMPT,
  ASSESSMENT_REMINDER,
  ASSESSMENT_SCREEN,
} from '@/components/responsible/assessmentCopy';

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
const SelfAssessmentSection: FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="rl-h-section">{t('rgc.assessmentTitle')}</h2>

      {/* Onest Regular 20/28 in Gray 4 throughout, stepping to 18 on a laptop
          with the rest of the page's type. The questions are lines, not a list:
          the design gives them no markers and no indent, and numbering them
          would read as a score sheet, which is what this page is not. */}
      <div className="mt-5 space-y-0 text-[18px] leading-7 text-[#9da2b4] 2xl:text-[20px]">
        <p>{t(ASSESSMENT_INTRO)}</p>

        <p className="pt-7">{t(ASSESSMENT_PROMPT)}</p>

        {ASSESSMENT_SCREEN.map((question) => (
          <p key={question}>{t(question)}</p>
        ))}

        <p>{t(ASSESSMENT_REMINDER)}</p>
      </div>
    </div>
  );
};

export default SelfAssessmentSection;
