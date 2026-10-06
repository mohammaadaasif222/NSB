/**
 * The budget calculator's two columns, as the design lays them out.
 *
 * This replaced a single list of one income and seven outgoings. The design
 * splits it into four income lines and four expense lines, each column closing
 * with its own total.
 *
 * Nothing here is sent anywhere — see the note in BudgetCalculatorSection.
 */

export interface BudgetLine {
  key: string;
  label: string;
}

export const INCOME_LINES: readonly BudgetLine[] = [
  { key: 'wages', label: 'Wages after deductions' },
  { key: 'pensions', label: 'Pensions' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'otherIncome', label: 'Other income' },
];

export const EXPENSE_LINES: readonly BudgetLine[] = [
  { key: 'rent', label: 'Rent/mortgage' },
  { key: 'utilities', label: 'Utility bills' },
  { key: 'loans', label: 'Loans/credit' },
  { key: 'otherExpenses', label: 'Other expenses' },
];

export const BUDGET_KEYS: readonly string[] = [
  ...INCOME_LINES.map((l) => l.key),
  ...EXPENSE_LINES.map((l) => l.key),
];
