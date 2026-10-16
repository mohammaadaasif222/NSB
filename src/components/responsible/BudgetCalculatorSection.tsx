import { useMemo, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { DISPLAY_CURRENCY_SYMBOL } from '@/components/responsible/rgContent';
import { BUDGET_KEYS, EXPENSE_LINES, INCOME_LINES } from '@/components/responsible/budgetCopy';
import { blocksOf, type HelpEntry } from '@/components/responsible/helpContent';

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

/*
 * Sizes step like the rest of the Responsible Gambling sections: the design's
 * own from 2xl (1536) up, a step down below it. On a laptop the page around it
 * is drawn at about 0.71, and at full size this form — eight 56px fields of 18px
 * type — stood twice as heavy as everything beside it.
 */

/* 56 tall, 34 of radius, white 5% on a 0.2 edge — the design's own field;
   44 tall and 15px type below 2xl. */
const FIELD =
  'rl-field-card h-11 w-full rounded-[34px] border border-white/20 px-5 text-[15px] leading-6 text-[#f0f1f5] outline-none placeholder:text-[#9ca3af] focus-visible:border-white/35 2xl:h-14 2xl:px-6.75 2xl:text-[18px] 2xl:leading-7';

/* A line's label and its running figure: the design's 18/28, 14/20 below 2xl. */
const LABEL = 'text-[14px] leading-5 text-[#b3bec1] 2xl:text-[18px] 2xl:leading-7';

/* The two column headings: 24/32, 20/28 below 2xl. */
const HEADING = 'text-[20px] leading-7 text-[#f0f1f5] 2xl:text-2xl 2xl:leading-8';

/** A label with its running figure, then the box you type in. */
const Line: FC<{
  /** The field id, also used for the label's `htmlFor`. */
  fieldKey: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}> = ({ fieldKey, label, value, onChange, readOnly = false }) => {
  const id = `budget-${fieldKey}`;

  return (
    <div className="pt-2.5 2xl:pt-3.75">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
        <span className={`shrink-0 tabular-nums ${LABEL}`}>{money(num(value))}</span>
      </div>

      <div className="pt-1.5 2xl:pt-2">
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

const BudgetCalculatorSection: FC<{ entry?: HelpEntry }> = ({ entry }) => {
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

  return (
    <div>
      <h2 className="text-[16px] leading-6 font-medium text-[#f0f1f5] sm:rl-h-section">
        {entry ? entry.title : t('rgc.budgetTitle')}
      </h2>

      {/* An optional note written in the console; absent in the design. */}
      {entry && entry.content.trim() && (
        <div className="mt-3 space-y-3 text-[15px] leading-6 text-[#9da2b4] 2xl:text-[18px] 2xl:leading-7">
          {blocksOf(entry.content).map((lines, i) => (
            <p key={i} className="whitespace-pre-line">
              {lines.join('\n')}
            </p>
          ))}
        </div>
      )}

      {/* 557 and 598 across 1196 with 41 between — two columns that become one
          when the panel can no longer hold a readable pair. */}
      <div className="mt-2 grid gap-x-8 gap-y-6 @3xl:grid-cols-2 2xl:mt-2.5 2xl:gap-x-10.25 2xl:gap-y-8">
        <section>
          <h3 className={HEADING}>{t('rgc.budgetIncome')}</h3>

          {INCOME_LINES.map((line) => (
            <Line
              key={line.key}
              fieldKey={line.key}
              label={t(line.labelKey)}
              value={amounts[line.key] ?? ''}
              onChange={(v) => set(line.key, v)}
            />
          ))}

          <Line
            fieldKey="totalIncome"
            label={t('rgc.budgetTotalIncome')}
            value={totals.income.toFixed(2)}
            readOnly
          />
        </section>

        <section>
          <h3 className={HEADING}>{t('rgc.budgetExpenses')}</h3>

          {EXPENSE_LINES.map((line) => (
            <Line
              key={line.key}
              fieldKey={line.key}
              label={t(line.labelKey)}
              value={amounts[line.key] ?? ''}
              onChange={(v) => set(line.key, v)}
            />
          ))}

          <Line
            fieldKey="totalExpenses"
            label={t('rgc.budgetTotalExpenses')}
            value={totals.expenses.toFixed(2)}
            readOnly
          />
        </section>
      </div>

      <hr className="mt-5 border-white/10 2xl:mt-6.25" />

      <div className="rl-field-card mt-2.75 rounded-[34px] border border-white/20 py-3 ps-5 pe-4 2xl:py-4 2xl:ps-6.75">
        <p className="text-[15px] leading-6 font-semibold text-[#f0f1f5] 2xl:text-[18px]">
          {t('rgc.budgetDisposable')}
        </p>
        <p className="mt-1.5 text-[24px] leading-8 tracking-[-0.48px] text-[#9da2b4] tabular-nums 2xl:mt-3 2xl:text-[32px] 2xl:leading-10 2xl:tracking-[-0.64px]">
          {totals.left === 0 ? '0' : money(totals.left)}
        </p>
      </div>
    </div>
  );
};

export default BudgetCalculatorSection;
