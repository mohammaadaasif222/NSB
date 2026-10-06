import { Fragment, type FC } from 'react';

import { useTranslation } from '@/context/I18nContext';

/** Zero-padded, as the design draws them — "05", not "5". */
export interface Countdown {
  day: string;
  hr: string;
  min: string;
  sec: string;
}

/**
 * The design draws this bar twice at two sizes: 330×70 on a promotion card,
 * 478×90 under the detail page's banner. Same shape, same glass, so one
 * component with the two sets of figures rather than two near-copies.
 */
const SIZES = {
  sm: {
    shell: 'rounded-[16px] p-[4px] lg:rounded-[calc(var(--u)*22)] lg:p-[calc(var(--u)*5)]',
    cellRadius: 'rounded-l-[13px] lg:rounded-l-[calc(var(--u)*18)]',
    cellRadiusEnd: 'rounded-r-[13px] lg:rounded-r-[calc(var(--u)*18)]',
    gap: 'w-[9px] lg:w-[calc(var(--u)*9)]',
    value:
      'text-[20px] leading-7 lg:text-[length:max(14px,calc(var(--u)*28))] lg:leading-[calc(var(--u)*36)]',
    label:
      'text-[11px] leading-4 lg:text-[length:max(9px,calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]',
    sep: 'text-[20px] lg:text-[length:max(14px,calc(var(--u)*28))]',
    cell: 'py-1.5',
  },
  lg: {
    shell: 'rounded-[20px] p-[5px] lg:rounded-[calc(var(--u)*32)] lg:p-[calc(var(--u)*6)]',
    cellRadius: 'rounded-l-[16px] lg:rounded-l-[calc(var(--u)*26)]',
    cellRadiusEnd: 'rounded-r-[16px] lg:rounded-r-[calc(var(--u)*26)]',
    gap: 'w-[11px] lg:w-[calc(var(--u)*14)]',
    value:
      'text-[26px] leading-9 lg:text-[length:max(18px,calc(var(--u)*40.6))] lg:leading-[calc(var(--u)*52)]',
    label:
      'text-[13px] leading-5 lg:text-[length:max(10px,calc(var(--u)*17.4))] lg:leading-[calc(var(--u)*29)]',
    sep: 'text-[26px] lg:text-[length:max(18px,calc(var(--u)*40.6))]',
    cell: 'py-[calc(var(--u)*8)]',
  },
} as const;

interface Props {
  value: Countdown;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * Four glass cells on a glass bar — days, hours, minutes, seconds.
 *
 * It does NOT tick. The figures are fixed strings carried in with the rest of
 * the placeholder copy, because nothing serves a real end time yet. Give it an
 * ISO date and run it through `useCountdown` when promotions are a real feed;
 * that hook already corrects for the gap between the server's clock and the
 * device's.
 */
const CountdownBar: FC<Props> = ({ value, size = 'sm', className = '' }) => {
  const { t } = useTranslation();
  const s = SIZES[size];

  const cells = [
    { value: value.day, label: t('promo.day') },
    { value: value.hr, label: t('promo.hr') },
    { value: value.min, label: t('promo.min') },
    { value: value.sec, label: t('promo.sec') },
  ];

  return (
    <div className={`flex items-stretch bg-white/7 ${s.shell} ${className}`}>
      {cells.map((cell, i) => (
        <Fragment key={cell.label}>
          {i > 0 && (
            <span
              className={`flex flex-shrink-0 items-center justify-center font-light text-[#f0f1f5] ${s.gap} ${s.sep}`}
            >
              :
            </span>
          )}
          <span
            className={`flex flex-1 flex-col items-center justify-center bg-white/7 ${s.cell} ${
              i === 0 ? s.cellRadius : ''
            } ${i === cells.length - 1 ? s.cellRadiusEnd : ''}`}
          >
            <span
              className={`font-medium tracking-[-0.02em] text-[#f0f1f5] tabular-nums ${s.value}`}
            >
              {cell.value}
            </span>
            <span className={`font-light text-[#9da2b4] ${s.label}`}>{cell.label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
};

export default CountdownBar;
