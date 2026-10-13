import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import RgModalShell from '@/components/modals/responsible/RgModalShell';
import { ASSESSMENT_QUESTIONS } from '@/components/responsible/rgContent';
import { CheckIcon } from '@/components/icons';

/**
 * The self-assessment questionnaire.
 *
 * "Tick what applies" rather than yes/no per question: the list is ten items
 * long and the point is that somebody finishes it. An untouched box is not
 * recorded as a denial — the result copy talks about what was ticked, never
 * about what was left.
 *
 * The twelve-month window is the one the recognised screens use, and it is
 * stated in the lead so the answers mean the same thing for everyone.
 */
interface Props {
  onClose: () => void;
  onSubmit: (score: number) => void;
  saving?: boolean;
}

const SelfAssessmentModal: FC<Props> = ({ onClose, onSubmit, saving = false }) => {
  const { t } = useTranslation();
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  const toggle = (id: string): void =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <RgModalShell
      title={t('rgc.assessmentTitle')}
      lead={t('rgc.assessmentModalLead')}
      onClose={onClose}
      onSubmit={() => onSubmit(ticked.size)}
      submitLabel={t('rgc.assessmentSeeResult')}
      loading={saving}
      scrollBody
    >
      <ul className="space-y-2">
        {ASSESSMENT_QUESTIONS.map((q, index) => {
          const on = ticked.has(q.id);
          return (
            <li key={q.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4 ${
                  on
                    ? 'border-[#fcd535]/45 bg-[#fcd535]/8'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(q.id)}
                  className="sr-only"
                />

                {/* Drawn rather than native so the box matches the section's
                    glass; the real input stays in the DOM for a11y and keys. */}
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    on
                      ? 'border-[#fcd535] bg-[#fcd535] text-[#111216]'
                      : 'border-white/25 bg-transparent'
                  }`}
                >
                  {on && <CheckIcon size={13} strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1 text-sm leading-6 text-[#f0f1f5]">
                  <span className="me-1.5 text-[#9da2b4] tabular-nums">{index + 1}.</span>
                  {t(q.textKey)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs leading-5 text-[#9da2b4]">{t('rgc.assessmentDisclaimer')}</p>
    </RgModalShell>
  );
};

export default SelfAssessmentModal;
