import { useEffect, useMemo, type FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import { birthYears, daysInMonth, localizedMonths } from '@/utils/dob';

interface Props {
  day: string;
  month: string;
  year: string;
  onChange: (next: { day: string; month: string; year: string }) => void;
  disabled?: boolean;
  /**
   * Classes for each of the three selects. Required rather than defaulted:
   * this component is used inside two shells with quite different styling,
   * and a default would silently be wrong in one of them.
   */
  selectClassName: string;
  /**
   * Classes for the `<option>` elements. Native dropdowns fall back to system
   * colours unless the options are styled, which reads as a white popup on a
   * dark page — so both call sites set this.
   */
  optionClassName?: string;
  /** Classes for the "Day" / "Month" / "Year" placeholder rows. */
  placeholderClassName?: string;
  idPrefix?: string;
  /** Id of the element explaining the rule, announced with each select. */
  describedBy?: string;
}

/**
 * The day / month / year triple, shared by the signup form and Level 1.
 *
 * Keeps the day list honest as the month and year change — switching from
 * 31 March to February must not leave "31" selected and fail server-side.
 */
const DobSelect: FC<Props> = ({
  day,
  month,
  year,
  onChange,
  disabled = false,
  selectClassName,
  optionClassName = '',
  placeholderClassName = '',
  idPrefix = 'dob',
  describedBy,
}) => {
  const { t, locale } = useTranslation();
  const days = useMemo(() => daysInMonth(month, year), [month, year]);
  const months = useMemo(() => localizedMonths(locale), [locale]);
  const years = useMemo(() => birthYears(), []);

  useEffect(() => {
    if (day && !days.includes(day)) {
      onChange({ day: '', month, year });
    }
    // Only the available set matters here; re-running on `onChange` identity
    // would clear the day on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <select
        id={`${idPrefix}-day`}
        aria-label={t('acct.dob.dayAria')}
        aria-describedby={describedBy}
        value={day}
        disabled={disabled}
        onChange={(e) => onChange({ day: e.target.value, month, year })}
        className={selectClassName}
      >
        <option value="" className={placeholderClassName}>
          {t('acct.dob.day')}
        </option>
        {days.map((d) => (
          <option key={d} value={d} className={optionClassName}>
            {d}
          </option>
        ))}
      </select>

      <select
        id={`${idPrefix}-month`}
        aria-label={t('acct.dob.monthAria')}
        aria-describedby={describedBy}
        value={month}
        disabled={disabled}
        onChange={(e) => onChange({ day, month: e.target.value, year })}
        className={selectClassName}
      >
        <option value="" className={placeholderClassName}>
          {t('acct.dob.month')}
        </option>
        {months.map((m) => (
          <option key={m.value} value={m.value} className={optionClassName}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        id={`${idPrefix}-year`}
        aria-label={t('acct.dob.yearAria')}
        aria-describedby={describedBy}
        value={year}
        disabled={disabled}
        onChange={(e) => onChange({ day, month, year: e.target.value })}
        className={selectClassName}
      >
        <option value="" className={placeholderClassName}>
          {t('acct.dob.year')}
        </option>
        {years.map((y) => (
          <option key={y} value={y} className={optionClassName}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DobSelect;
