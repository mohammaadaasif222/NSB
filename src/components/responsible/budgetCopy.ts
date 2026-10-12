import type { TranslationKey } from '@/i18n/locales';

/**
 * The budget calculator's two columns, as the design lays them out.
 *
 * This replaced a single list of one income and seven outgoings. The design
 * splits it into four income lines and four expense lines, each column closing
 * with its own total.
 *
 * `key` is the field id; `labelKey` is the text shown, passed through `t()`.
 *
 * Nothing here is sent anywhere — see the note in BudgetCalculatorSection.
 */

export interface BudgetLine {
  key: string;
  labelKey: TranslationKey;
}

export const INCOME_LINES: readonly BudgetLine[] = [
  { key: 'wages', labelKey: 'rgc.budgetWages' },
  { key: 'pensions', labelKey: 'rgc.budgetPensions' },
  { key: 'benefits', labelKey: 'rgc.budgetBenefits' },
  { key: 'otherIncome', labelKey: 'rgc.budgetOtherIncome' },
];

export const EXPENSE_LINES: readonly BudgetLine[] = [
  { key: 'rent', labelKey: 'rgc.budgetRent' },
  { key: 'utilities', labelKey: 'rgc.budgetUtilities' },
  { key: 'loans', labelKey: 'rgc.budgetLoans' },
  { key: 'otherExpenses', labelKey: 'rgc.budgetOtherExpenses' },
];

export const BUDGET_KEYS: readonly string[] = [
  ...INCOME_LINES.map((l) => l.key),
  ...EXPENSE_LINES.map((l) => l.key),
];
