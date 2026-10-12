import type { ExclusionPeriod, LimitKind } from '@/types/responsible';
import type { TranslationKey } from '@/i18n/locales';

/**
 * Everything the Responsible Gambling section says.
 *
 * Held here rather than inside the sections, on the same principle as
 * `footerContent.ts`: rewording a question, adding a support organisation or
 * changing the exclusion ladder is an edit to this file and touches no markup.
 *
 * Every piece of display text is a `TranslationKey` from the `rgc.` module
 * (`src/i18n/modules/rg.ts`) rather than English, and goes through `t()` where
 * it is rendered. Ids, values and hrefs are unchanged.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  BEFORE THIS GOES LIVE — two things need a compliance decision, not a
 *  developer one. Both are marked REVIEW below:
 *
 *    1. SUPPORT_ORGS must carry whatever resource your licensing jurisdiction
 *       mandates. The four here are genuine international services, but they
 *       are not a substitute for the one your licence names.
 *    2. The exclusion ladder and the cooling-off period must match the terms
 *       your licence requires. The values here are the common defaults.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ==================================================================== */
/* Limits                                                                */
/* ==================================================================== */

/**
 * REVIEW: 24 hours is the usual cooling-off before a raised limit applies.
 *
 * The asymmetry is the entire point of the feature: a player who wants less
 * exposure gets it immediately, and a player who wants more has to still want
 * it tomorrow. A limit that can be raised in the moment is not a limit.
 */
export const LIMIT_INCREASE_COOLING_OFF_HOURS = 24;

export interface LimitDefinition {
  kind: LimitKind;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Currency limits take an amount; `session` takes whole minutes. */
  unit: 'currency' | 'minutes';
}

export const LIMIT_DEFINITIONS: readonly LimitDefinition[] = [
  {
    kind: 'deposit',
    labelKey: 'rgc.limitDepositLabel',
    descriptionKey: 'rgc.limitDepositDesc',
    unit: 'currency',
  },
  {
    kind: 'loss',
    labelKey: 'rgc.limitLossLabel',
    descriptionKey: 'rgc.limitLossDesc',
    unit: 'currency',
  },
  {
    kind: 'wager',
    labelKey: 'rgc.limitWagerLabel',
    descriptionKey: 'rgc.limitWagerDesc',
    unit: 'currency',
  },
  {
    kind: 'session',
    labelKey: 'rgc.limitSessionLabel',
    descriptionKey: 'rgc.limitSessionDesc',
    unit: 'minutes',
  },
];

/**
 * The symbol money is shown in.
 *
 * A single constant because it is a placeholder: once limits are wired, this
 * has to come from the player's display currency (`WalletContext` already
 * resolves one) rather than being assumed. Shown beside a figure the player
 * is about to commit to, so guessing wrong is not cosmetic.
 */
export const DISPLAY_CURRENCY_SYMBOL = '$';

export const LIMIT_PERIOD_LABELS: Record<string, TranslationKey> = {
  daily: 'rgc.periodPerDay',
  weekly: 'rgc.periodPerWeek',
  monthly: 'rgc.periodPerMonth',
};

/* ==================================================================== */
/* Self-exclusion                                                        */
/* ==================================================================== */

export interface ExclusionOption {
  value: ExclusionPeriod;
  labelKey: TranslationKey;
  /** Shown under the label so the weight of the choice is legible. */
  noteKey: TranslationKey;
  /**
   * Long exclusions ask the player to type a confirmation phrase. A single
   * mis-click should not be able to close an account for five years.
   */
  requiresTypedConfirmation?: boolean;
}

