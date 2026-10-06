import { useMemo, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { DISPLAY_CURRENCY_SYMBOL } from '@/components/responsible/rgContent';
import {
  BUDGET_KEYS,
  EXPENSE_LINES,
  INCOME_LINES,
  type BudgetLine,
} from '@/components/responsible/budgetCopy';

/**
 * Budget calculator.
 *
 * Runs entirely in the browser — nothing is submitted, stored or sent. A player
 * will not type their real rent into a gambling site that looks like it is
 * keeping the number, and we should not want it.
 *
 * It stops at "here is what is left". It does not suggest a gambling budget and
 * does not offer to set the leftover as a deposit limit: a tool that recommends
 * an amount to gamble is doing the opposite of its job.
 */
type Amounts = Record<string, string>;

const EMPTY: Amounts = Object.fromEntries(BUDGET_KEYS.map((k) => [k, '']));

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (n: number): string =>
  `${DISPLAY_CURRENCY_SYMBOL}${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* 56 tall, 34 of radius, white 5% on a 0.2 edge — the design's own field. */
const FIELD =
  'rl-field-card h-14 w-full rounded-[34px] border border-white/20 px-6.75 text-[18px] leading-7 text-[#f0f1f5] outline-none placeholder:text-[#9ca3af] focus-visible:border-white/35';

/** A label with its running figure, then the box you type in. */
const Line: FC<{
  line: BudgetLine;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}> = ({ line, value, onChange, readOnly = false }) => {
  const id = `budget-${line.key}`;

  return (
    <div className="pt-3.75">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-[18px] leading-7 text-[#b3bec1]">
          {line.label}
        </label>
        <span className="shrink-0 text-[18px] leading-7 text-[#b3bec1] tabular-nums">
          {money(num(value))}
        </span>
      </div>

      <div className="pt-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="0.00"
          className={`${FIELD} tabular-nums ${readOnly ? 'cursor-default text-[#9da2b4]' : ''}`}
        />
      </div>
    </div>
  );
};

const BudgetCalculatorSection: FC = () => {
  const { t } = useTranslation();
  const [amounts, setAmounts] = useState<Amounts>(EMPTY);

  const set = (key: string, v: string): void => setAmounts((a) => ({ ...a, [key]: v }));

  const totals = useMemo(() => {
    const income = INCOME_LINES.reduce((sum, l) => sum + num(amounts[l.key] ?? ''), 0);
    const expenses = EXPENSE_LINES.reduce((sum, l) => sum + num(amounts[l.key] ?? ''), 0);
    return { income, expenses, left: income - expenses };
  }, [amounts]);

  /* The totals are shown in the same box as the entries, as the design draws
     them — but read-only. A total you can type over is a total that can
     disagree with the four lines above it. */
  const totalLine = (key: string, label: string): BudgetLine => ({ key, label });

  return (
    <div>
      <h2 className="rl-h-section">{t('rg.budgetTitle')}</h2>

      {/* 557 and 598 across 1196 with 41 between — two columns that become one
          when the panel can no longer hold a readable pair. */}
      <div className="mt-2.5 grid gap-x-10.25 gap-y-8 @3xl:grid-cols-2">
        <section>
          <h3 className="text-2xl leading-8 text-[#f0f1f5]">{t('rg.budgetIncome')}</h3>

          {INCOME_LINES.map((line) => (
            <Line
              key={line.key}
              line={line}
              value={amounts[line.key] ?? ''}
              onChange={(v) => set(line.key, v)}
            />
          ))}

          <Line
            line={totalLine('totalIncome', t('rg.budgetTotalIncome'))}
            value={totals.income.toFixed(2)}
            readOnly
          />
        </section>

        <section>
          <h3 className="text-2xl leading-8 text-[#f0f1f5]">{t('rg.budgetExpenses')}</h3>

          {EXPENSE_LINES.map((line) => (
            <Line
              key={line.key}
              line={line}
              value={amounts[line.key] ?? ''}
              onChange={(v) => set(line.key, v)}
            />
          ))}

          <Line
            line={totalLine('totalExpenses', t('rg.budgetTotalExpenses'))}
            value={totals.expenses.toFixed(2)}
            readOnly
          />
        </section>
      </div>

      <hr className="mt-6.25 border-white/10" />

      <div className="rl-field-card mt-2.75 rounded-[34px] border border-white/20 py-4 ps-6.75 pe-4">
        <p className="text-[18px] leading-6 font-semibold text-[#f0f1f5]">
          {t('rg.budgetDisposable')}
        </p>
        <p className="mt-3 text-[32px] leading-10 tracking-[-0.64px] text-[#9da2b4] tabular-nums">
          {totals.left === 0 ? '0' : money(totals.left)}
        </p>
      </div>
    </div>
  );
};

export default BudgetCalculatorSection;
