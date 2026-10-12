import type { TranslationKey } from '@/i18n/locales';

/**
 * The Self-Assessment copy, exactly as the design writes it.
 *
 * These questions are the Lie/Bet-style screen used by treatment services, and
 * they are reproduced word for word rather than paraphrased: the wording is
 * what makes a screening question a screening question, and rewriting it to
 * read more nicely would change what it measures. The translations in the
 * `rgc.` module follow the same rule — faithful, sentence by sentence.
 *
 * Nothing on this page scores the answers. The design asks the reader to put
 * the questions to themselves and says what to do if any of them land — see
 * the reminder at the foot. There was an interactive version with a modal and
 * a banded result; it is not what the design draws, and it is gone.
 *
 * Each entry is a `TranslationKey`; the section passes it through `t()`.
 */

export const ASSESSMENT_INTRO: TranslationKey = 'rgc.assessIntro';

export const ASSESSMENT_PROMPT: TranslationKey = 'rgc.assessPrompt';

export const ASSESSMENT_SCREEN: readonly TranslationKey[] = [
  'rgc.assessScreen1',
  'rgc.assessScreen2',
  'rgc.assessScreen3',
  'rgc.assessScreen4',
  'rgc.assessScreen5',
  'rgc.assessScreen6',
  'rgc.assessScreen7',
  'rgc.assessScreen8',
  'rgc.assessScreen9',
  'rgc.assessScreen10',
];

export const ASSESSMENT_REMINDER: TranslationKey = 'rgc.assessReminder';