/** REVIEW: confirm this ladder matches your licence conditions. */
export const EXCLUSION_OPTIONS: readonly ExclusionOption[] = [
  // "24 Hours Cooldown" is the design's own name for this one — it heads the
  // Step 1 card and the confirm dialog with it, so the label carries it rather
  // than each call site re-wording it.
  { value: '24h', labelKey: 'rgc.optCooldown', noteKey: 'rgc.noteCooldown' },
  { value: '7d', labelKey: 'rgc.opt7d', noteKey: 'rgc.note7d' },
  { value: '30d', labelKey: 'rgc.opt30d', noteKey: 'rgc.note30d' },
  { value: '3m', labelKey: 'rgc.opt3m', noteKey: 'rgc.noteFullPeriod' },
  { value: '6m', labelKey: 'rgc.opt6m', noteKey: 'rgc.noteFullPeriod' },
  { value: '1y', labelKey: 'rgc.opt1y', noteKey: 'rgc.noteFullPeriod' },
  {
    value: '5y',
    labelKey: 'rgc.opt5y',
    noteKey: 'rgc.note5y',
    requiresTypedConfirmation: true,
  },
  {
    value: 'permanent',
    labelKey: 'rgc.optPermanent',
    noteKey: 'rgc.notePermanent',
    requiresTypedConfirmation: true,
  },
];

/**
 * What a player types to confirm a long or permanent exclusion.
 *
 * Shown in the player's language. The English phrase is always accepted too,
 * so a player who has been reading the English copy is not locked out.
 */
export const EXCLUSION_CONFIRM_PHRASE_KEY: TranslationKey = 'rgc.confirmPhrase';
export const EXCLUSION_CONFIRM_PHRASE_FALLBACK = 'EXCLUDE ME';

/** The facts a player is owed before they confirm. Nothing here is softened. */
export const EXCLUSION_TERMS: readonly TranslationKey[] = [
  'rgc.term1',
  'rgc.term2',
  'rgc.term3',
  'rgc.term4',
  'rgc.term5',
  'rgc.term6',
];

/* ==================================================================== */
/* Self-assessment                                                       */
/* ==================================================================== */

/**
 * A reflection tool, not a clinical instrument.
 *
 * These cover the same ground the recognised screens do — chasing, borrowing,
 * concealment, tolerance, and the effect on money, health and the people
 * around you. They are written as plain yes/no questions rather than copied
 * from a scored instrument, because presenting a modified instrument under
 * its own name would misrepresent what the score means.
 *
 * Nothing here diagnoses anything, and the result copy says so.
 */
export interface AssessmentQuestion {
  id: string;
  textKey: TranslationKey;
}

export const ASSESSMENT_QUESTIONS: readonly AssessmentQuestion[] = [
  { id: 'q1', textKey: 'rgc.quizQ1' },
  { id: 'q2', textKey: 'rgc.quizQ2' },
  { id: 'q3', textKey: 'rgc.quizQ3' },
  { id: 'q4', textKey: 'rgc.quizQ4' },
  { id: 'q5', textKey: 'rgc.quizQ5' },
  { id: 'q6', textKey: 'rgc.quizQ6' },
  { id: 'q7', textKey: 'rgc.quizQ7' },
  { id: 'q8', textKey: 'rgc.quizQ8' },
  { id: 'q9', textKey: 'rgc.quizQ9' },
  { id: 'q10', textKey: 'rgc.quizQ10' },
];

export interface AssessmentBandCopy {
  headingKey: TranslationKey;
  bodyKey: TranslationKey;
  /** Surfaces the support links under the result. */
  urgeSupport: boolean;
}

export const ASSESSMENT_BANDS: Record<'low' | 'moderate' | 'high', AssessmentBandCopy> = {
  low: {
    headingKey: 'rgc.bandLowHeading',
    bodyKey: 'rgc.bandLowBody',
    urgeSupport: false,
  },
  moderate: {
    headingKey: 'rgc.bandModerateHeading',
    bodyKey: 'rgc.bandModerateBody',
    urgeSupport: true,
  },
  high: {
    headingKey: 'rgc.bandHighHeading',
    bodyKey: 'rgc.bandHighBody',
    urgeSupport: true,
  },
};

/** Where the bands fall, out of `ASSESSMENT_QUESTIONS.length`. */
export const ASSESSMENT_THRESHOLDS = { moderate: 1, high: 4 } as const;

/* ==================================================================== */
/* Support                                                               */
/* ==================================================================== */

/**
 * REVIEW — COMPLIANCE.
 *
 * These four are real, independent, free and international, which is why they
 * are safe to ship as a starting point. They are NOT a substitute for the
 * resource your licence requires you to display, which depends on where you
 * are licensed and where the player is.
 *
 * No telephone numbers: helpline numbers differ by country and change, and a
 * number that rings out is worse than a link that works. Each site below
 * routes a visitor to the right local service.
 */
export interface SupportOrg {
  /** The organisation's own name — shown as-is in every language. */
  name: string;
  descriptionKey: TranslationKey;
  href: string;
}

export const SUPPORT_ORGS: readonly SupportOrg[] = [
  {
    name: 'Gambling Therapy',
    descriptionKey: 'rgc.orgGamblingTherapy',
    href: 'https://www.gamblingtherapy.org/',
  },
  {
    name: 'Gamblers Anonymous',
    descriptionKey: 'rgc.orgGamblersAnonymous',
    href: 'https://www.gamblersanonymous.org/',
  },
  {
    name: 'GamCare',
    descriptionKey: 'rgc.orgGamCare',
    href: 'https://www.gamcare.org.uk/',
  },
  {
    name: 'BeGambleAware',
    descriptionKey: 'rgc.orgBeGambleAware',
    href: 'https://www.begambleaware.org/',
  },
];

/* ==================================================================== */
/* FAQs                                                                  */
/* ==================================================================== */

export interface RgFaq {
  question: TranslationKey;
  answer: TranslationKey;
}

export const RG_FAQS: readonly RgFaq[] = [
  // The first answer is verbatim from the design — the one it actually writes out.
  { question: 'rgc.faqQ1', answer: 'rgc.faqA1' },
  { question: 'rgc.faqQ2', answer: 'rgc.faqA2' },
  { question: 'rgc.faqQ3', answer: 'rgc.faqA3' },
  { question: 'rgc.faqQ4', answer: 'rgc.faqA4' },
  { question: 'rgc.faqQ5', answer: 'rgc.faqA5' },
  { question: 'rgc.faqQ6', answer: 'rgc.faqA6' },
  { question: 'rgc.faqQ7', answer: 'rgc.faqA7' },
  { question: 'rgc.faqQ8', answer: 'rgc.faqA8' },
  { question: 'rgc.faqQ9', answer: 'rgc.faqA9' },
  { question: 'rgc.faqQ10', answer: 'rgc.faqA10' },
  { question: 'rgc.faqQ11', answer: 'rgc.faqA11' },
  { question: 'rgc.faqQ12', answer: 'rgc.faqA12' },
];

/* ==================================================================== */
/* Budget calculator                                                     */
/* ==================================================================== */

export interface BudgetFieldDef {
  key: keyof import('@/types/responsible').BudgetInput;
  labelKey: TranslationKey;
  hintKey: TranslationKey;
  /** Income is added; everything else is subtracted. */
  kind: 'income' | 'outgoing';
}

export const BUDGET_FIELDS: readonly BudgetFieldDef[] = [
  {
    key: 'income',
    labelKey: 'rgc.budgetFieldIncome',
    hintKey: 'rgc.budgetFieldIncomeHint',
    kind: 'income',
  },
  {
    key: 'housing',
    labelKey: 'rgc.budgetFieldHousing',
    hintKey: 'rgc.budgetFieldHousingHint',
    kind: 'outgoing',
  },
  {
    key: 'utilities',
    labelKey: 'rgc.budgetFieldUtilities',
    hintKey: 'rgc.budgetFieldUtilitiesHint',
    kind: 'outgoing',
  },
  {
    key: 'food',
    labelKey: 'rgc.budgetFieldFood',
    hintKey: 'rgc.budgetFieldFoodHint',
    kind: 'outgoing',
  },
  {
    key: 'transport',
    labelKey: 'rgc.budgetFieldTransport',
    hintKey: 'rgc.budgetFieldTransportHint',
    kind: 'outgoing',
  },
  {
    key: 'debts',
    labelKey: 'rgc.budgetFieldDebts',
    hintKey: 'rgc.budgetFieldDebtsHint',
    kind: 'outgoing',
  },
  {
    key: 'savings',
    labelKey: 'rgc.budgetFieldSavings',
    hintKey: 'rgc.budgetFieldSavingsHint',
    kind: 'outgoing',
  },
  {
    key: 'other',
    labelKey: 'rgc.budgetFieldOther',
    hintKey: 'rgc.budgetFieldOtherHint',
    kind: 'outgoing',
  },
];
